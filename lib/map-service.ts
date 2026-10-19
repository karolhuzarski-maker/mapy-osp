import {UNITS,CATEGORIES,type Unit} from './data.ts';
type Statement={bind:(...v:unknown[])=>Statement;first:<T=Record<string,unknown>>()=>Promise<T|null>;all:<T=Record<string,unknown>>()=>Promise<{results:T[]}>;run:()=>Promise<unknown>};
export type Database={prepare:(sql:string)=>Statement};
export type Context={adminEmail?:string;verifiedEmail?:string|null;allowedOrigins?:readonly string[]};
type Row={id:number;unit:Unit;category:string;kind:string;points:string;description:string;priority:string;owner:string;created_at:number;updated_at:number;version:number;deleted:number};
class Failure extends Error{status:number;constructor(status:number,message:string){super(message);this.status=status;}}
const units=new Set<string>(UNITS.map(x=>x.id)),cats=new Set<string>(CATEGORIES.map(x=>x.id));
const json=(data:unknown,status=200,headers:Record<string,string>={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const unitValue=(u:unknown)=>{if(typeof u!=='string'||!units.has(u))throw new Failure(400,'Wybierz właściwą miejscowość.');return u as Unit;};
function validateHazard(b:Record<string,unknown>){
 const unit=unitValue(b.unit),category=String(b.category),kind=String(b.kind);
 if(!cats.has(category)||!['point','area','line'].includes(kind))throw new Failure(400,'Wybierz kategorię zgłoszenia i rodzaj oznaczenia.');
 const points=b.points;if(!Array.isArray(points)||points.length>30||points.length<(kind==='area'?3:kind==='line'?2:1)||(kind==='point'&&points.length!==1))throw new Failure(400,'Zaznacz miejsce na mapie.');
 for(const p of points)if(!p||typeof p.x!=='number'||typeof p.y!=='number'||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1)throw new Failure(400,'Oznaczenie musi znajdować się na mapie.');
 const description=typeof b.description==='string'?b.description.trim():'';
 if(description.length>600)throw new Failure(400,'Opis może mieć najwyżej 600 znaków.');
 return{unit,category,kind,points:JSON.stringify(points),description,priority:b.priority==='high'?'high':'normal'};
}
async function digest(raw:string){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));return [...new Uint8Array(b)].map(v=>v.toString(16).padStart(2,'0')).join('');}
const participantId=(owner:string)=>owner==='coordinator'?'Koordynator':'U-'+owner.slice(0,16).toUpperCase();
const emptyNote=()=>({body:'',version:0,updated_at:0});
const clean=(r:Row,owner:string|null,admin:boolean)=>({id:r.id,unit:r.unit,category:r.category,kind:r.kind,points:JSON.parse(r.points),description:r.description,priority:r.priority,version:r.version,createdAt:r.created_at,updatedAt:r.updated_at,canEdit:admin||owner===r.owner,...(admin?{participantId:participantId(r.owner)}:{})});
export async function handleMapRequest(req:Request,db:Database,ctx:Context={}){
 try{
  const url=new URL(req.url),origin=req.headers.get('origin'),crossOrigin=!!origin&&origin!==url.origin,allowedCrossOrigin=crossOrigin&&!!ctx.allowedOrigins?.includes(origin!);
  if(crossOrigin&&!allowedCrossOrigin)throw new Failure(403,'Otwórz mapę i spróbuj ponownie.');
  const admin=!crossOrigin&&!!ctx.adminEmail&&ctx.verifiedEmail?.toLowerCase()===ctx.adminEmail.toLowerCase();
  let raw=req.headers.get('x-osp-session')?.match(/^[a-f0-9]{64}$/)?.[0]??(crossOrigin?undefined:req.headers.get('cookie')?.match(/(?:^|;\s*)osp_sid=([a-f0-9]{64})(?:;|$)/)?.[1]);let owner=raw?await digest(raw):null;
  if(owner){const s=await db.prepare('SELECT created_at FROM sessions WHERE id=?').bind(owner).first<{created_at:number}>();if(!s||s.created_at<Date.now()-30*86400000)owner=null;}
  if(req.method==='GET'){
   const requested=url.searchParams.get('unit'),unit=requested==='all'&&admin?'all':unitValue(requested);
   if(!admin&&!owner)return json({hazards:[],counts:[],notes:emptyNote(),participantNotes:[],participantId:null,isCoordinator:false});
   const conditions=['deleted=0'],values:unknown[]=[];
   if(unit!=='all'){conditions.push('unit=?');values.push(unit);}
   if(!admin){conditions.push('owner=?');values.push(owner);}
   const rows=await db.prepare('SELECT * FROM hazards WHERE '+conditions.join(' AND ')+' ORDER BY id').bind(...values).all<Row>();
   const counts=await db.prepare('SELECT unit,COUNT(*) AS count FROM hazards WHERE deleted=0'+(admin?'':' AND owner=?')+' GROUP BY unit').bind(...(admin?[]:[owner])).all<{unit:string;count:number}>();
   const note=unit==='all'?null:admin?await db.prepare('SELECT body,version,updated_at FROM notes WHERE unit=?').bind(unit).first():await db.prepare('SELECT body,version,updated_at FROM participant_notes WHERE owner=? AND unit=?').bind(owner,unit).first();
   const personalNotes=admin?await db.prepare('SELECT owner,unit,body,version,updated_at FROM participant_notes'+(unit==='all'?'':' WHERE unit=?')+' ORDER BY updated_at,owner,unit').bind(...(unit==='all'?[]:[unit])).all<{owner:string;unit:Unit;body:string;version:number;updated_at:number}>():{results:[]};
   return json({hazards:rows.results.map(r=>clean(r,owner,admin)),counts:counts.results,notes:note??emptyNote(),participantNotes:personalNotes.results.map(n=>({participantId:participantId(n.owner),unit:n.unit,body:n.body,version:n.version,updatedAt:n.updated_at})),participantId:owner?participantId(owner):null,isCoordinator:admin});
  }
  if(!['POST','PATCH','PUT'].includes(req.method))return json({error:'Niedozwolona operacja.'},405);
  if((origin!==url.origin&&!allowedCrossOrigin)||(!allowedCrossOrigin&&req.headers.get('sec-fetch-site')==='cross-site'))throw new Failure(403,'Otwórz mapę i spróbuj ponownie.');
  if(!req.headers.get('content-type')?.startsWith('application/json'))throw new Failure(415,'Wymagane dane formularza.');
  const text=await req.text();if(text.length>18000)throw new Failure(413,'Wpis jest zbyt długi.');let b:Record<string,unknown>;
  try{b=JSON.parse(text);}catch{throw new Failure(400,'Nieprawidłowe dane formularza.');}
  if(!b||typeof b!=='object'||Array.isArray(b))throw new Failure(400,'Nieprawidłowe dane formularza.');const unit=unitValue(b.unit),now=Date.now();
  if(req.method==='POST'&&b.op==='join'){
   if(b.fresh!==undefined&&typeof b.fresh!=='boolean')throw new Failure(400,'Nieprawidłowe żądanie nowej mapy.');
   let cookie='';if(!owner||b.fresh===true){const id=[...crypto.getRandomValues(new Uint8Array(32))].map(v=>v.toString(16).padStart(2,'0')).join('');raw=id;owner=await digest(id);await db.prepare('INSERT INTO sessions(id,created_at) VALUES(?,?)').bind(owner,now).run();cookie=crossOrigin?'':`osp_sid=${id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${url.protocol==='https:'?'; Secure':''}`;}
   await db.prepare('INSERT OR IGNORE INTO memberships(session_id,unit) VALUES(?,?)').bind(owner,unit).run();return json({ok:true,sessionToken:raw,participantId:participantId(owner)},200,cookie?{'Set-Cookie':cookie}:{});
  }
  if(!owner&&!admin)throw new Failure(401,'Odśwież mapę, aby rozpocząć pracę.');
  if(!admin&&!await db.prepare('SELECT unit FROM memberships WHERE session_id=? AND unit=?').bind(owner,unit).first())throw new Failure(403,'Najpierw otwórz mapę tej miejscowości.');
  if(req.method==='POST'){
   const h=validateHazard(b),count=await db.prepare('SELECT COUNT(*) AS n FROM hazards WHERE owner=? AND created_at>?').bind(owner,now-3600000).first<{n:number}>();if((count?.n??0)>=100)throw new Failure(429,'Zapisano już wiele zgłoszeń. Spróbuj ponownie później.');
   const row=await db.prepare('INSERT INTO hazards(unit,category,kind,points,description,priority,owner,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?) RETURNING *').bind(h.unit,h.category,h.kind,h.points,h.description,h.priority,owner??'coordinator',now,now).first<Row>();if(!row)throw new Error('Insert failed');return json({hazard:clean(row,owner,admin)},201);
  }
  if(req.method==='PUT'){
   const body=typeof b.body==='string'?b.body.trim():'';if(body.length>3000||!Number.isInteger(b.version)||Number(b.version)<0)throw new Failure(400,'Sprawdź treść ustaleń.');let note;
   if(admin){
    if(b.version===0)note=await db.prepare('INSERT INTO notes(unit,body,version,updated_at) VALUES(?,?,1,?) ON CONFLICT(unit) DO NOTHING RETURNING body,version,updated_at').bind(unit,body,now).first();
    else note=await db.prepare('UPDATE notes SET body=?,version=version+1,updated_at=? WHERE unit=? AND version=? RETURNING body,version,updated_at').bind(body,now,unit,b.version).first();
   }else{
    if(b.version===0)note=await db.prepare('INSERT INTO participant_notes(owner,unit,body,version,updated_at) VALUES(?,?,?,1,?) ON CONFLICT(owner,unit) DO NOTHING RETURNING body,version,updated_at').bind(owner,unit,body,now).first();
    else note=await db.prepare('UPDATE participant_notes SET body=?,version=version+1,updated_at=? WHERE owner=? AND unit=? AND version=? RETURNING body,version,updated_at').bind(body,now,owner,unit,b.version).first();
   }
   if(!note)throw new Failure(409,'Te notatki zmieniły się w międzyczasie. Wczytaj je przed kolejnym zapisem.');return json({notes:note});
  }
  if(!Number.isInteger(b.id)||!Number.isInteger(b.version))throw new Failure(400,'Nieprawidłowe zgłoszenie.');
  const existing=await db.prepare('SELECT * FROM hazards WHERE id=? AND unit=?').bind(b.id,unit).first<Row>();if(!existing)throw new Failure(404,'Nie znaleziono zgłoszenia.');
  if(!admin&&existing.owner!==owner)throw new Failure(403,'Możesz zmieniać swoje zgłoszenia. Koordynator może poprawić pozostałe.');if(existing.version!==b.version)throw new Failure(409,'Zgłoszenie zmieniło się w międzyczasie. Odśwież mapę.');let row:Row|null;
  if(typeof b.deleted==='boolean')row=await db.prepare('UPDATE hazards SET deleted=?,version=version+1,updated_at=? WHERE id=? AND version=? RETURNING *').bind(b.deleted?1:0,now,b.id,b.version).first<Row>();
  else{const h=validateHazard(b);row=await db.prepare('UPDATE hazards SET category=?,kind=?,points=?,description=?,priority=?,updated_at=?,version=version+1 WHERE id=? AND version=? RETURNING *').bind(h.category,h.kind,h.points,h.description,h.priority,now,b.id,b.version).first<Row>();}
  if(!row)throw new Failure(409,'Zgłoszenie zmieniło się w międzyczasie. Odśwież mapę.');return json({hazard:clean(row,owner,admin)});
 }catch(e){if(e instanceof Failure)return json({error:e.message},e.status);console.error('Map request failed',e instanceof Error?e.message:'unknown');return json({error:'Nie udało się zapisać. Spróbuj ponownie; Twój wpis pozostaje w formularzu.'},500);}
}
