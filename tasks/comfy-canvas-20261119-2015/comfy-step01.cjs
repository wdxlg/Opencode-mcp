// comfy-canvas step01: ComfyUI 式端口 + 拖拽连线（核心交互）。只改 collaboration.js 与 automation.css。
const fs=require('fs');
const root='E:/OpenCode-Source-Recovery-20261013/';
const JS=root+'recovered/standalone/resources/app/extensions/opencode/media/task-workbench/collaboration.js';
const CSS=root+'assets/resources/app/extensions/opencode/media/task-workbench/automation.css';
function edit(file,pairs){let s=fs.readFileSync(file,'utf8');const crlf=s.includes('\r\n');if(crlf)s=s.replace(/\r\n/g,'\n');
  for(const [a,b,label] of pairs){const n=s.split(a).length-1;if(n!==1)throw Error(`${label}: anchor count ${n}`);s=s.replace(a,()=>b);}
  if(crlf)s=s.replace(/\n/g,'\r\n');fs.writeFileSync(file,s);}
if(fs.readFileSync(JS,'utf8').includes('comfy-canvas'))throw Error('already patched');

const FN=`  // comfy-canvas: ComfyUI 式端口与拖拽连线。下端口=管理下级；上端口=接上级（已有上级时拖起原连线：放到别的成员上改接，放到空白处删除）；左右端口=协作。Esc 取消，Delete 删除选中的连线/把选中成员移出画布。
  let wire=null;
  const PORT_R=5,PORT_TIPS={in:'上级：拖到另一位成员上，让它管理这位；已有上级时拖起原连线可改接，拖到空白处删除',out:'管理：拖到成员上，让这位管理它',left:'协作：拖到成员上建立协作连线',right:'协作：拖到成员上建立协作连线'};
  function portXY(p,side){const h=p.h||NODE_H;return side==='out'?{x:p.x+NODE_W/2,y:p.y+h}:side==='in'?{x:p.x+NODE_W/2,y:p.y}:side==='left'?{x:p.x,y:p.y+NODE_H/2}:{x:p.x+NODE_W,y:p.y+NODE_H/2};}
  function drawPorts(g,m,p){for(const side of ['in','out','left','right']){const at=portXY({x:0,y:0,h:p.h},side);
      const pg=svg('g',{class:'tc-port tc-port-'+side+(wire&&wire.id===m.id&&wire.side===side?' active':''),transform:\`translate(\${at.x},\${at.y})\`,'data-side':side});
      pg.append(svg('circle',{r:11,class:'tc-port-hit'}),svg('circle',{r:PORT_R,class:'tc-port-dot'}));const t=svg('title');t.textContent=PORT_TIPS[side];pg.append(t);
      pg.addEventListener('pointerdown',event=>{if(event.button!==0||spaceDown)return;event.preventDefault();event.stopPropagation();wireStart(m.id,side,event);});
      pg.addEventListener('click',event=>event.stopPropagation());pg.addEventListener('dblclick',event=>event.stopPropagation());
      g.append(pg);}}
  function wireStart(id,side,event){const p=positions(canvasMembers())[id];if(!p)return;
    let from=id,type=side==='out'?'manage':side==='in'?'manage-up':'peer',lift=null;
    if(side==='in'){const up=team().edges.filter(e=>e.type==='manage'&&e.to===id);if(up.length){const e=up[up.length-1];lift=e.from+'>'+e.to;from=e.from;type='manage';}}
    wire={id,side,from,type,lift,anchorId:lift?from:id,anchorSide:lift?'out':side,target:null,path:svg('path',{class:'tc-wire'+(type==='peer'?' tc-wire-peer':'')})};
    $('tc-world').append(wire.path);stageEl.classList.add('tc-wiring');try{canvasEl.setPointerCapture(event.pointerId);}catch{}
    selectedEdge=null;drawCanvas();updateHint();wireMove(event);}
  function wirePath(a,aSide,b){const d=Math.max(40,Math.min(160,Math.hypot(b.x-a.x,b.y-a.y)/2)),v={out:[0,1],in:[0,-1],left:[-1,0],right:[1,0]}[aSide]||[0,1];return \`M\${a.x},\${a.y} C\${a.x+v[0]*d},\${a.y+v[1]*d} \${b.x-v[0]*d*0.4},\${b.y-v[1]*d*0.4} \${b.x},\${b.y}\`;}
  function wireHit(pt,skip){for(const [id,p] of Object.entries(positions(canvasMembers()))){if(id===skip)continue;if(pt.x>=p.x-10&&pt.x<=p.x+NODE_W+10&&pt.y>=p.y-10&&pt.y<=p.y+p.h+10)return id;}return null;}
  function wireMove(event){if(!wire)return;const pos=positions(canvasMembers()),a=pos[wire.anchorId];if(!a)return;const s=portXY(a,wire.anchorSide),pt=toWorld(event.clientX,event.clientY);
    const t=wireHit(pt,wire.type==='manage-up'?wire.id:wire.from);let end=pt;
    if(t){const tp=pos[t];end=wire.type==='peer'?portXY(tp,tp.x+NODE_W/2<s.x?'right':'left'):wire.type==='manage-up'?portXY(tp,'out'):portXY(tp,'in');}
    wire.path.setAttribute('d',wirePath(s,wire.anchorSide,end));
    if(t!==wire.target){for(const g of $('tc-nodes').querySelectorAll('.tc-node.wire-target'))g.classList.remove('wire-target');wire.target=t;if(t)$('tc-nodes').querySelector(\`[data-id="\${CSS.escape(t)}"]\`)?.classList.add('wire-target');}}
  function wireCancel(){const w=wire;wire=null;if(!w)return null;w.path.remove();stageEl.classList.remove('tc-wiring');for(const g of $('tc-nodes').querySelectorAll('.tc-node.wire-target'))g.classList.remove('wire-target');return w;}
  async function connectEdge(from,to,type){if(!from||!to||from===to)return false;const r=await act('teamEdges',{from,to:[to],type}),ok=r?.added||[],bad=r?.skipped||[];if(!ok.length&&bad.length)notice(bad[0].reason,true);return ok.length>0;}
  async function wireEnd(){const w=wireCancel();if(!w)return;const t=w.target;
    try{
      if(w.lift){const [from,to]=w.lift.split('>');
        if(t!==to){if(t){if(t!==from&&await connectEdge(from,t,'manage'))await act('teamEdge',{from,to,type:'none'});}else await act('teamEdge',{from,to,type:'none'});}}
      else if(t){if(w.type==='manage-up')await connectEdge(t,w.id,'manage');else await connectEdge(w.id,t,w.type);}
    }catch{}
    drawCanvas();updateHint();}
`;

