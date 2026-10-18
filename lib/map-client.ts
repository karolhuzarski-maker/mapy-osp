export function createMapApi(endpoint='/api/map'){
 let browserSession='';
 let sessionInitialized=false;
 let joinVersion=0;
 return async function api(method:string,data?:unknown,unit?:string):Promise<any>{
  const joining=method==='POST'&&!!data&&typeof data==='object'&&'op' in data&&data.op==='join';
  const fresh=joining&&'fresh' in data&&data.fresh===true;
  const inBrowser=typeof window!=='undefined';
  const changed=()=>new Error('W innej karcie zmieniono uczestnika. Odśwież mapę przed dalszą pracą.');
  const storageFailure=()=>new Error('Nie można zapamiętać '+(fresh?'nowej mapy':'mapy')+' w tej przeglądarce. Zezwól stronie na zapisywanie danych i spróbuj ponownie.'+(fresh?' Poprzednia mapa pozostaje aktywna.':''));
  if(inBrowser){
   let stored:string;
   try{stored=localStorage.getItem('foc-osp-session')||'';}catch{throw storageFailure();}
   if(sessionInitialized&&stored!==browserSession)throw changed();
   browserSession=stored;sessionInitialized=true;
  }
  if(joining&&inBrowser){
   const key='foc-osp-storage-check-'+crypto.randomUUID(),probe='0'.repeat(64);
   try{localStorage.setItem(key,probe);if(localStorage.getItem(key)!==probe)throw new Error();localStorage.removeItem(key);}
   catch{try{localStorage.removeItem(key);}catch{}throw storageFailure();}
  }
  const requestedSession=browserSession;
  const requestedJoin=joining?++joinVersion:joinVersion;
  const headers:Record<string,string>=method==='GET'?{}:{'Content-Type':'application/json'};
  if(/^[a-f0-9]{64}$/.test(browserSession))headers['X-OSP-Session']=browserSession;
  const res=await fetch(endpoint+(unit?'?unit='+encodeURIComponent(unit):''),{method,headers,body:data?JSON.stringify(data):undefined,credentials:/^https?:/.test(endpoint)?'omit':'same-origin',cache:'no-store'});
  const body=await res.json() as any;
  if(!res.ok)throw new Error(body.error||'Nie udało się połączyć z mapą.');
  if(joining&&requestedJoin!==joinVersion)throw new Error('W międzyczasie otwarto inną mapę.');
  if(joining){
   if(typeof body.sessionToken!=='string'||!/^[a-f0-9]{64}$/.test(body.sessionToken))throw new Error('Nie udało się rozpocząć mapy. Odśwież stronę i spróbuj ponownie.');
   if(inBrowser){
    let current:string;
    try{current=localStorage.getItem('foc-osp-session')||'';}catch{throw storageFailure();}
    if(current!==requestedSession)throw changed();
    try{localStorage.setItem('foc-osp-session',body.sessionToken);if(localStorage.getItem('foc-osp-session')!==body.sessionToken)throw new Error();}
    catch{throw storageFailure();}
   }
   browserSession=body.sessionToken;
  }
  return body;
 };
}
