import puppeteer from 'puppeteer';
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
for(const v of ['v1','v2','v3']){
  for(const w of [1440,1280,1024,768,390]){
    const p=await b.newPage();await p.setViewport({width:w,height:900});
    await p.goto(`file:///C:/Users/dmitr/asgard-invest-work/${v}/index.html`,{waitUntil:'networkidle0'});
    const bad=await p.evaluate(()=>[...document.querySelectorAll('h1,h2,h3,b,.calc-val,.big,.num b,.hstat b,.hm b')]
      .filter(e=>e.scrollWidth>e.clientWidth+2 && e.clientWidth>0)
      .map(e=>e.tagName+'"'+(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,32)+'" '+e.scrollWidth+'>'+e.clientWidth));
    if(bad.length) console.log(v,w,'=>',bad.join(' | ')); else console.log(v,w,'OK');
    await p.close();
  }
}
await b.close();