edit(JS,[
  ["class:'tc-edge tc-edge-'+edge.type+(sel?' selected':'')","class:'tc-edge tc-edge-'+edge.type+(sel?' selected':'')+(wire?.lift===key?' lifted':'')",'edge-lifted'],
  ["      nodes.append(g);}","      drawPorts(g,m,p);\n      nodes.append(g);}",'ports-in-draw'],
  ["  function redrawEdgesOnly(){",FN+"  function redrawEdgesOnly(){",'functions'],
  ["    if(pan){view.x=pan.ox+event.clientX-pan.sx;view.y=pan.oy+event.clientY-pan.sy;applyView();return;}","    if(wire){wireMove(event);return;}\n    if(pan){view.x=pan.ox+event.clientX-pan.sx;view.y=pan.oy+event.clientY-pan.sy;applyView();return;}",'move'],
  ["  function endPointer(){\n    if(pan){","  function endPointer(){\n    if(wire){wireEnd();return;}\n    if(pan){",'end'],
  ["document.addEventListener('keydown',event=>{if(page!=='canvas'||typing(event.target))return;","document.addEventListener('keydown',event=>{if(page!=='canvas'||typing(event.target))return;\n    if(event.key==='Escape'&&wire){event.preventDefault();wireCancel();drawCanvas();updateHint();return;}\n    if((event.key==='Delete'||event.key==='Backspace')&&!linkMode&&!wire){if(selectedEdge){event.preventDefault();const [from,to]=selectedEdge.split('>');selectedEdge=null;act('teamEdge',{from,to,type:'none'}).then(()=>{updateHint();drawCanvas();}).catch(()=>{});return;}if(selection.size){event.preventDefault();removeFromCanvas([...selection]);return;}}",'keys'],
]);

const css=`
/* comfy-canvas: ComfyUI 式端口与拖拽连线 */
.tc-port { cursor: crosshair; opacity: .45; transition: opacity .12s; }
.tc-node:hover .tc-port,.tc-node.selected .tc-port,.tc-wiring .tc-port,.tc-port.active { opacity: 1; }
.tc-port-hit { fill: transparent; stroke: none; }
.tc-port-dot { fill: var(--oc-card); stroke: var(--tc-line); stroke-width: 1.5; vector-effect: non-scaling-stroke; }
.tc-port-out .tc-port-dot,.tc-port-in .tc-port-dot { stroke: var(--tc-accent); }
.tc-port:hover .tc-port-dot,.tc-port.active .tc-port-dot { fill: var(--tc-accent); stroke: var(--tc-accent); }
.tc-wire { fill: none; stroke: var(--tc-accent); stroke-width: 2; vector-effect: non-scaling-stroke; pointer-events: none; }
.tc-wire-peer { stroke-dasharray: 6 4; }
.tc-wiring,.tc-wiring .tc-canvas,.tc-wiring .tc-node { cursor: crosshair; }
.tc-node.wire-target .tc-node-box { stroke: var(--tc-accent); stroke-width: 2.5; }
.tc-edge.lifted { opacity: .15; }
`;
{let s=fs.readFileSync(CSS,'utf8');if(s.includes('comfy-canvas'))throw Error('css already patched');const eol=s.includes('\r\n')?'\r\n':'\n';fs.writeFileSync(CSS,s.replace(/\s*$/,'')+eol+css.trim().replace(/\n/g,eol)+eol);}
console.log('PATCH_OK');

