import puppeteer from 'puppeteer';
const targets={
 v1:[['hero','.hero-card'],['cifre','.nums'],['calc','.calc']],
 v2:[['hero','.hero-grid'],['ops','.ops'],['calc','.calc']],
 v3:[['hero','.hero-in'],['strip','.strip-out'],['calc','.calc']],
};
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
for(const v of Object.keys(targets)){
  const p=await b.newPage();await p.setViewport({width:1440,height:900,deviceScaleFactor:1});
  await p.goto(`file:///C:/Users/dmitr/asgard-invest-work/${v}/index.html`,{waitUntil:'networkidle0'});
  await p.addStyleTag({content:'html{scroll-behavior:auto !important}'});
  await p.evaluate(async()=>{const H=document.body.scrollHeight,vh=innerHeight;
    for(let y=0;y<H+vh;y+=Math.round(vh*.6)){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}
    scrollTo(0,0);await new Promise(r=>setTimeout(r,600));});
  for(const [n,sel] of targets[v]){
    const el=await p.$(sel);
    if(!el){console.log('missing',v,sel);continue;}
    await el.screenshot({path:`C:/Users/dmitr/asgard-invest-work/verify/${v}-${n}.png`});
  }
  await p.close();
}
await b.close();console.log('done');
