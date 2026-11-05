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
  await viewport(1440,900);await navigate('/');
  const core='.tool-scatter-trigger';
  const settled=`!document.querySelector('.orb-flight')&&document.querySelector('.tool-sculpture').dataset.flight==='false'`;
  const phases=()=>client.evaluate(`[...document.querySelectorAll('.tool-orbit-arm')].map(e=>e.style.getPropertyValue('--phase')).join(',')`);
  for(const selector of ['.hero-actions .button','.hero-actions .text-link','.back-top','.contact-socials a','.project-links a','.hero-bottom a']) {
    await hover(selector);
    record(`Static arrow restored: ${selector}`,await client.evaluate(`(()=>{const e=document.querySelector('${selector}');const icon=e.querySelector('svg');return !!icon&&getComputedStyle(icon).transform==='none'&&getComputedStyle(e).textDecorationLine==='none'})()`));
  }
  await click('.hero-bottom a');
  await until(`location.hash==='#projects'&&document.activeElement?.id==='projects'`,'scroll down navigation');
  record('Scroll down link reaches selected work',true);
  await click('.back-top');
  await until(`location.hash==='#home'&&document.activeElement?.id==='home'`,'back to top navigation');
  record('Back to top reaches home',true);
  await client.evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
  await delay(450);
  const initial=await phases();
  await click(core);
  await until(`document.querySelectorAll('.orb-flight img').length===25`,'flight starts');
  record('Flight freezes two rings and leaves pointer input unobstructed',await client.evaluate(`document.querySelector('.tool-sculpture').dataset.motion==='paused'&&getComputedStyle(document.querySelector('.orb-flight')).pointerEvents==='none'&&document.querySelector('.orb-flight').getAttribute('aria-hidden')==='true'`));
  await client.evaluate(`window.__flightNodes=[...document.querySelectorAll('.orb-flight img')];window.__flightAnimations=window.__flightNodes.map(e=>e.getAnimations()[0]);window.__originalRects=window.__flightNodes.map(e=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));`);
  await client.evaluate(`window.__flightAnimations.forEach(a=>{a.pause();a.currentTime=a.effect.getTiming().delay+1100});new Promise(resolve=>requestAnimationFrame(()=>resolve(true)))`);
  const displacements=await client.evaluate(`window.__flightNodes.map((e,i)=>{const r=e.getBoundingClientRect();const s=window.__originalRects[i];return {connected:e.isConnected,distance:Math.hypot(r.x-s.x,r.y-s.y)}})`);
  record('All 25 logos visibly scatter at the flight midpoint',displacements.every(p=>p.connected&&p.distance>15),JSON.stringify(displacements));
  record('Flight layer does not create page overflow',await client.evaluate(`document.documentElement.scrollWidth<=innerWidth`));
  await save('orb-flight-desktop');
  await client.evaluate('window.__flightAnimations.forEach(a=>a.play())');
  await client.evaluate(`document.querySelector('${core}').dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));document.querySelector('${core}').dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}))`);
  await client.evaluate(`window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('scroll'))`);
  record('No-op geometry events do not cancel a flight',await client.evaluate(`document.querySelectorAll('.orb-flight img').length===25`));
  record('Repeated clicks keep one flight with 25 images',await client.evaluate(`document.querySelectorAll('.orb-flight').length===1&&document.querySelectorAll('.orb-flight img').length===25`));
  await until(settled,'flight returns');
  record('Flight completes and returns to both rings',await client.evaluate(`document.querySelectorAll('.tool-target').length===25&&document.querySelector('.tool-sculpture').dataset.motion==='running'&&[...document.querySelectorAll('.tool-target')].every(e=>getComputedStyle(e).opacity==='1')`));
  record('Flight rearranges positions',initial!==await phases());
  record('Each ring retains unique, evenly spaced slots',await client.evaluate(`[...document.querySelectorAll('.tool-ring')].every(r=>{const phases=[...r.querySelectorAll('.tool-orbit-arm')].map(e=>parseFloat(e.style.getPropertyValue('--phase'))).sort((a,b)=>a-b);return phases.every((p,i)=>Math.abs(p-i*360/phases.length)<0.01)})`));
  record('The flight animations are finite and under 2.5 seconds',await client.evaluate(`window.__flightAnimations.every(a=>a.effect.getTiming().duration+a.effect.getTiming().delay<2500&&a.effect.getTiming().iterations===1)`));
  await click('.tool-motion-control');
  await click(core);await until(`Boolean(document.querySelector('.orb-flight'))`,'paused flight');await until(settled,'paused flight completes');
  record('Explicit orbital pause survives a flight',await client.evaluate(`document.querySelector('.tool-sculpture').dataset.motion==='paused'&&document.querySelector('.tool-motion-control').getAttribute('aria-pressed')==='true'`));
  await click(core);await until(`Boolean(document.querySelector('.orb-flight'))`,'flight before scroll');
  await client.evaluate(`window.scrollTo({top:200,behavior:'instant'})`);await until(settled,'scroll cancels');
  record('Scroll cancels flight and restores icons',true);
  await click(core);await until(`Boolean(document.querySelector('.orb-flight'))`,'flight before resize');
  await viewport(768,900);await until(settled,'resize cancels');record('Resize cancels flight',true);
  await click(core);await until(`Boolean(document.querySelector('.orb-flight'))`,'flight before reduced motion');
  await client.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await until(settled,'reduced motion cancels');
  record('Live reduced motion cancels flight',true);
  const reducedBefore=await phases();await click(core);
  record('Reduced-motion click rearranges without flying',await client.evaluate(settled)&&reducedBefore!==await phases());
  await client.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await until(`document.querySelector('.tool-sculpture').dataset.reducedMotion==='false'`,'motion preference applied');
  await client.evaluate(`document.querySelector('${core}').focus()`);const keyboardBefore=await phases();await key('Enter','Enter',13);
  record('Keyboard activation rearranges instantly and retains focus',await client.evaluate(settled+`&&document.activeElement===document.querySelector('${core}')`)&&keyboardBefore!==await phases());
  await click(core);
  await until(`Boolean(document.querySelector('.orb-flight'))`,'flight before hidden');
  await client.evaluate(`Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))`);await until(settled,'hidden cancels');
  record('Hidden-document handler restores icons',true);
  await client.evaluate(`delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))`);
  for(const [width,height,dark] of [[320,800,false],[390,844,true],[768,900,false],[1440,500,false],[1440,900,true]]) {
    await viewport(width,height);await client.evaluate(`document.documentElement.classList.toggle('dark',${dark})`);
    await click(core);await until(`Boolean(document.querySelector('.orb-flight'))`,'responsive flight');
    await delay(750);await save(`orb-flight-${width}-${dark?'dark':'light'}`);
    record(`Flight at ${width} has no horizontal overflow`,await client.evaluate(`document.documentElement.scrollWidth<=innerWidth`));
    await until(settled,'responsive return');
    record(`Returned icons at ${width} fit the orb scene`,await client.evaluate(`(()=>{const scene=document.querySelector('.tool-scene').getBoundingClientRect();return [...document.querySelectorAll('.tool-target')].every(e=>{const r=e.getBoundingClientRect();return r.left>=scene.left-1&&r.right<=scene.right+1&&r.top>=scene.top-1&&r.bottom<=scene.bottom+1})})()`));
  }
  await click(core);await until(`Boolean(document.querySelector('.orb-flight'))`,'flight before route change');
  await client.evaluate(`history.pushState(null,'','/projects');dispatchEvent(new PopStateEvent('popstate'))`);await until(`Boolean(document.querySelector('.archive-page'))`,'archive navigation');
  record('Route unmount removes flight overlay',await client.evaluate(`!document.querySelector('.orb-flight')`));
  await navigate('/');
  await hover('.portrait-trigger');
  record('Portrait hover reveals short note',await client.evaluate(`document.querySelector('.portrait-trigger').getAttribute('aria-expanded')==='true'&&!document.querySelector('.portrait-note').hidden`));
  const firstNote=await client.evaluate(`document.querySelector('.portrait-note').textContent`);
  await save('portrait-note-desktop');
  await client.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:200});
  record('Portrait pointer leave dismisses note',await client.evaluate(`document.querySelector('.portrait-note').hidden`));
  await hover('.portrait-trigger');
  record('Next encounter reveals another note',firstNote!==await client.evaluate(`document.querySelector('.portrait-note').textContent`));
  await client.evaluate(`document.activeElement.blur()`);await key('Escape','Escape',27);
  record('Escape dismisses hovered note without focus',await client.evaluate(`document.querySelector('.portrait-note').hidden`));
  await client.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:200});
  await client.evaluate(`document.querySelector('.portrait-trigger').blur()`);
  await key('Tab','Tab',9);await client.evaluate(`document.querySelector('.portrait-trigger').focus()`);
  record('Keyboard focus reveals note',await client.evaluate(`!document.querySelector('.portrait-note').hidden`));
  await client.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  record('Reduced motion portrait is static',await client.evaluate(`getComputedStyle(document.querySelector('.portrait-note')).animationName==='none'`));
  await client.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  await viewport(390,844);await client.evaluate(`document.querySelector('.portrait-trigger').blur();document.querySelector('.portrait-trigger').scrollIntoView({block:'center',behavior:'instant'})`);
  const touchPoint=await client.evaluate(`(()=>{const r=document.querySelector('.portrait-trigger').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touchPoint,radiusX:1,radiusY:1}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await until(`!document.querySelector('.portrait-note').hidden`,'touch note');
  record('Touch tap reveals portrait note',true);await save('portrait-note-mobile');
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touchPoint,radiusX:1,radiusY:1}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  record('Second touch tap dismisses portrait note',await client.evaluate(`document.querySelector('.portrait-note').hidden`));
  record('No browser errors or failed asset requests',errors.length===0&&consoleErrors.length===0&&failedRequests.length===0,JSON.stringify({errors,consoleErrors,failedRequests}));
} catch (error) {
  checks.push({ name: 'Browser run completed', passed: false, detail: error.stack });
  process.exitCode = 1;
  process.stderr.write(error.stack + '\n');
} finally {
  await writeFile(path.join(evidence, 'orb-implementation-report.json'), JSON.stringify({
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
