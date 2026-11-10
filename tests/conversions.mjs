import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) if(!m[0].includes('application/ld+json')) new vm.Script(m[1]);
for (const path of ['repair','contact']) {
 const source=fs.readFileSync(`functions/api/${path}.js`,'utf8');
 const {onRequestPost}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const rows=new Set(); let fail=false;
 const DB={prepare(sql){return {bind(...args){assert.equal((sql.match(/\?/g)||[]).length,args.length);return {async run(){if(fail)throw new Error('synthetic');rows.add(args[0]);return {success:true};}}}}}};
 async function submit(fields){const r=await onRequestPost({request:new Request('https://test.invalid',{method:'POST',body:new URLSearchParams(fields)}),env:{DB}});return {status:r.status,...await r.json()};}
 assert.equal((await submit({company:'bot'})).accepted,false); assert.equal(rows.size,0);
 assert.equal((await submit({})).status,422);
 const data={submission_id:'12345678-1234-4234-8234-123456789012',name:'Local QA',phone:'2025550100',email:'qa@example.invalid',zip:'07003',issue:'unknown',details:'Synthetic local test',kind:'consultation',preferred_time:'Wednesday afternoon'};
 assert.equal((await submit(data)).accepted,true);assert.equal((await submit(data)).accepted,true);assert.equal(rows.size,1);
 fail=true;const old=console.error;console.error=()=>{};try{assert.equal((await submit(data)).status,500);}finally{console.error=old;}
 console.log(`${path}: honeypot, validation, acceptance, retry, storage failure passed`);
}
console.log('Inline JavaScript parses');
