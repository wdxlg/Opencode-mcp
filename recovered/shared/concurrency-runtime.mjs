// Shared maintained source. Copied to bundle-local inputs by sync-shared.cjs.
import net from 'node:net';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { monitorEventLoopDelay } from 'node:perf_hooks';
const eventLoopDelay=monitorEventLoopDelay({resolution:50});eventLoopDelay.enable();

export class FairSemaphore {
  constructor(limit, ownerLimit) { this.max=limit; this.ownerLimit=ownerLimit; this.current=0; this.owners=new Map(); this.queues=new Map(); this.order=[]; this.closed=false; }
  get active(){return this.current;} get limit(){return this.max;}
  get waiting(){return [...this.queues.values()].reduce((n,q)=>n+q.length,0);}
  setLimit(n){if(!Number.isInteger(n)||n<1)throw Error('Invalid limit');this.max=n;this.drain();}
  acquire(signal,owner='default') {
    if(this.closed)return Promise.reject(Error('Scheduler disposed'));
    if(signal?.aborted)return Promise.reject(signal.reason||Error('Aborted'));
    if(this.waiting>=1024)return Promise.reject(Object.assign(Error('QUEUE_FULL: retry with backoff'),{code:'QUEUE_FULL'}));
    return new Promise((resolve,reject)=>{
      const entry={owner,resolve,reject,signal};
      entry.abort=()=>{const q=this.queues.get(owner);if(q){const i=q.indexOf(entry);if(i>=0)q.splice(i,1);if(!q.length){this.queues.delete(owner);this.order=this.order.filter(k=>k!==owner);}}reject(signal.reason||Error('Aborted'));this.drain();};
      signal?.addEventListener('abort',entry.abort,{once:true});
      if(!this.queues.has(owner)){this.queues.set(owner,[]);this.order.push(owner);}
      this.queues.get(owner).push(entry);this.drain();
    });
  }
  drain(){
    let skipped=0;
    while(this.current<this.max&&this.order.length&&skipped<this.order.length){
      const owner=this.order.shift(),q=this.queues.get(owner);
      if(!q?.length){this.queues.delete(owner);skipped=0;continue;}
      const cap=this.ownerLimit||Math.max(1,Math.ceil(this.max/2));
      if((this.owners.get(owner)||0)>=cap){this.order.push(owner);skipped++;continue;}
      const e=q.shift();if(q.length)this.order.push(owner);else this.queues.delete(owner);
      e.signal?.removeEventListener('abort',e.abort);if(e.signal?.aborted){e.reject(e.signal.reason||Error('Aborted'));continue;}
      this.current++;this.owners.set(owner,(this.owners.get(owner)||0)+1);skipped=0;let released=false;
      e.resolve(()=>{if(released)return;released=true;this.current--;const n=(this.owners.get(owner)||1)-1;if(n)this.owners.set(owner,n);else this.owners.delete(owner);this.drain();});
    }
  }
  async run(fn,signal,owner){const release=await this.acquire(signal,owner);try{return await fn();}finally{release();}}
  dispose(){this.closed=true;for(const q of this.queues.values())for(const e of q){e.signal?.removeEventListener('abort',e.abort);e.reject(Error('Scheduler disposed'));}this.queues.clear();this.order=[];}
  snapshot(){return {active:this.active,waiting:this.waiting,limit:this.limit,owners:this.owners.size};}
}

export class ChunkRing {
  constructor(max=2*1024*1024){this.max=max;this.chunks=[];this.head=0;this.length=0;}
  append(value){let b=Buffer.isBuffer(value)?value:Buffer.from(value);if(!b.length)return;if(b.length>=this.max){this.chunks=[Buffer.from(b.subarray(b.length-this.max))];this.head=0;this.length=this.max;return;}
    this.chunks.push(b);this.length+=b.length;
    while(this.length>this.max){const excess=this.length-this.max,first=this.chunks[this.head];if(first.length<=excess){this.length-=first.length;this.chunks[this.head++]=null;}else{this.chunks[this.head]=first.subarray(excess);this.length-=excess;}}
    if(this.head>1024&&this.head>this.chunks.length/2){this.chunks=this.chunks.slice(this.head);this.head=0;}
  }
  subarray(start=0,end=this.length){start=Math.max(0,start<0?this.length+start:start);end=Math.min(this.length,end);if(end<=start)return Buffer.alloc(0);const result=[];let offset=0;for(let i=this.head;i<this.chunks.length&&offset<end;i++){const b=this.chunks[i],next=offset+b.length;if(next>start)result.push(b.subarray(Math.max(0,start-offset),Math.min(b.length,end-offset)));offset=next;}return Buffer.concat(result,end-start);}
  toString(encoding='utf8'){return this.subarray().toString(encoding);}
}

