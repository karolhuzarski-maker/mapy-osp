import {handleMapRequest,type Context,type Database} from './map-service.ts';

export const PUBLIC_MAP_ORIGIN='https://karolhuzarski-maker.github.io';
const methods=['GET','POST','PATCH','PUT'];
const allowedHeaders=['content-type','x-osp-session'];

export async function handleMapHttpRequest(req:Request,db:Database,ctx:Context={}){
 const origin=req.headers.get('origin');
 const allowed=origin===PUBLIC_MAP_ORIGIN;
 if(req.method==='OPTIONS'){
  const method=req.headers.get('access-control-request-method')??'';
  const requested=(req.headers.get('access-control-request-headers')??'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!allowed||!methods.includes(method)||requested.some(x=>!allowedHeaders.includes(x)))return new Response(null,{status:403});
  return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':PUBLIC_MAP_ORIGIN,'Access-Control-Allow-Methods':methods.join(', '),'Access-Control-Allow-Headers':allowedHeaders.join(', '),'Access-Control-Max-Age':'600','Vary':'Origin'}});
 }
 const response=await handleMapRequest(req,db,{...ctx,allowedOrigins:[PUBLIC_MAP_ORIGIN]});
 if(allowed){response.headers.set('Access-Control-Allow-Origin',PUBLIC_MAP_ORIGIN);response.headers.set('Vary','Origin');}
 return response;
}
