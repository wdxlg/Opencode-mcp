const fs=require('fs'),path=require('path'),cp=require('child_process');const root=path.resolve(__dirname,'..'),lock=root+'/.build-lock';
try{fs.mkdirSync(lock);}catch{throw Error('Another build/update or unfinished recovery owns .build-lock. Inspect owner.json before retrying.');}
fs.writeFileSync(lock+'/owner.json',JSON.stringify({pid:process.pid,at:new Date().toISOString()}));
try{for(const n of ['sync-shared.cjs','build-recovered.cjs','copy-static-assets.cjs','build-standalone.cjs','copy-defaults.cjs','verify-build.cjs',...process.argv.includes('--source-only')?[]:['publish-runtime.cjs']])cp.execFileSync(process.execPath,[root+'/scripts/'+n],{cwd:root,stdio:'inherit'});}finally{fs.rmSync(lock,{recursive:true,force:true});}
