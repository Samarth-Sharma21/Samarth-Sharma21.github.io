import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173';
const scratch = process.env.PORTFOLIO_SCRATCH;
assert(scratch, 'Set PORTFOLIO_SCRATCH to a registered agent-scratch directory.');
const evidence = path.resolve('tasks/evidence');
await mkdir(evidence, { recursive: true });
const profile = await mkdtemp(path.join(scratch, 'browser-check-profile-'));
const checks = [];
const errors = [];
const consoleErrors = [];
const failedRequests = [];
let phase = 'startup';
let client;
let chrome;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const record = (name, condition, detail) => {
  checks.push({ name, passed: Boolean(condition), ...(detail ? { detail } : {}) });
  assert(condition, name + (detail ? ': ' + detail : ''));
  process.stdout.write('PASS ' + name + '\n');
};

class CDP {
  constructor(socket) {
    this.socket = socket;
    this.next = 0;
    this.pending = new Map();
    this.loaded = new Set();
    socket.addEventListener('message', event => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const request = this.pending.get(message.id);
        if (!request) return;
        this.pending.delete(message.id);
        clearTimeout(request.timer);
        if (message.error) request.reject(new Error(JSON.stringify(message.error)));
        else request.resolve(message.result);
      } else if (message.method === 'Page.lifecycleEvent' && message.params.name === 'load') {
        this.loaded.add(message.params.loaderId);
      } else if (message.method === 'Runtime.exceptionThrown') {
        const exception = message.params.exceptionDetails;
        errors.push({ phase, message: exception.exception?.description || exception.text });
      } else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        consoleErrors.push({ phase, message: message.params.args.map(arg => arg.description || String(arg.value)).join(' ') });
      } else if (message.method === 'Network.responseReceived') {
        const { response } = message.params;
        if (response.url.startsWith(base) && response.status >= 400) {
          failedRequests.push({ phase, url: response.url, status: response.status });
        }
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.next;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error('CDP timeout: ' + method));
      }, 15000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true, userGesture: true,
    });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
    return result.value;
  }
  close() { this.socket.close(); }
}

async function until(expression, description) {
  for (let i = 0; i < 100; i++) {
    if (await client.evaluate(expression)) return;
    await delay(100);
  }
  throw new Error('Timed out waiting for ' + description);
}

async function navigate(route) {
  phase = route;
  const { loaderId } = await client.send('Page.navigate', { url: base + route });
  if (loaderId) {
    for (let i = 0; i < 150 && !client.loaded.has(loaderId); i++) await delay(100);
    assert(client.loaded.has(loaderId), 'The requested navigation did not finish loading.');
  }
  await until(`location.href === ${JSON.stringify(base + route)} && document.readyState === 'complete' && Boolean(document.querySelector('main h1'))`, 'rendered ' + route);
  await client.evaluate('document.fonts.ready.then(() => true)');
}

async function viewport(width, height = 1000) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: width < 600,
  });
}

async function click(selector) {
  const point = await client.evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error('Missing clickable element: ' + ${JSON.stringify(selector)});
    element.scrollIntoView({block:'center', behavior:'instant'});
    const r = element.getBoundingClientRect();
    return {x:r.x + r.width/2,y:r.y + r.height/2};
  })()`);
  await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
}

async function hover(selector) {
  const point = await client.evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) throw new Error('Missing hover target: ' + ${JSON.stringify(selector)});
    element.scrollIntoView({block:'center', behavior:'instant'});
    const r = element.getBoundingClientRect();
    return {x:r.x + r.width/2,y:r.y + r.height/2};
  })()`);
  await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
  await delay(250);
}

async function key(key, code, virtualKey, modifiers = 0) {
  const event = { key, code, windowsVirtualKeyCode: virtualKey, modifiers };
  await client.send('Input.dispatchKeyEvent', { type: 'keyDown', ...event, ...(key === 'Enter' ? {text:'\r'} : {}) });
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...event });
}

