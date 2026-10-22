"""Prepare ignored native build inputs from this release's sanitized ZIP; no application execution."""
from pathlib import Path, PurePosixPath
import json, sys, zipfile, hashlib
root=Path(__file__).resolve().parent.parent
base=root/'baseline'
if base.exists():raise SystemExit('baseline already exists; refusing overwrite')
with zipfile.ZipFile(sys.argv[1]) as z:
 entries={}
 for n in z.namelist():
  p=PurePosixPath(n)
  if n.endswith('/'):continue
  if p.parts[0]!='OpenCode' or any(x in ('.','..','data','.git','.recovery-profile','skills','OpenCode-Skills') for x in p.parts) or ':' in n or chr(92) in n:raise SystemExit('Unsafe runtime member')
  rel='/'.join(p.parts[1:]);entries[rel]=n
 for rel,n in entries.items():
  if rel in ('OPENCODE-RELEASE.json','DISTRIBUTION.json','README-DISTRIBUTION.txt'):continue
  dest=base/rel;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(z.read(n))
 manifest=json.loads((root/'defaults/manifest.json').read_text(encoding='utf-8'))
 for f in manifest['files']:
  if not f['path'].startswith('rea/node_modules/'):continue
  rel='resources/app/extensions/opencode/defaults/'+f['path']
  data=z.read(entries[rel])
  if hashlib.sha256(data).hexdigest()!=f['sha256']:raise SystemExit('Dependency hash mismatch')
  target=root/'defaults'/f['path']
  if target.exists():raise SystemExit('Dependency file already exists; refusing overwrite')
  target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
print('Prepared native baseline and pinned REA dependencies; no program or tests executed')
