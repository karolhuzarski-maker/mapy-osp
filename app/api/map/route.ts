import {env} from 'cloudflare:workers';
import {handleMapHttpRequest} from '../../../lib/map-http';
export const dynamic='force-dynamic';
async function route(req:Request){if(!env.DB)return Response.json({error:'Mapa jest chwilowo niedostępna.'},{status:503});return handleMapHttpRequest(req,env.DB,{adminEmail:(env as unknown as {COORDINATOR_EMAIL?:string}).COORDINATOR_EMAIL,verifiedEmail:req.headers.get('oai-authenticated-user-id')?req.headers.get('oai-authenticated-user-email'):null});}
export {route as GET,route as POST,route as PATCH,route as PUT,route as OPTIONS};
