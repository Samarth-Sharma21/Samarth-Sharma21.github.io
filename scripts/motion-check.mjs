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
  await viewport(1440,900);
  await navigate('/');
  const card = '[data-project-id="rekindle"]';
  const img = card+' .project-preview img:not(.gallery-outgoing)';
  const next = card+' .gallery-controls button[aria-label^="Next image for"]';
  await click(next);
  await until(`document.querySelector(${JSON.stringify(img)}).src.endsWith('Rekindle1.JPG')`, 'next image decoded');
  record('Gallery next loads correct screenshot',await client.evaluate(`document.querySelector(${JSON.stringify(img)}).naturalWidth>0`));
  await client.evaluate(`{const picture=document.querySelector(${JSON.stringify(img)});const original=picture.animate.bind(picture);picture.animate=(frames,options)=>{window.galleryFlight=original(frames,options);return window.galleryFlight;};document.querySelector(${JSON.stringify(next)}).dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));}`);
  await until(`document.querySelector(${JSON.stringify(img)}).src.endsWith('Rekindle3.JPG')`, 'second screenshot');
  record('Gallery runs a directional transition on the actual image',await client.evaluate(`window.galleryFlight?.effect.target===document.querySelector(${JSON.stringify(img)})&&window.galleryFlight.effect.getTiming().duration===220&&window.galleryFlight.effect.getKeyframes()[0].transform==='translateX(12px)'&&window.galleryFlight.effect.getKeyframes().at(-1).transform==='none'`));
  await delay(260);
  await client.evaluate(`{const b=document.querySelector(${JSON.stringify(next)}); for(let i=0;i<5;i++) b.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));}`);
  await until(`document.querySelector(${JSON.stringify(img)}).src.endsWith('Rekindle1.JPG')`, 'last rapid request wins');
  record('Five rapid inputs end on requested image',true);
  await delay(260);
  await click(card+' .project-preview');
  await until(`document.querySelector('.image-viewer')?.open`, 'viewer open');
  record('Native viewer focuses close control and locks body scroll',await client.evaluate(`document.activeElement?.getAttribute('aria-label')==='Close image viewer' && document.body.style.overflow==='hidden'`));
  await delay(300);
  record('Viewer image is fully contained',await client.evaluate(`(()=>{const i=document.querySelector('.viewer-image');const r=i.getBoundingClientRect();return i.naturalWidth>0&&getComputedStyle(i).objectFit==='contain'&&r.top>=0&&r.bottom<=innerHeight})()`));
  await save('motion-viewer-light');
  await key('Tab','Tab',9,1);
  record('Viewer traps reverse tab in modal',await client.evaluate(`Boolean(document.activeElement?.closest('.image-viewer'))`));
  await key('ArrowRight','ArrowRight',39);
  await until(`document.querySelector('.viewer-image').src.endsWith('Rekindle3.JPG')`,'viewer keyboard next');
  record('Keyboard gallery transition is immediate',await client.evaluate(`document.querySelector(${JSON.stringify(img)}).getAnimations().length===0`));
  await key('Escape','Escape',27);
  await until(`!document.querySelector('.image-viewer')`,'Escape close');
  record('Escape restores trigger focus and scrolling',await client.evaluate(`document.activeElement?.matches('${card} .project-preview')&&document.body.style.overflow!== 'hidden'`));
  await key('Enter','Enter',13);
  await until(`document.querySelector('.image-viewer')?.open`,'keyboard viewer');
  record('Keyboard viewer opens without flight',await client.evaluate(`document.querySelector('.viewer-image').getAnimations().length===0`));
  await key('Escape','Escape',27);
  await click(card+' .project-preview');
  await click('.viewer-heading button');
  await until(`!document.querySelector('.image-viewer')`,'close during entry');
  record('Pointer close during entry restores focus',await client.evaluate(`document.activeElement?.matches('${card} .project-preview')`));
  await click(card+' .project-preview');
  await delay(270);
  await client.send('Input.dispatchMouseEvent',{type:'mousePressed',x:4,y:4,button:'left',clickCount:1});
  await client.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:4,y:4,button:'left',clickCount:1});
  await until(`!document.querySelector('.image-viewer')`,'backdrop close');
  record('Backdrop closes viewer',true);
  await click(card+' .project-preview');
  await delay(270);
  await click('.viewer-heading button');
  await key('ArrowRight','ArrowRight',39);
  await until(`!document.querySelector('.image-viewer')`,'close survives arrow input');
  record('Arrow during exit cannot trap the modal',await client.evaluate(`document.body.style.overflow!=='hidden'`));
  await click(card+' .project-preview');
  await delay(270);
  await client.evaluate(`document.querySelector('.viewer-heading button').dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));document.querySelector('.viewer-controls button:last-child').dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}))`);
  await until(`!document.querySelector('.image-viewer')`,'close survives next click');
  record('Next click during exit cannot trap the modal',true);
  await click(card+' .project-preview');
  await client.evaluate(`history.pushState(null,'','/projects');dispatchEvent(new PopStateEvent('popstate'))`);
  await until(`Boolean(document.querySelector('.archive-page'))`,'route unmount');
  record('Route unmount closes dialog and restores scrolling',await client.evaluate(`!document.querySelector('.image-viewer')&&document.body.style.overflow!=='hidden'`));


  // Block the next image after a fresh load so the fallback is exercised without a cache hit.
  await client.send('Network.setCacheDisabled',{cacheDisabled:true});
  await navigate('/');
  await client.send('Network.setBlockedURLs',{urls:['*Rekindle1.JPG*']});
  await click(next);
  await until(`Boolean(document.querySelector('${card} .gallery-error'))`,'failed image status');
  record('Failed next image keeps current screenshot usable',await client.evaluate(`document.querySelector(${JSON.stringify(img)}).src.endsWith('Rekindle2.JPG')&&document.querySelector(${JSON.stringify(img)}).naturalWidth>0`));
  await client.send('Network.setBlockedURLs',{urls:[]});
  await click(next);
  await until(`document.querySelector(${JSON.stringify(img)}).src.endsWith('Rekindle1.JPG')`,'retry image');
  record('Retry recovers after image failure',await client.evaluate(`!document.querySelector('${card} .gallery-error')`));

  await navigate('/projects');
  record('Archive starts with seven projects',await client.evaluate(`document.querySelectorAll('.archive-grid .project-card').length===7`));
  await click('.project-filters button:nth-child(3)');
  await until(`document.querySelectorAll('.archive-grid .project-card').length===2`, 'AI filter exits complete');
  record('AI filter shows matching cards and selected indicator',await client.evaluate(`document.querySelectorAll('.archive-grid .project-card').length===2 && document.querySelector('.project-filters button:nth-child(3)').getAttribute('aria-pressed')==='true'&&document.querySelectorAll('.filter-indicator').length===1`));
  await client.evaluate(`document.querySelector('.project-filters button:first-child').focus()`);
  await key('Enter','Enter',13);
  await until(`document.querySelectorAll('.archive-grid .project-card').length===7`,'keyboard all filter');
  record('Filter keeps keyboard focus on initiating button',await client.evaluate(`document.activeElement===document.querySelector('.project-filters button:first-child')`));
  for(const [width,height,dark] of [[1440,900,false],[1440,900,true],[768,900,true],[390,844,false],[320,800,true]]){
    await viewport(width,height);
    await client.evaluate(`document.documentElement.classList.toggle('dark',${dark});document.querySelector('.archive-toolbar').scrollIntoView({block:'start',behavior:'instant'})`);
    await delay(300);
    record(`Archive ${width} ${dark?'dark':'light'} fits screen`,await client.evaluate(`document.documentElement.scrollWidth<=innerWidth`));
    await save(`motion-archive-${width}-${dark?'dark':'light'}`);
    await click('.archive-grid .project-preview');
    await delay(300);
    record(`Viewer ${width} fits screen`,await client.evaluate(`(()=>{const d=document.querySelector('.image-viewer');const i=d.querySelector('.viewer-image').getBoundingClientRect();return d.scrollWidth<=innerWidth&&i.bottom<=innerHeight&&i.top>=0})()`));
    if(width===390||dark&&width===1440) await save(`motion-viewer-${width}`);
    await key('Escape','Escape',27);
  }


  await client.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  for(const width of [320,768,1440]) {
    await viewport(width,900);
    const galleries=await client.evaluate(`[...document.querySelectorAll('.archive-grid .project-card')].map(c=>({id:c.dataset.projectId}))`);
    for(const gallery of galleries) {
      const selector=`[data-project-id="${gallery.id}"]`;
      if(!await client.evaluate(`Boolean(document.querySelector('${selector} .project-preview'))`)) continue;
      const count=await client.evaluate(`Number(document.querySelector('${selector} .gallery-count-value')?.lastChild.textContent||1)`);
      for(let i=0;i<count;i++) {
        const shot=selector+' .project-preview img:not(.gallery-outgoing)';
        await client.evaluate(`document.querySelector('${selector}').scrollIntoView({block:'center',behavior:'instant'})`);
        await until(`document.querySelector('${shot}').complete&&document.querySelector('${shot}').naturalWidth>0`,'image loaded');
        const fit=await client.evaluate(`(()=>{const img=document.querySelector('${shot}');const p=img.getBoundingClientRect();const c=document.querySelector('${selector} .gallery-controls')?.getBoundingClientRect();return getComputedStyle(img).objectFit==='contain'&&p.width>0&&p.height>0&&(!c||p.bottom<c.top)})()`);
        record(`${gallery.id} slide ${i+1}/${count} fully fits at ${width}`,fit);
        if(count>1){
          const current=await client.evaluate(`document.querySelector('${shot}').src`);
          await client.evaluate(`document.querySelector('${selector} .gallery-controls button[aria-label^="Next image for"]').click()`);
          await until(`document.querySelector('${shot}').src!==${JSON.stringify(current)}`,'gallery cycled');
        }
      }
    }
  }
  await click('.project-filters button:last-child');
  await until(`document.querySelectorAll('.archive-grid .project-card').length===2`,'reduced filter');
  record('Reduced filter has no running transforms',await client.evaluate(`[...document.querySelectorAll('.archive-grid > div,.filter-indicator')].every(e=>getComputedStyle(e).transform==='none'&&e.getAnimations().length===0)`));
  await client.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await viewport(1440,900);
  await navigate('/');
  await client.evaluate(`document.querySelector('.tool-motion-control').click()`);
  await hover('.tool-target');
  record('First hover reveals tool details',await client.evaluate(`Boolean(document.querySelector('.tool-inspector strong'))`));
  await client.evaluate(`document.querySelector('.tool-target').focus()`);
  await key('ArrowRight','ArrowRight',39);
  record('Tool keyboard arrows preserve focused detail',await client.evaluate(`document.querySelector('.tool-inspector strong').textContent==='Python'`));
  await key('Tab','Tab',9);
  await key('Enter','Enter',13);
  record('Tool close moves focus past toolbar',await client.evaluate(`document.activeElement?.matches('.tool-motion-control')`));

  for(const [width,height,dark] of [[1440,900,false],[1440,900,true],[1024,768,true],[390,844,false],[320,800,true]]){
    await viewport(width,height);
    await client.evaluate(`document.documentElement.classList.toggle('dark',${dark});window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})`);
    await delay(150);
    record(`Contact ${width} ${dark?'dark':'light'} fits without large artwork`,await client.evaluate(`document.documentElement.scrollWidth<=innerWidth&&!document.querySelector('.skyray-study,.skyray-wake')&&document.querySelector('.footer-signature img').getBoundingClientRect().width===48`));
    await save(`final-contact-${width}-${dark?'dark':'light'}`);
  }
  await viewport(1440,900);
  await client.evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
  await delay(500);
  for(const selector of ['.hero-actions .button','.hero-actions .text-link','.desktop-nav a','.back-top','.project-links a']) {
    await hover(selector);
    record(`Stationary hover without underline: ${selector}`,await client.evaluate(`(()=>{const e=document.querySelector('${selector}');const s=getComputedStyle(e);return s.transform==='none'&&s.textDecorationLine==='none'&&[...e.querySelectorAll('svg')].every(svg=>getComputedStyle(svg).transform==='none')})()`));
  }
  await client.evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
  await client.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:300});
  await delay(250);
  await save('final-home-desktop');
  await viewport(320,800);
  await client.evaluate(`document.querySelector('${card}').scrollIntoView({block:'center',behavior:'instant'})`);
  record('320px gallery controls have separate touch targets',await client.evaluate(`(()=>{const group=document.querySelector('${card} .gallery-controls');const boxes=[...group.children].map(e=>e.getBoundingClientRect());const r=group.getBoundingClientRect();return boxes.every((b,i)=>b.left>=r.left&&b.right<=r.right&&(!i||b.left>=boxes[i-1].right))})()`));
  await save('final-gallery-mobile');

  await viewport(1440,900);
  await navigate('/');
  await client.evaluate(`document.querySelector('${card}').scrollIntoView({block:'center',behavior:'instant'})`);
  await client.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:300});
  await until(`document.querySelector('${card} .project-media').dataset.autoplay==='running'`,'visible automatic gallery');
  const beforeAuto=await client.evaluate(`document.querySelector(${JSON.stringify(img)}).src`);
  await until(`document.querySelector(${JSON.stringify(img)}).src!==${JSON.stringify(beforeAuto)}`,'4 second automatic advance');
  record('Visible gallery advances automatically',true);
  await hover(card+' .project-preview');
  const held=await client.evaluate(`document.querySelector(${JSON.stringify(img)}).src`);
  await delay(4300);
  record('Hover pauses automatic images',await client.evaluate(`document.querySelector(${JSON.stringify(img)}).src===${JSON.stringify(held)}&&document.querySelector('${card} .project-media').dataset.autoplay==='paused'`));
  await click(card+' .gallery-autoplay');
  await client.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:300});
  await delay(4300);
  record('Explicit pause holds current image',await client.evaluate(`document.querySelector(${JSON.stringify(img)}).src===${JSON.stringify(held)}&&document.querySelector('${card} .gallery-autoplay').getAttribute('aria-pressed')==='true'`));
  await click(card+' .gallery-autoplay');
  await client.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:300});
  await until(`document.querySelector(${JSON.stringify(img)}).src!==${JSON.stringify(held)}`,'play resumes cycling');
  record('Play resumes automatic images',true);
  await click(card+' .gallery-controls button:first-child');
  const enlarged=await client.evaluate(`document.querySelector('.viewer-image').src`);
  await delay(4300);
  record('Open viewer pauses gallery cycling',await client.evaluate(`document.querySelector('.viewer-image').src===${JSON.stringify(enlarged)}`));
  await key('Escape','Escape',27);
  record('Viewer restores its actual expand-button focus',await client.evaluate(`document.activeElement===document.querySelector('${card} .gallery-controls button:first-child')`));
  await client.evaluate(`document.querySelector('${card} .project-preview').focus()`);
  await delay(4300);
  record('Keyboard focus pauses cycling',await client.evaluate(`document.querySelector(${JSON.stringify(img)}).src===${JSON.stringify(enlarged)}`));
  await client.evaluate(`document.activeElement.blur();window.scrollTo({top:0,behavior:'instant'})`);
  await delay(4300);
  record('Offscreen gallery pauses cycling',await client.evaluate(`document.querySelector(${JSON.stringify(img)}).src===${JSON.stringify(enlarged)}&&document.querySelector('${card} .project-media').dataset.autoplay==='paused'`));
  await client.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await client.evaluate(`document.querySelector('${card}').scrollIntoView({block:'center',behavior:'instant'})`);
  await delay(4300);
  record('Reduced motion disables autoplay',await client.evaluate(`document.querySelector(${JSON.stringify(img)}).src===${JSON.stringify(enlarged)}&&document.querySelector('${card} .gallery-autoplay').disabled`));
  await client.evaluate(`document.querySelector('.tool-target').focus()`);
  await key('ArrowRight','ArrowRight',39);
  await key('Tab','Tab',9);
  await key('Enter','Enter',13);
  record('Reduced-motion tool close moves focus to the next section',await client.evaluate(`document.activeElement===document.querySelector('#projects .project-preview')`));
  await click(next);
  await delay(200);
  record('Reduced motion manual gallery has no flight',await client.evaluate(`document.querySelector(${JSON.stringify(img)}).getAnimations().length===0`));
  await click(card+' .project-preview');
  record('Reduced motion viewer has no flight',await client.evaluate(`document.querySelector('.viewer-image').getAnimations().length===0`));
  await key('Escape','Escape',27);

  await client.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await navigate('/');
  await client.evaluate(`window.originalDecode=HTMLImageElement.prototype.decode;window.decodeJobs=[];HTMLImageElement.prototype.decode=function(){return new Promise((resolve,reject)=>window.decodeJobs.push({src:this.src,resolve,reject}));};document.querySelector('${card}').scrollIntoView({block:'center',behavior:'instant'})`);
  await client.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:300});
  await until(`window.decodeJobs.some(j=>j.src.endsWith('Rekindle1.JPG'))`,'automatic preload pending');
  await client.evaluate(`document.querySelector('${card} .gallery-autoplay').click();document.querySelector('${card} .gallery-controls button[aria-label^="Next image for"]').click();window.decodeJobs.filter(j=>j.src.includes('Rekindle')).at(-1).resolve()`);
  await until(`document.querySelector(${JSON.stringify(img)}).src.endsWith('Rekindle1.JPG')`,'manual next uses visible image');
  await client.evaluate(`window.decodeJobs.find(j=>j.src.endsWith('Rekindle1.JPG')).resolve();HTMLImageElement.prototype.decode=window.originalDecode`);
  record('Pause then Next does not skip a pending automatic image',await client.evaluate(`document.querySelector(${JSON.stringify(img)}).src.endsWith('Rekindle1.JPG')&&window.decodeJobs.filter(j=>j.src.includes('Rekindle')).every(j=>j.src.endsWith('Rekindle1.JPG'))`));
  record('No browser errors or unexpected HTTP failures',errors.length===0&&consoleErrors.length===0&&failedRequests.length===0,JSON.stringify({errors,consoleErrors,failedRequests}));
} catch (error) {
  checks.push({ name: 'Browser run completed', passed: false, detail: error.stack });
  process.exitCode = 1;
  process.stderr.write(error.stack + '\n');
} finally {
  await writeFile(path.join(evidence, 'motion-implementation-report.json'), JSON.stringify({
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
