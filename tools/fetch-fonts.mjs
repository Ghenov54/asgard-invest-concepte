import fs from 'fs/promises';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const families=[
 {q:'Archivo+Black',name:'archivo-black'},
 {q:'Archivo:wdth,wght@62..125,100..900',name:'archivo-var'},
 {q:'Inter:wght@100..900',name:'inter-var'},
 {q:'Manrope:wght@200..800',name:'manrope-var'},
 {q:'JetBrains+Mono:wght@100..800',name:'jbmono-var'},
];
let css='';
for(const f of families){
  const url=`https://fonts.googleapis.com/css2?family=${f.q}&display=swap`;
  const r=await fetch(url,{headers:{'User-Agent':UA}});
  if(!r.ok){console.log('FAIL',f.name,r.status);continue;}
  let t=await r.text();
  const blocks=t.split('@font-face').slice(1);
  let i=0;
  for(const b of blocks){
    const sub=(b.match(/\/\* (.*?) \*\//)||[])[1]||'';
    // keep only latin + latin-ext
    const m=b.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    if(!m) continue;
    const prevComment=(t.split(b)[0].match(/\/\* ([a-z\-]+) \*\/\s*$/)||[])[1];
    i++;
  }
  // simpler: parse full text with comments
  const re=/\/\* ([a-z0-9\-\[\]]+) \*\/\s*@font-face \{([^}]+)\}/g;
  let m;
  while((m=re.exec(t))){
    const subset=m[1], body=m[2];
    if(!['latin','latin-ext'].includes(subset)) continue;
    const u=body.match(/url\((https:\/\/[^)]+\.woff2)\)/);
    if(!u) continue;
    const file=`${f.name}-${subset}.woff2`;
    const buf=Buffer.from(await (await fetch(u[1],{headers:{'User-Agent':UA}})).arrayBuffer());
    await fs.writeFile(`/c/Users/dmitr/asgard-invest-work/assets/fonts/${file}`.replace('/c/','C:/'),buf);
    const newBody=body.replace(/url\(https:\/\/[^)]+\.woff2\)/,`url('../assets/fonts/${file}')`);
    css+=`/* ${f.name} ${subset} */\n@font-face {${newBody}}\n`;
    console.log('ok',file,buf.length);
  }
}
await fs.writeFile('C:/Users/dmitr/asgard-invest-work/assets/fonts.css',css);
console.log('CSS bytes',css.length);