async function screenshot(name, fullPage = false) {
  await client.send('Page.bringToFront');
  await client.evaluate('Promise.allSettled(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished))');
  await client.evaluate('window.scrollTo({top:0,behavior:"instant"})');
  const params = { format: 'png', captureBeyondViewport: fullPage };
  if (fullPage) {
    const { cssContentSize } = await client.send('Page.getLayoutMetrics');
    params.clip = { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 };
  }
  const { data } = await client.send('Page.captureScreenshot', params);
  await writeFile(path.join(evidence, name + '.png'), Buffer.from(data, 'base64'));
}

try {
  chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new', '--no-first-run', '--no-default-browser-check', '--use-angle=swiftshader',
    '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
  ], { stdio: 'ignore', env: { ...process.env, TMPDIR: path.join(scratch, 'tmp') } });
  let port;
  for (let i = 0; i < 100; i++) {
    try { port = (await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
    catch { await delay(100); }
  }
  assert(port, 'Chrome did not expose its isolated debugging endpoint.');
  const response = await fetch('http://127.0.0.1:' + port + '/json/new?about:blank', { method: 'PUT' });
  assert(response.ok, 'Create isolated browser page.');
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  client = new CDP(socket);
  await client.send('Page.enable');
  await client.send('Page.setLifecycleEventsEnabled', { enabled: true });
  await client.send('Page.bringToFront');
  await client.send('Runtime.enable');
  await client.send('Network.enable');


  const save=async name=>{const {data}=await client.send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(evidence,name+'.png'),Buffer.from(data,'base64'));};
  const bird='.footer-bird',footer='.site-footer';
  const centre=selector=>client.evaluate(`(()=>{const r=document.querySelector('${selector}').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  const pose=()=>client.evaluate(`getComputedStyle(document.querySelector('${bird}')).transform+'|'+getComputedStyle(document.querySelector('${bird} img')).transform`);
  const pointInFooter=async (x,y)=>{const p=await client.evaluate(`(()=>{const r=document.querySelector('${footer}').getBoundingClientRect();return{x:r.x+r.width*${x},y:r.y+r.height*${y}}})()`);await client.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});};
  const bottom=async()=>{await client.evaluate(`window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})`);await delay(100);};
  await viewport(1440,900);await navigate('/');await bottom();
  await client.send('Browser.grantPermissions',{origin:base,permissions:['clipboardReadWrite','clipboardSanitizedWrite']});
  record('Footer starts active with stationary name and a rest control',await client.evaluate(`document.querySelector('.footer-bird-contact').dataset.resting==='false'&&document.querySelector('.footer-bird-contact').dataset.follow==='true'&&document.querySelector('.footer-name').tagName==='A'&&Boolean(document.querySelector('.footer-bird-rest'))`));
  const initial=await centre(bird),name=await centre('.footer-name');
  await pointInFooter(.82,.55);await delay(900);
  const followed=await centre(bird);
  record('Bird follows a mouse across footer while name stays still',Math.hypot(followed.x-initial.x,followed.y-initial.y)>150&&JSON.stringify(name)===JSON.stringify(await centre('.footer-name')),JSON.stringify({initial,followed,name,nameAfter:await centre('.footer-name'),state:await client.evaluate(`({footer:document.querySelector('.site-footer').getBoundingClientRect().toJSON(),pose:document.querySelector('.footer-bird').style.transform,hover:document.querySelector('.site-footer').matches(':hover'),focus:document.activeElement.tagName})`)}));
  const contained=await client.evaluate(`new Promise(resolve=>{let frames=0,bad=[];const sample=()=>{const f=document.querySelector('${footer}').getBoundingClientRect();for(const selector of ['${bird}','${bird} img']){const r=document.querySelector(selector).getBoundingClientRect();if(r.left<f.left-.5||r.top<f.top-.5||r.right>f.right+.5||r.bottom>f.bottom+.5)bad.push({selector,x:r.x,y:r.y,f:f.toJSON()})}if(++frames<35)requestAnimationFrame(sample);else resolve(bad)};const f=document.querySelector('${footer}').getBoundingClientRect();document.querySelector('${footer}').dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',clientX:f.right-1,clientY:f.top+1,bubbles:true}));sample()})`);
  record('Full bird and rotated image stay inside footer while approaching its edge',contained.length===0,JSON.stringify(contained));
  await hover(bird);const caught=await pose();await delay(400);
  record('Hover holds the bird still for clicking',caught===await pose());
  await click(bird);await until(`document.querySelector('#footer-bird-status').textContent.includes('Email copied')`,'copy confirmation');
  record('Native bird click writes the actual email to clipboard',await client.evaluate(`navigator.clipboard.readText()`)==='samarthsharma7621@gmail.com');
  await click(bird);record('Repeated copy stays available',await client.evaluate(`document.querySelector('#footer-bird-status').textContent.includes('happy to hear from you')`));
  await click('.footer-bird-rest');const restingPose=await pose();
  await pointInFooter(.1,.2);await pointInFooter(.9,.9);await client.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:200});await delay(500);
  record('X rest control freezes the complete bird until bird activation',restingPose===await pose()&&await client.evaluate(`document.querySelector('.footer-bird-contact').dataset.resting==='true'&&document.querySelector('.footer-bird-rest').disabled`));
  await click(bird);await pointInFooter(.2,.4);await delay(700);
  record('Clicking the resting bird wakes it and following resumes',restingPose!==await pose()&&await client.evaluate(`document.querySelector('.footer-bird-contact').dataset.resting==='false'`));
  await client.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:200});
  await until(`(()=>{const b=document.querySelector('${bird}').getBoundingClientRect(),p=document.querySelector('.footer-bird-perch').getBoundingClientRect();return Math.hypot(b.x-p.x,b.y-p.y)<.5})()`,'active bird returns to perch');
  record('Pointer leave returns active bird beside the name',true);
  await client.evaluate(`document.querySelector('.footer-name').focus()`);await key('Tab','Tab',9,8);const focused=await pose();await pointInFooter(.8,.8);await delay(350);
  record('Keyboard focus holds bird still',focused===await pose());
  await key('Enter','Enter',13);await until(`document.querySelector('#footer-bird-status').textContent.includes('Email copied')`,'keyboard copy');record('Keyboard can copy email',true);
  await client.evaluate(`document.querySelector('${bird}').blur();window.__writeText=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('Clipboard denied for test'))`);
  await click(bird);await until(`document.querySelector('#footer-bird-status').textContent.includes('Copy didn’t work')`,'clipboard denied');
  record('Clipboard denial shows selectable email and a compose link, not false success',await client.evaluate(`document.querySelector('#footer-bird-status a').textContent==='samarthsharma7621@gmail.com'&&document.querySelector('#footer-bird-status a').href.includes('mail.google.com')`));
  await client.evaluate(`navigator.clipboard.writeText=window.__writeText`);
  await click('.footer-bird-rest');const oldDocument=await client.evaluate('performance.timeOrigin');await client.send('Page.reload');await until(`performance.timeOrigin!==${oldDocument}&&document.querySelector('.footer-bird-contact')!==null`,'refreshed footer');await bottom();
  record('New document resets rest state',await client.evaluate(`document.querySelector('.footer-bird-contact').dataset.resting==='false'`));
  await pointInFooter(.85,.3);await delay(80);
  await client.evaluate(`Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))`);
  const hiddenPose=await pose();await delay(250);
  record('Hidden document cancels follower motion',hiddenPose===await pose());
  await client.evaluate(`delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))`);
  await pointInFooter(.75,.6);await delay(200);await click('.footer-bird-rest');
  await viewport(768,900);await bottom();const resizedRest=await pose();await pointInFooter(.1,.1);await delay(250);
  record('Resize keeps resting state and later pointer motion cannot wake it',resizedRest===await pose()&&await client.evaluate(`document.querySelector('.footer-bird-contact').dataset.resting==='true'`));
  await client.evaluate(`history.pushState(null,'','/projects');dispatchEvent(new PopStateEvent('popstate'))`);
  await until(`Boolean(document.querySelector('.archive-page'))`,'archive route');
  record('Rest persists across client-side route changes',await client.evaluate(`document.querySelector('.footer-bird-contact').dataset.resting==='true'`));
  await client.evaluate(`history.pushState(null,'','/');dispatchEvent(new PopStateEvent('popstate'))`);await until(`Boolean(document.querySelector('#contact'))`,'home route');await bottom();await click(bird);
  await click('.contact-details button[aria-label="Copy email"]');await until(`document.querySelector('.copy-feedback').textContent==='Email address copied.'`,'original contact copy');
  record('Existing contact email and Gmail link stay consistent',await client.evaluate(`navigator.clipboard.readText().then(value=>value==='samarthsharma7621@gmail.com'&&document.querySelector('.email-row a').href.includes(encodeURIComponent(value)))`));
  for(const [width,height,dark] of [[1440,900,false],[1440,900,true],[768,900,false],[390,844,true],[320,800,false]]){
    await viewport(width,height);await client.evaluate(`document.documentElement.classList.toggle('dark',${dark})`);await bottom();
    await pointInFooter(.92,.95);await delay(700);
    record('Footer bird and controls fit at '+width+' '+dark,await client.evaluate(`(()=>{const f=document.querySelector('${footer}').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth&&['${bird}','${bird} img','.footer-name','.footer-bird-rest'].every(s=>{const e=document.querySelector(s);if(!e)return true;const r=e.getBoundingClientRect();return r.left>=f.left-.5&&r.right<=f.right+.5&&r.top>=f.top-.5&&r.bottom<=f.bottom+.5})})()`));
    await save('footer-bird-'+width+'-'+(dark?'dark':'light'));
  }
  await client.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await until(`document.querySelector('.footer-bird-contact').dataset.follow==='false'`,'reduced motion applied');const still=await pose();await pointInFooter(.2,.1);await pointInFooter(.8,.8);await delay(350);
  record('Live reduced motion perches bird and disables following',still===await pose()&&await client.evaluate(`!document.querySelector('.footer-bird-rest')`));
  await click(bird);await until(`document.querySelector('#footer-bird-status').textContent.includes('Email copied')`,'reduced copy');record('Reduced-motion copy works',true);
  await client.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await client.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await viewport(390,844);await bottom();
  await until(`document.querySelector('.footer-bird-contact').dataset.follow==='false'`,'touch-only media');
  const touch=await centre(bird);await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touch,radiusX:1,radiusY:1}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await until(`document.querySelector('#footer-bird-status').textContent.includes('Email copied')`,'touch copy');record('Touch tap copies from a stationary perched bird',true);await save('footer-bird-touch');
  record('No browser errors or failed assets',!errors.length&&!consoleErrors.length&&!failedRequests.length,JSON.stringify({errors,consoleErrors,failedRequests}));
} catch (error) {
  checks.push({ name: 'Browser run completed', passed: false, detail: error.stack });
  process.exitCode = 1;
  process.stderr.write(error.stack + '\n');
} finally {
  await writeFile(path.join(evidence, 'footer-bird-report.json'), JSON.stringify({
    checkedAt: new Date().toISOString(), base, passed: checks.every(check => check.passed),
    checks, errors, consoleErrors, failedRequests,
  }, null, 2) + '\n');
  if (client) {
    try { await client.send('Browser.close'); } catch { /* Chrome may close its socket before replying. */ }
    client.close();
  }
  if (chrome && chrome.exitCode === null) {
    await new Promise(resolve => {
      const timeout = setTimeout(() => { chrome.kill('SIGTERM'); resolve(); }, 3000);
      chrome.once('exit', () => { clearTimeout(timeout); resolve(); });
    });
  }
  process.stdout.write(checks.filter(check => check.passed).length + '/' + checks.length + ' browser checks passed.\n');
}
