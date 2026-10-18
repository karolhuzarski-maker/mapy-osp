import assert from 'node:assert/strict';
import {createMapApi} from '../lib/map-client.ts';

const previous = {fetch:globalThis.fetch, window:globalThis.window, localStorage:globalThis.localStorage};
const storage = new Map();
const oldToken = 'a'.repeat(64), newToken = 'b'.repeat(64);
globalThis.window = {};
globalThis.localStorage = {getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const ok = value=>new Response(JSON.stringify(value),{status:200,headers:{'Content-Type':'application/json'}});
try {
  storage.set('foc-osp-session',oldToken);
  let pending=[];
  globalThis.fetch = (url, options)=>new Promise(resolve=>pending.push({url,options,resolve}));
  const api=createMapApi('https://example.test/api/map');
  const first=api('POST',{op:'join',unit:'ochojno'});
  const rejectedFirst=assert.rejects(first,/inną mapę/);
  const second=api('POST',{op:'join',unit:'ochojno',fresh:true});
  assert.equal(pending[1].options.headers['X-OSP-Session'],oldToken);
  assert.equal(pending[1].options.credentials,'omit');
  pending[1].resolve(ok({sessionToken:newToken}));
  await second;
  pending[0].resolve(ok({sessionToken:'c'.repeat(64)}));
  await rejectedFirst;
  assert.equal(storage.get('foc-osp-session'),newToken,'Stale join must not replace the new participant');

  globalThis.fetch=async()=>new Response(JSON.stringify({error:'Nie zapisano',sessionToken:oldToken}),{status:500});
  await assert.rejects(api('POST',{op:'join',unit:'ochojno',fresh:true}),/Nie zapisano/);
  assert.equal(storage.get('foc-osp-session'),newToken,'Failed response must preserve the active participant');

  globalThis.fetch=async()=>ok({sessionToken:'invalid'});
  await assert.rejects(api('POST',{op:'join',unit:'ochojno'}),/Nie udało się rozpocząć mapy/);
  assert.equal(storage.get('foc-osp-session'),newToken,'Invalid token must not be persisted');

  let calls=0;
  globalThis.fetch=async()=>{calls++;return ok({});};
  globalThis.localStorage.setItem=()=>{throw new Error('Storage blocked');};
  await assert.rejects(api('POST',{op:'join',unit:'ochojno',fresh:true}),/Poprzednia mapa pozostaje aktywna/);
  assert.equal(calls,0,'Do not rotate a participant when the browser cannot retain the new token');
  const initial=createMapApi('https://example.test/api/map');
  await assert.rejects(initial('POST',{op:'join',unit:'ochojno'}),/Zezwól stronie na zapisywanie danych/);
  assert.equal(calls,0,'The first join also requires writable storage before contacting the server');

  globalThis.localStorage.setItem=(key,value)=>storage.set(key,value);
  storage.set('foc-osp-session',oldToken);
  globalThis.fetch=async()=>{calls++;return ok({hazards:[]});};
  await assert.rejects(api('GET',undefined,'ochojno'),/Odśwież mapę/);
  await assert.rejects(api('POST',{unit:'ochojno',description:''}),/Odśwież mapę/);
  assert.equal(calls,0,'An active instance must not silently switch another participant into reads or writes');

  // A response from another tab must not overwrite a newer participant's token.
  const otherTab=createMapApi('https://example.test/api/map');
  let finish;
  globalThis.fetch=()=>new Promise(resolve=>finish=resolve);
  const oldJoin=otherTab('POST',{op:'join',unit:'ochojno'});
  const rejectedOldJoin=assert.rejects(oldJoin,/Odśwież mapę/);
  storage.set('foc-osp-session',newToken);
  finish(ok({sessionToken:oldToken}));
  await rejectedOldJoin;
  assert.equal(storage.get('foc-osp-session'),newToken,'A late join from another tab must preserve the fresh participant');

  const clearedTab=createMapApi('https://example.test/api/map');
  const clearedJoin=clearedTab('POST',{op:'join',unit:'ochojno'});
  const rejectedClearedJoin=assert.rejects(clearedJoin,/Odśwież mapę/);
  storage.delete('foc-osp-session');
  finish(ok({sessionToken:newToken}));
  await rejectedClearedJoin;
  assert.equal(storage.has('foc-osp-session'),false,'An old response must not resurrect a cleared participant');

  // A storage probe can pass even when the actual token cannot be persisted.
  storage.set('foc-osp-session',oldToken);
  const failedPersistence=createMapApi('https://example.test/api/map');
  globalThis.localStorage.setItem=(key,value)=>{if(key==='foc-osp-session')throw new Error('Quota exceeded');storage.set(key,value);};
  globalThis.fetch=async()=>ok({sessionToken:newToken});
  await assert.rejects(failedPersistence('POST',{op:'join',unit:'ochojno',fresh:true}),/Nie można zapamiętać nowej mapy/);
  assert.equal(storage.get('foc-osp-session'),oldToken,'Failed final persistence must keep the previous participant');
  globalThis.localStorage.setItem=(key,value)=>storage.set(key,value);
  globalThis.fetch=async(url,options)=>{assert.equal(options.headers['X-OSP-Session'],oldToken);return ok({hazards:[]});};
  await failedPersistence('GET',undefined,'ochojno');

  storage.clear();
  const firstPersistence=createMapApi('https://example.test/api/map');
  globalThis.localStorage.setItem=(key,value)=>{if(key==='foc-osp-session')throw new Error('Quota exceeded');storage.set(key,value);};
  globalThis.fetch=async()=>ok({sessionToken:newToken});
  await assert.rejects(firstPersistence('POST',{op:'join',unit:'ochojno'}),/Nie można zapamiętać mapy/);
  assert.equal(storage.has('foc-osp-session'),false,'An unretained first session must report failure instead of opening an unauthenticated map');
  console.log('Map client: first and fresh joins, same-tab and cross-tab races, participant changes, invalid tokens and storage persistence checks passed.');
} finally {
  for(const [key,value] of Object.entries(previous)) {
    if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
}