export async function canonicalResource(file){
  let p=path.resolve(file),tail=[];
  for(;;){try{p=await fs.realpath(p);break;}catch(e){if(e.code!=='ENOENT')throw e;const parent=path.dirname(p);if(parent===p)throw e;tail.unshift(path.basename(p));p=parent;}}
  p=path.join(p,...tail);return process.platform==='win32'?p.toLowerCase():p;
}
export function resourcePort(key){if(key.startsWith('process-slot:'))return 18000+Number(key.split(':')[1]);if(key.startsWith('workspace-mutation:'))return 18010+crypto.createHash('sha256').update(key).digest().readUInt32BE(0)%1000;return 20000+crypto.createHash('sha256').update('opencode-resource-v1\0'+key).digest().readUInt32BE(0)%24000;}
// Kernel-owned exclusive listeners: process exit releases ownership, no stale lease stealing.
// Hash collisions conservatively serialize unrelated resources. No data or RPC is accepted.
export async function acquireResources(keys,{signal,timeoutMs=120000}={}){
  const ports=[...new Set(keys.map(resourcePort))].sort((a,b)=>a-b),servers=[];const start=Date.now();
  const release=()=>{while(servers.length){const s=servers.pop();s.close();}};
  try{for(const port of ports){for(;;){if(signal?.aborted)throw signal.reason||Error('Aborted');if(Date.now()-start>=timeoutMs)throw Object.assign(Error('RESOURCE_BUSY: cross-instance resource wait timed out'),{code:'RESOURCE_BUSY'});
      const server=net.createServer(socket=>socket.destroy());
      const held=await new Promise((resolve,reject)=>{server.once('error',e=>{if(e.code==='EADDRINUSE'||e.code==='EACCES')resolve(false);else reject(e);});server.listen({host:'127.0.0.1',port,exclusive:true},()=>resolve(true));});
      if(held){server.unref();servers.push(server);break;}
      await new Promise(resolve=>setTimeout(resolve,25+Math.floor(Math.random()*25)));
    }}if(signal?.aborted)throw signal.reason||Error('Aborted');let done=false;return ()=>{if(!done){done=true;release();}};
  }catch(e){release();throw e;}
}
export async function withResourceLocks(paths,fn,signal){const keys=await Promise.all(paths.map(canonicalResource));const release=await acquireResources(keys,{signal});try{return await fn();}finally{release();}}
export function systemPressure(){const stalled=eventLoopDelay.max>250e6;eventLoopDelay.reset();return stalled || os.freemem()/os.totalmem()<0.08;}

// Actual command leases outlive RPC replies. All host processes share the same slot namespace.
export class ProcessBudget {
  constructor(limit=4){
    this.limit=limit;
    this.local=new FairSemaphore(limit,Math.max(1,Math.ceil(limit/2)));
    this.backgroundSlots=Math.max(1,Math.floor(limit/2));
    this.backgroundLocal=new FairSemaphore(this.backgroundSlots,1);
    this.releases=new Set();
  }
  async acquire(owner,signal,{background=false,timeoutMs=10000}={}){
    const waitMs=Math.max(1,Math.min(120000,Number.isFinite(timeoutMs)?timeoutMs:10000));
    const controller=new AbortController();
    const busy=()=>Object.assign(new Error(
      `PROCESS_BUDGET_BUSY: command not started; no available command slot within ${waitMs} ms `+
      `(global limit=${this.limit}, background slots=${this.backgroundSlots}). `+
      'Read or cancel only your existing authorized command handles; do not blindly retry or stop other owners.'
    ),{code:'PROCESS_BUDGET_BUSY',phase:'process-budget',command_started:false,wait_ms:waitMs});
    const cancel=()=>controller.abort(signal.reason||new Error('Aborted'));
    const timer=setTimeout(()=>controller.abort(busy()),waitMs);
    if(signal?.aborted)cancel();else signal?.addEventListener('abort',cancel,{once:true});
    let local,backgroundLease;
    try{
      // Waiting background requests must not consume the foreground local allowance.
      if(background)backgroundLease=await this.backgroundLocal.acquire(controller.signal,owner);
      local=await this.local.acquire(controller.signal,owner);
      const slots=background?Array.from({length:this.backgroundSlots},(_,i)=>i):
        Array.from({length:this.limit},(_,i)=>this.limit-1-i);
      for(;;){
        controller.signal.throwIfAborted();
        for(const i of slots){
          try{
            const slot=await acquireResources(['process-slot:'+i],{signal:controller.signal,timeoutMs:12});
            if(controller.signal.aborted){slot();controller.signal.throwIfAborted();}
            let done=false;
            const release=()=>{if(done)return;done=true;slot();local();backgroundLease?.();this.releases.delete(release);};
            this.releases.add(release);
            return release;
          }catch(e){if(e.code!=='RESOURCE_BUSY')throw e;}
        }
        await new Promise(resolve=>setTimeout(resolve,25));
      }
    }catch(e){local?.();backgroundLease?.();throw e;}
    finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
  }
  dispose(){this.backgroundLocal.dispose();this.local.dispose();for(const release of [...this.releases])release();}
}
