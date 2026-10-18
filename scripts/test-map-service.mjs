import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {handleMapRequest} from '../lib/map-service.ts';
import {handleMapHttpRequest,PUBLIC_MAP_ORIGIN} from '../lib/map-http.ts';
const dir=mkdtempSync(join(tmpdir(),'osp-map-tests-'));const file=join(dir,'map.sqlite');
let sql=new DatabaseSync(file);sql.exec(readFileSync(join('drizzle',readdirSync('drizzle').find(x=>x.endsWith('.sql'))),'utf8'));
const db={prepare(query){let values=[];return {bind(...v){values=v;return this;},async first(){return sql.prepare(query).get(...values)??null;},async all(){return{results:sql.prepare(query).all(...values)};},async run(){return sql.prepare(query).run(...values);}};}};
async function request(method,payload,cookie='',unit='ochojno',context={},origin='https://map.test'){
 const headers=new Headers();if(cookie)headers.set('cookie',cookie);
 if(method!=='GET'){headers.set('Content-Type','application/json');headers.set('Origin',origin);}
 const result=await handleMapRequest(new Request('https://map.test/api/map?unit='+unit,{method,headers,...(payload?{body:JSON.stringify(payload)}:{})}),db,context);
 return {status:result.status,body:await result.json(),cookie:result.headers.get('set-cookie')?.split(';')[0]};
}
let checks=0;function eq(a,b){assert.deepEqual(a,b);checks++;}
const sample={unit:'ochojno',category:'P',kind:'point',points:[{x:.5,y:.4}],description:'Woda zalewa drogę przy przepuście.',priority:'normal'};
try{
 eq((await request('POST',sample)).status,401);
 const a=await request('POST',{op:'join',unit:'ochojno'});const b=await request('POST',{op:'join',unit:'ochojno'});
 assert(a.cookie&&b.cookie&&a.cookie!==b.cookie);checks++;
 const added=await request('POST',sample,a.cookie);eq(added.status,201);let h=added.body.hazard;
 eq((await request('GET',null,b.cookie)).body.hazards[0].canEdit,false);
 eq((await request('GET',null,a.cookie)).body.hazards[0].canEdit,true);
 const tokenRead=await handleMapRequest(new Request('https://map.test/api/map?unit=ochojno',{headers:{'X-OSP-Session':a.body.sessionToken}}),db);eq((await tokenRead.json()).hazards[0].canEdit,true);
 eq((await request('PATCH',{...sample,id:h.id,version:h.version,description:'Cudza zmiana'},b.cookie)).status,403);
 eq((await request('POST',{...sample,unit:'olszowice'},a.cookie)).status,403);
 const update=await request('PATCH',{...sample,id:h.id,version:h.version,description:'Zalewanie drogi po ulewach.'},a.cookie);eq(update.status,200);h=update.body.hazard;
 eq((await request('PATCH',{...sample,id:h.id,version:1},a.cookie)).status,409);
 const note=await request('PUT',{unit:'ochojno',body:'Sprawdzić drożność przepustu.',version:0},b.cookie);eq(note.status,200);
 eq((await request('PUT',{unit:'ochojno',body:'Starszy szkic',version:0},a.cookie)).status,409);
 eq((await request('GET',null,a.cookie)).body.notes.body,'Sprawdzić drożność przepustu.');
 eq((await request('PUT',{unit:'ochojno',body:'Sprawdzić przepust i dojazd.',version:1},a.cookie)).status,200);
 const deleted=await request('PATCH',{unit:'ochojno',id:h.id,version:h.version,deleted:true},a.cookie);eq(deleted.status,200);
 eq((await request('GET',null,b.cookie)).body.hazards.length,0);
 const restore=await request('PATCH',{unit:'ochojno',id:h.id,version:deleted.body.hazard.version,deleted:false},a.cookie);eq(restore.status,200);
 eq((await request('GET',null,b.cookie)).body.hazards.length,1);
 const poly=await request('POST',{...sample,category:'O',kind:'area',points:[{x:.1,y:.1},{x:.3,y:.1},{x:.2,y:.3}]},b.cookie);eq(poly.status,201);
 eq((await request('POST',{...sample,category:'D',kind:'line',points:[{x:.1,y:.2},{x:.8,y:.7}]},a.cookie)).status,201);
 for(const invalid of [{...sample,points:[{x:-1,y:.5}]},{...sample,category:'Z'},{...sample,description:'x'.repeat(601)},{...sample,kind:'area',points:[{x:.1,y:.1}]}])eq((await request('POST',invalid,a.cookie)).status,400);
 eq((await request('POST',sample,a.cookie,'ochojno',{},'https://other.test')).status,403);
 eq((await request('GET',null,a.cookie,'ochojno%27%20OR%201=1')).status,400);
 const admin={adminEmail:'owner@example.test',verifiedEmail:'owner@example.test'};
 const all=await request('GET',null,'','all',admin);eq(all.status,200);eq(all.body.hazards.length,3);assert(all.body.hazards.every(h=>h.canEdit));checks++;
 eq((await request('GET',null,'','all')).status,400);
 const rowsBefore=(await request('GET',null,a.cookie)).body;
 sql.close();sql=new DatabaseSync(file);
 const rowsAfter=(await request('GET',null,b.cookie)).body;
 eq(rowsAfter.hazards.map(x=>x.description),rowsBefore.hazards.map(x=>x.description));eq(rowsAfter.notes.body,'Sprawdzić przepust i dojazd.');
 eq(rowsAfter.counts.find(x=>x.unit==='ochojno').count,3);
 eq((await request('POST',{...sample,points:[{x:null,y:.4}]},a.cookie)).status,400);
 async function cross(method,payload,token='',origin=PUBLIC_MAP_ORIGIN,cookie='',ctx={}){
  const headers={'Origin':origin,'Sec-Fetch-Site':'cross-site'};
  if(token)headers['X-OSP-Session']=token;
  if(cookie)headers.Cookie=cookie;
  if(method!=='GET')headers['Content-Type']='application/json';
  const result=await handleMapHttpRequest(new Request('https://map.test/api/map?unit=wrzasowice',{method,headers,...(payload?{body:JSON.stringify(payload)}:{})}),db,ctx);
  return {status:result.status,body:await result.json(),headers:result.headers};
 }
 const preflight=await handleMapHttpRequest(new Request('https://map.test/api/map',{method:'OPTIONS',headers:{Origin:PUBLIC_MAP_ORIGIN,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type,x-osp-session'}}),db);
 eq(preflight.status,204);eq(preflight.headers.get('Access-Control-Allow-Origin'),PUBLIC_MAP_ORIGIN);eq(preflight.headers.get('Access-Control-Allow-Credentials'),null);
 const badPreflight=await handleMapHttpRequest(new Request('https://map.test/api/map',{method:'OPTIONS',headers:{Origin:'https://other.test','Access-Control-Request-Method':'POST'}}),db);eq(badPreflight.status,403);
 const extraHeader=await handleMapHttpRequest(new Request('https://map.test/api/map',{method:'OPTIONS',headers:{Origin:PUBLIC_MAP_ORIGIN,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization'}}),db);eq(extraHeader.status,403);
 const crossJoin=await cross('POST',{op:'join',unit:'wrzasowice'});eq(crossJoin.status,200);eq(crossJoin.headers.get('set-cookie'),null);eq(crossJoin.body.sessionToken.length,64);
 const crossSample={...sample,unit:'wrzasowice'};
 const crossAdded=await cross('POST',crossSample,crossJoin.body.sessionToken);eq(crossAdded.status,201);
 const crossRead=await cross('GET',null,crossJoin.body.sessionToken);eq(crossRead.body.hazards[0].canEdit,true);eq(crossRead.headers.get('Access-Control-Allow-Origin'),PUBLIC_MAP_ORIGIN);
 const cookieRead=await cross('GET',null,'',PUBLIC_MAP_ORIGIN,a.cookie,admin);eq(cookieRead.body.isCoordinator,false);eq(cookieRead.body.hazards[0].canEdit,false);
 eq((await cross('POST',crossSample,'',PUBLIC_MAP_ORIGIN,a.cookie,admin)).status,401);
 const badCross=await cross('POST',crossSample,crossJoin.body.sessionToken,'https://other.test');eq(badCross.status,403);eq(badCross.headers.get('Access-Control-Allow-Origin'),null);
 eq((await cross('PUT',{unit:'wrzasowice',body:'Ustalenia z nowego adresu.',version:0},crossJoin.body.sessionToken)).status,200);
 eq((await cross('GET',null,crossJoin.body.sessionToken)).body.notes.body,'Ustalenia z nowego adresu.');
 const crossDeleted=await cross('PATCH',{unit:'wrzasowice',id:crossAdded.body.hazard.id,version:1,deleted:true},crossJoin.body.sessionToken);eq(crossDeleted.status,200);
 eq((await cross('GET',null,crossJoin.body.sessionToken)).body.hazards.length,0);
 console.log(JSON.stringify({passed:checks,persistence:'reopened SQLite database',sessions:3,checks:'shared reads, ownership, unit access, note conflicts, revisions, geometry, origin, delete/undo, coordinator, GitHub Pages preflight and token-based cross-origin writes'}));
}finally{sql.close();rmSync(dir,{recursive:true,force:true});}

