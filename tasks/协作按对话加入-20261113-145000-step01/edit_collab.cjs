// 一次性改动脚本：协作按对话加入（task 协作按对话加入-20261113-145000-step01）
const fs=require('fs');
const root='E:/OpenCode-Source-Recovery-20261013/recovered/';
function rep(src,a,b,label){const n=src.split(a).length-1;if(n!==1)throw new Error(label+': 匹配 '+n+' 次');return src.replace(a,()=>b);}
// 1) automation-store.mjs（esm 版），改完复制到 shared 版
const f=root+'esm/000-extension.js/automation-store.mjs';
let s=fs.readFileSync(f,'utf8');
s=rep(s,"'bridge_join_collaboration','bridge_get_tool_gates']);","'bridge_join_collaboration','bridge_leave_collaboration','bridge_get_tool_gates']);",'SAFE_TOOLS');
s=rep(s,
"  definition('bridge_get_collaboration','读取协作任务',",
"  definition('bridge_leave_collaboration','退出协作','本对话退出多模型协作，回到普通对话：不再受协作职位限制，按当前规则组正常读写。仍持有运行中的协作任务时会被拒绝，先把任务更新为 blocked／review／completed。',properties({})),\n  definition('bridge_get_collaboration','读取协作任务',",'definition leave');
s=rep(s,
"definition('bridge_join_collaboration','登记协作成员','登记当前连接。",
"definition('bridge_join_collaboration','加入协作','本对话主动加入多模型协作（开关打开时才生效）。未加入的对话按普通对话使用，不受协作职位限制；加入后才受职位约束并可使用协作任务工具。本地用户未分配职位时默认使用“开发”职位。登记当前连接。",'definition join');
s=rep(s,
"  role(owner,state=this.read()){\n    if(!this.isCollaborationEnabled(state))return null;\n",
"  // 是否已加入多模型协作：原生协作 worker、原生对话（prepareNative 已分配职位）、本地用户分配过职位的成员、主动调用 bridge_join_collaboration 的对话。\n  // 旧版 join 只登记为 observer 且没有 joined 标记的记录不算加入，避免普通对话在协作开启后被降为只读。\n  isCollaborationMember(owner,state=this.read()){\n    if(!owner)return false;\n    if(String(owner).startsWith('native-chat:automation:'))return true;\n    if(this.nativeAssignments.get(owner)?.roleId)return true;\n    const agent=state.agents?.[publicAgentId(owner)];\n    if(!agent||agent.joined===false)return false;\n    return agent.joined===true||agent.assignedBy==='user'||(typeof agent.roleId==='string'&&agent.roleId!=='observer');\n  }\n  role(owner,state=this.read()){\n    if(!this.isCollaborationEnabled(state))return null;\n    if(!this.isCollaborationMember(owner,state))return null;\n",'role');
s=rep(s,
"    if(COLLABORATION_TOOLS.has(name))this.requireCollaboration();\n    if(safeCall)return;this.touch(owner);\n",
"    if(COLLABORATION_TOOLS.has(name))this.requireCollaboration();\n    if(safeCall)return;this.touch(owner);\n    if(COLLABORATION_TOOLS.has(name)&&name!=='bridge_join_collaboration'&&!this.isCollaborationMember(owner))fail('COLLABORATION_NOT_JOINED','本对话尚未加入多模型协作。需要协作时先调用 bridge_join_collaboration；不加入时按普通对话直接使用其他工具。');\n",'guard');
s=rep(s,
"roleId,kind:this.nativeAssignments.has(owner)?'native':previous?.kind||'mcp',updatedAt:now()};",
"roleId,joined:true,assignedBy:'user',kind:this.nativeAssignments.has(owner)?'native':previous?.kind||'mcp',updatedAt:now()};",'assignAgent');
s=rep(s,
"      saved.updatedAt=now();state.agents[agentId]=saved;this.touch(owner,saved.clientReportedName);\n      return {agent_id:agentId,name:saved.name,roleId:saved.roleId,",
"      // 主动加入：本地用户没分配过职位时用“开发”职位（加入不应比普通对话权限更低）；用户分配的职位保持不变。\n      if(saved.assignedBy!=='user'){const nativeRole=this.nativeAssignments.get(owner)?.roleId;saved.roleId=nativeRole||(state.roles.some(r=>r.id==='developer')?'developer':'observer');}\n      saved.joined=true;saved.joinedAt=now();\n      saved.updatedAt=now();state.agents[agentId]=saved;this.touch(owner,saved.clientReportedName);\n      return {joined:true,agent_id:agentId,name:saved.name,roleId:saved.roleId,",'join');
s=rep(s,
"    else if(name==='bridge_join_collaboration')result=await this.mutate('agents',state=>{",
"    else if(name==='bridge_leave_collaboration')result=await this.mutate('agents',state=>{\n      const agentId=publicAgentId(owner),saved=state.agents[agentId];\n      if(state.tasks.some(task=>task.status==='running'&&task.owner&&(task.owner===owner||task.owner===agentId)))fail('COLLABORATION_TASK_OWNED','本对话仍持有运行中的协作任务；先把任务更新为 blocked、review 或 completed 再退出。');\n      if(saved){saved.joined=false;saved.leftAt=now();saved.updatedAt=now();}\n      return {joined:false,agent_id:agentId,mode:'normal'};\n    });\n    else if(name==='bridge_join_collaboration')result=await this.mutate('agents',state=>{",'dispatch leave');
fs.writeFileSync(f,s,'utf8');
fs.copyFileSync(f,root+'shared/automation-store.mjs');
// 2) 工具分组：module-0140（扩展）与 module-2765（界面）里 collab 组加入 bridge_leave_collaboration
for(const p of ['esm/000-extension.js/module-0140.mjs','esm/027-workbench.desktop.main.js/module-2765.mjs']){
  let t=fs.readFileSync(root+p,'utf8');
  t=rep(t,'"bridge_join_collaboration", "bridge_get_collaboration"','"bridge_join_collaboration", "bridge_leave_collaboration", "bridge_get_collaboration"',p);
  fs.writeFileSync(root+p,t,'utf8');
}
// 3) 协作 worker 的工具过滤：与 join 一样不给 worker
for(const p of ['esm/000-extension.js/collaboration-workers.mjs','shared/collaboration-workers.mjs']){
  let t=fs.readFileSync(root+p,'utf8');
  t=rep(t,"'bridge_join_collaboration', 'bridge_checkpoint_task'","'bridge_join_collaboration', 'bridge_leave_collaboration', 'bridge_checkpoint_task'",p);
  fs.writeFileSync(root+p,t,'utf8');
}
console.log('OK');
