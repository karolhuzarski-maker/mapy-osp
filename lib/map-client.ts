export function createMapApi(endpoint='/api/map'){
 let browserSession='';
 return async function api(method:string,data?:unknown,unit?:string):Promise<any>{
  try{if(!browserSession&&typeof window!=='undefined')browserSession=localStorage.getItem('foc-osp-session')||'';}catch{}
  const headers:Record<string,string>=method==='GET'?{}:{'Content-Type':'application/json'};
  if(/^[a-f0-9]{64}$/.test(browserSession))headers['X-OSP-Session']=browserSession;
  const res=await fetch(endpoint+(unit?'?unit='+encodeURIComponent(unit):''),{method,headers,body:data?JSON.stringify(data):undefined,credentials:/^https?:/.test(endpoint)?'omit':'same-origin',cache:'no-store'});
  const body=await res.json() as any;
  if(body.sessionToken){browserSession=body.sessionToken;try{localStorage.setItem('foc-osp-session',browserSession);}catch{}}
  if(!res.ok)throw new Error(body.error||'Nie udało się połączyć z mapą.');
  return body;
 };
}
