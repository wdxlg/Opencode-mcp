(() => {
  'use strict';
  const vscode=acquireVsCodeApi(),$=id=>document.getElementById(id),pending=new Map();
  let sequence=0,data,selectedRole,roleVersion,roleDirty=false;
  let createRequest=vscode.getState()?.createRequest,messageRequest=vscode.getState()?.messageRequest;
  const stateLabels={queued:'待领取',running:'进行中',blocked:'阻塞',review:'待审查',completed:'已完成',cancelled:'已取消'};
  function notice(message,error=false){$('feedback').textContent=message||'';$('feedback').classList.toggle('error',error);}
  function api(action,input={}){return new Promise((resolve,reject)=>{const id='ui_'+(++sequence);pending.set(id,{resolve,reject});vscode.postMessage({type:'action',id,action,input});});}
  async function act(action,input={},button){
    if(button)button.disabled=true;
    try{const value=await api(action,input);notice(value?.confirmed===false?'未启动模型；未发起本次模型请求。':'请求已处理；任务、验证与验收状态以返回记录为准。');return value;}
    catch(error){notice(error.message,true);throw error;}
    finally{if(button)button.disabled=false;}
  }
  function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
  function option(value,text){const node=element('option',text);node.value=value;return node;}
  function options(select,items,value){select.replaceChildren(...items.map(item=>option(item.id,item.name)));if(items.some(item=>item.id===value))select.value=value;}
  function tab(name){if(!['roles','staff','teams','tasks','routing','messages'].includes(name))return;currentTab=name;if(data?.collaborationEnabled&&name==='messages')drawMessages();for(const button of document.querySelectorAll('[data-tab]')){const active=button.dataset.tab===name;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}for(const panel of document.querySelectorAll('[role=tabpanel]'))panel.hidden=panel.id!=='tab-'+name;vscode.setState({...vscode.getState(),tab:name,createRequest});}
  for(const button of document.querySelectorAll('[data-tab]')){
    button.addEventListener('click',()=>tab(button.dataset.tab));
    button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const all=[...document.querySelectorAll('[data-tab]')],index=all.indexOf(button),next=all[(index+(event.key==='ArrowRight'?1:all.length-1))%all.length];tab(next.dataset.tab);next.focus();});
  }
  function fillRole(id){if(!data)return;const role=data.roles.find(item=>item.id===id);selectedRole=role?.id??null;roleVersion=role?.version;roleDirty=false;$('role-name').value=role?.name||'';$('role-instructions').value=role?.instructions||'';$('role-tools').value=(role?.allowedTools||['read_files','find_files','search_files']).join('\n');$('role-readonly').checked=role?.readOnly!==false;$('save-role').disabled=role?.id==='observer';drawRoleList();}
  function drawRoleList(){if(!data)return;$('role-list').replaceChildren();for(const role of data.roles){const button=element('button',role.name);button.className='secondary';button.classList.toggle('selected',role.id===selectedRole);button.addEventListener('click',()=>{if(roleDirty&&role.id!==selectedRole){notice('请先保存或放弃职位修改。',true);return;}fillRole(role.id);});$('role-list').append(button);}}
  function drawAgents(){
    $('agents').replaceChildren();if(!data.agents.length){const row=element('tr'),cell=element('td','当前没有经确认的 MCP 连接。完成握手并仍有请求、流连接或有效确认租约的成员才会显示；历史角色记录不列在这里。','empty');cell.colSpan=6;row.append(cell);$('agents').append(row);return;}
    for(const agent of data.agents){const row=element('tr'),name=element('td');name.append(element('span',agent.name||'未验证名称'),element('code',agent.id,'agent-id'));if(agent.sourceIdentity)name.append(element('div','模型助手来源已绑定（非AI身份认证）'+(agent.sourceIdentity.stale?' · 名称待同步':''),'meta'));row.append(name,element('td',agent.sourceIdentity?'模型助手程序来源（非模型认证）':'外部 MCP（显示名未验证）'),element('td',agent.connectionState==='stream-open'?'当前流连接':agent.connectionState==='request-active'?'请求进行中':'当前会话 · 最近确认'),element('td',agent.ruleAcknowledged?'已确认当前版本':'未确认 / 已过期'));
      const cell=element('td'),select=element('select');select.setAttribute('aria-label','分配 '+(agent.name||agent.id)+' 的职位');options(select,data.roles,agent.roleId);cell.append(select);row.append(cell);const action=element('td'),button=element('button',agent.employeeId?'员工配置管理':'分配','secondary');if(agent.employeeId){select.disabled=true;button.disabled=true;}button.addEventListener('click',()=>act('assignAgent',{agentId:agent.id,roleId:select.value},button).catch(()=>{}));action.append(button);row.append(action);$('agents').append(row);
    }
  }
  function taskButton(parent,label,action,input,disabled=false){const button=element('button',label,'secondary');button.disabled=disabled;button.addEventListener('click',()=>act(action,input,button).catch(()=>{}));parent.append(button);}
  // Local UI configuration is independent of role grants and never starts workers on load.
  let selectedCategory=null,categoryVersion=0,categoryDirty=false,editingTask=null,editingRevision=0,workspaceId,currentTab='tasks',deliveryKey='';
  const el=element;
  const expandedAttempts=new Set(),executionViews=new Map();
  const modelValue=model=>model?JSON.stringify({vendor:model.vendor,id:model.id}):'';
  const selectedValues=id=>[...$(id).selectedOptions].map(option=>option.value);
  const selectedModel=id=>$(id).value?JSON.parse($(id).value):null;
  const lines=id=>$(id).value.split(/\r?\n/).map(value=>value.trim()).filter(Boolean);
  function modelSelect(id,value){
    const node=$(id),keep=value===undefined?node.value:value;node.replaceChildren();node.append(option('','继承：类别模型／启动时选择批次默认'));
    for(const model of data.routingCatalog?.models||[])node.append(option(modelValue(model),`${model.name||model.id} · ${model.vendor}/${model.id}`));
    if(keep&&![...node.options].some(item=>item.value===keep))node.append(option(keep,'当前不可用（保留配置，不静默替换）：'+keep));node.value=keep||'';
  }
  function skillsSelect(id,values){
    const node=$(id),keep=new Set(values===undefined?selectedValues(id):values);node.replaceChildren();
    for(const skill of data.routingCatalog?.skills||[]){const item=option(skill.name,skill.name+(skill.description?' — '+skill.description.slice(0,110):''));item.selected=keep.has(skill.name);node.append(item);}
    for(const name of keep)if(!(data.routingCatalog?.skills||[]).some(skill=>skill.name===name)){const item=option(name,name+'（当前不可用；不会静默移除）');item.selected=true;node.append(item);}
  }
  function drawRouting(){
    const categories=data.taskCategories||[],list=$('category-list');list.replaceChildren();
    if(!selectedCategory&&categories.length)fillCategory(categories[0]);
    const current=categories.find(category=>category.id===selectedCategory);
    if(current&&!categoryDirty&&current.version!==categoryVersion)fillCategory(current);
    for(const category of categories){const button=el('button',category.name+(category.id===selectedCategory&&categoryDirty?' *':''));button.classList.toggle('selected',category.id===selectedCategory);button.onclick=()=>{if(categoryDirty&&selectedCategory!==category.id){notice('类别有未保存修改，请先保存或放弃。',true);return;}fillCategory(category);drawRouting();};list.append(button);}
    modelSelect('category-model');skillsSelect('category-skills');
    $('routing-catalog-state').textContent=`当前 SDK 提供 ${(data.routingCatalog?.models||[]).length} 个模型，已启用 ${(data.routingCatalog?.skills||[]).length} 项 Skill。${data.routingCatalog?.skillDiscoveryError||data.routingCatalog?.modelDiscoveryError||''}这里只读取目录，不发起模型请求。`;
    const node=$('task-category'),keep=node.value||'implementation';node.replaceChildren();for(const category of categories)node.append(option(category.id,category.name));if(categories.some(category=>category.id===keep))node.value=keep;
    modelSelect('task-model');skillsSelect('task-skills');$('task-skills').disabled=$('task-inherit-skills').checked;
    if(editingTask)$('task-edit-state').textContent=`编辑 ${editingTask.slice(0,10)} 的执行配置；版本 ${editingRevision}。目标与职位不变。`;
  }
  function fillCategory(category){if(!category)return;selectedCategory=category.id;categoryVersion=category.version||0;categoryDirty=false;$('category-name').value=category.name||'';modelSelect('category-model',modelValue(category.model));skillsSelect('category-skills',category.skills||[]);$('category-max-turns').value=category.maxTurns||12;}
  function resetTaskEditor(){editingTask=null;editingRevision=0;$('task-title').readOnly=false;$('task-goal').readOnly=false;$('task-role').disabled=false;$('task-dependencies').disabled=false;$('create-task').textContent='创建任务';$('cancel-task-edit').hidden=true;$('task-edit-state').textContent='';}
  function editTask(task){
    if(editingTask&&editingTask!==task.id){notice('请先保存或取消当前配置编辑。',true);return;}
    editingTask=task.id;editingRevision=task.revision;$('task-title').value=task.title;$('task-goal').value=task.goal;$('task-role').value=task.roleId;$('task-category').value=task.categoryId;modelSelect('task-model',modelValue(task.model));skillsSelect('task-skills',task.skills||[]);$('task-inherit-skills').checked=task.skills==null;$('task-max-turns').value=task.maxTurns??'';$('task-isolation').value=task.isolation||'auto';$('task-artifacts').value=(task.requiredArtifacts||[]).join('\n');
    const dependencies=new Set(task.dependencies);for(const item of $('task-dependencies').options)item.selected=dependencies.has(item.value);
    $('task-title').readOnly=true;$('task-goal').readOnly=true;$('task-role').disabled=true;$('task-dependencies').disabled=true;$('create-task').textContent='保存执行配置';$('cancel-task-edit').hidden=false;drawRouting();$('task-category').focus();
  }
  function taskConfiguration(){return{category_id:$('task-category').value,model:selectedModel('task-model'),skills:$('task-inherit-skills').checked?undefined:selectedValues('task-skills'),max_turns:$('task-max-turns').value===''?undefined:Number($('task-max-turns').value),isolation:$('task-isolation').value,required_artifacts:lines('task-artifacts')};}
  function describeModel(model){return model?`${model.vendor}/${model.id}`:'批次默认（启动时明确选择）';}
  function drawExecutionDetails(node,task){
    const category=(data.taskCategories||[]).find(item=>item.id===task.categoryId),configured=task.model||category?.model;
    node.append(el('p',`类别：${category?.name||task.categoryId||'历史配置'} · 请求模型：${describeModel(configured)} · Skills：${(task.skills??category?.skills??[]).join('、')||'无'} · 轮次上限：${task.maxTurns??category?.maxTurns??12}`,'task-routing'));
    const validation=task.validationState,acceptance=task.acceptanceState;
    node.append(el('p',`执行：${({not_started:'未开始',running:'执行中',blocked:'已阻塞',completed:'授权目标已交付',cancelled:'已取消',legacy_unverified:'历史结果，未建立本版执行证据'})[task.executionState]||task.executionState||'历史记录'}；验证：${({unverified:'未验证',partial:'部分／含未验证范围',verified:'已声明检查有成功回执（非需求达成证明）',failed:'存在失败检查'})[validation]||'无新式验证记录'}；用户验收：${({not_required:'未要求',pending:'待验收',accepted:'已验收',rejected:'已退回'})[acceptance]||'未单独记录'}。`,'hint'));
    if(task.nativeStartIntent&&task.status==='queued')node.append(el('p',`已保留上次启动配置：${describeModel(task.nativeStartIntent.route?.model)}；顺序 ${(task.nativeStartIntent.queuePosition||0)+1}。重启后不会自动请求，仍需明确确认。`,'hint'));
    if(task.attempts?.some(attempt=>attempt.id===task.activeAttemptId&&(attempt.unknownOperations>0||attempt.runningCommands>0)&&!attempt.reconciliation))node.append(el('p','存在未知／在途操作：先核对实际文件与命令结果，再决定交接；不自动重放。','hint'));
    if(!task.attempts?.length){if(task.status==='completed'||task.status==='review')node.append(el('p','历史结果没有本版执行回执；不据此补写验证通过。','hint'));return;}
    const details=el('details',null,'attempt-history'),key=task.id;details.open=expandedAttempts.has(key);details.ontoggle=()=>details.open?expandedAttempts.add(key):expandedAttempts.delete(key);details.append(el('summary',`执行尝试与回执（${task.attempts.length} 次，均保留）`));
    for(const attempt of [...task.attempts].reverse()){
      const row=el('section',null,'attempt-card');row.append(el('h3',`${attempt.id.slice(0,12)} · ${attempt.kind==='native'?'原生执行':'MCP 执行'} · ${attempt.displayState||attempt.state}`));
      row.append(el('p',`基线：${attempt.workspace?.baseRef||'非 Git'}；隔离：${attempt.workspace?.mode||'未知'}；模型请求：${attempt.requests||0}；工具回执：${attempt.receiptCount||0}；未知：${attempt.unknownOperations||0}；运行命令：${attempt.runningCommands||0}`,'hint'));
      row.append(el('p',`实际执行目录：${attempt.workspace?.root||'未准备完成'}；${attempt.workspace?.reason||''}`,'hint path-text'));
      row.append(el('p',`请求路由：${describeModel(attempt.route?.model)}；实际 SDK 配置：${attempt.actualModel?describeModel(attempt.actualModel):'尚未请求／未报告'}；降级：${attempt.actualModel?.fallback||'无（本版不可用则阻塞）'}。不据此认证供应商底层模型身份。`,'hint'));
      if(attempt.handoffNote)row.append(el('p',attempt.handoffNote+'（仅是明确交接记录，不改写旧工具结果）','hint'));
      row.append(el('p',`检查点：${attempt.checkpointAvailable?'已持久化':'无可恢复上下文'}；阶段：${attempt.phase||'未记录'}；最近记录：${attempt.updatedAt||attempt.createdAt}`,'hint'));
      if(attempt.result?.claims?.length)for(const claim of attempt.result.claims)row.append(el('p',`${claim.critical?'关键事实':'说明'}：${claim.text}；证据：${claim.evidence.join('、')||'无'}`,'hint'));
      if(attempt.artifacts?.length)row.append(el('pre',attempt.artifacts.map(file=>`${file.relativePath} · ${file.sha256} · ${file.bytes} 字节`).join('\n'),'receipt-files'));
      const actions=el('div',null,'actions');
      const receipts=el('button','查看真实回执','secondary');receipts.onclick=async()=>{try{const value=await api('readExecution',{taskId:task.id,attemptId:attempt.id});executionViews.set(attempt.id,{...value,receipts:value.attempt.receipts});drawTasks();}catch(error){notice(error.message,true);}};actions.append(receipts);
      if(attempt.diffAvailable){const diff=el('button','打开保留的 diff','secondary');diff.onclick=()=>act('openTaskDiff',{taskId:task.id,attemptId:attempt.id}).catch(()=>{});actions.append(diff);}
      row.append(actions);
      const view=executionViews.get(attempt.id);
      if(view){const list=el('ol',null,'receipt-list');for(const receipt of view.receipts||[]){const item=el('li');item.append(el('code',receipt.id+' · '+receipt.name));item.append(el('p',`结果：${receipt.state}${receipt.toolError?'（工具报错）':''}${receipt.partial?'（部分结果）':''}；用途：${receipt.purpose||'未声明'}；命令：${receipt.commandState||'不适用'}；退出码：${receipt.exitCode??'未提供'}`,'hint'));if(receipt.files?.length)item.append(el('pre',receipt.files.map(file=>`${file.path} · ${file.version||'无版本'} · ${file.startLine??'?'}–${file.endLine??'?'}${file.truncated?' · 截断':''}`).join('\n'),'receipt-files'));list.append(item);}row.append(list);if(view.has_more){const more=el('button','读取后续回执','secondary');more.onclick=async()=>{try{const next=await api('readExecution',{taskId:task.id,attemptId:attempt.id,offset:view.next_offset});executionViews.set(attempt.id,{...next,receipts:[...(view.receipts||[]),...(next.attempt?.receipts||[])]});drawTasks();}catch(error){notice(error.message,true);}};row.append(more);}}
      details.append(row);
    }
    if(task.result?.unverified?.length)details.append(el('p','未验证：'+task.result.unverified.join('；'),'hint'));
    if(task.result?.checks?.length)for(const check of task.result.checks)details.append(el('p',`${check.name} [${check.kind}]：${check.status}；证据：${check.evidence.join('、')||'无'}`,'hint'));
    node.append(details);
  }
  function drawMessages(){
    const waiting=(data.messages||[]).filter(message=>message.recipient==='local-user'&&message.state==='sent');
    const key=workspaceId+':'+waiting.map(message=>message.id).join(',');
    if(currentTab==='messages'&&waiting.length&&deliveryKey!==key){deliveryKey=key;api('deliverLocalMessages',{workspaceId}).catch(error=>notice(error.message,true));}
    const tasks=data.tasks||[],taskNode=$('message-task'),taskKeep=taskNode.value;taskNode.replaceChildren();for(const task of tasks)taskNode.append(option(task.id,`${task.title} · ${task.id.slice(0,10)}`));if(tasks.some(task=>task.id===taskKeep))taskNode.value=taskKeep;
    const recipient=$('message-recipient'),keep=recipient.value,recipients=new Map([['coordinator','任务创建者（协调者）'],['local-user','本地协调者']]);for(const agent of data.agents||[])recipients.set(agent.id,agent.name+' · '+agent.id.slice(0,14));for(const task of tasks)if(task.ownerAgentId)recipients.set(task.ownerAgentId,`${task.ownerName||'任务执行者'} · ${task.ownerAgentId.slice(0,14)}`);recipient.replaceChildren();for(const [id,label]of recipients)recipient.append(option(id,label));if(recipients.has(keep))recipient.value=keep;
    const messages=(data.messages||[]).filter(message=>message.workspaceId===workspaceId).sort((a,b)=>(a.state==='processed')-(b.state==='processed')||b.sequence-a.sequence),container=$('messages');container.replaceChildren();
    if(!messages.length){container.append(el('p','本工作区暂无消息；不会默认向所有成员广播。','hint'));return;}
    container.append(el('p',`共 ${messages.length} 条，优先显示未处理消息；当前显示 ${Math.min(messages.length,100)} 条。`,'hint'));
    for(const message of messages.slice(0,100)){const node=el('article',null,'message-card'),task=tasks.find(item=>item.id===message.taskId);node.append(el('h3',`${({finding:'发现',question:'问题',handoff:'交接',blocked:'阻塞'})[message.kind]||message.kind} · ${task?.title||message.taskId}`));node.append(el('p',`#${message.sequence} · ${message.sender==='local-user'?'本地协调者':message.sender} → ${message.recipient==='local-user'?'本地协调者':message.recipient} · ${({sent:'已发送（未取件）',delivered:'已送达（不等于处理）',processed:'已处理'})[message.state]||message.state}`,'hint'));node.append(el('p',message.text,'message-body'));node.append(el('p',`任务 ${message.taskId}；执行尝试 ${message.attemptId||'尚未绑定'}；${message.createdAt}`,'hint'));if(message.recipient==='local-user'&&message.state!=='processed'){const button=el('button','标记本地已处理','secondary');button.onclick=()=>act('ackMessage',{message_id:message.id}).catch(()=>{});node.append(button);}container.append(node);}
  }
  function wireCollaborationExtras(){
    for(const id of ['category-name','category-model','category-skills','category-max-turns'])$(id).addEventListener('input',()=>{categoryDirty=true;});
    $('new-category').onclick=()=>{if(categoryDirty){notice('类别有未保存修改，请先保存或放弃。',true);return;}fillCategory({id:'category-'+crypto.randomUUID(),version:0,name:'自定义类别',model:null,skills:[],maxTurns:12});categoryDirty=true;drawRouting();$('category-name').focus();};
    $('discard-category').onclick=()=>{categoryDirty=false;fillCategory((data.taskCategories||[]).find(item=>item.id===selectedCategory)||(data.taskCategories||[])[0]);drawRouting();};
    $('save-category').onclick=async()=>{if(!selectedCategory)return;try{const saved=await api('saveTaskCategory',{id:categoryVersion?selectedCategory:undefined,expected_version:categoryVersion||undefined,name:$('category-name').value,model:selectedModel('category-model'),skills:selectedValues('category-skills'),max_turns:Number($('category-max-turns').value)});fillCategory(saved);drawRouting();notice('类别已保存；不会因此启动模型或扩大权限。');}catch(error){notice(error.message,true);}};
    $('task-inherit-skills').onchange=()=>{$('task-skills').disabled=$('task-inherit-skills').checked;};
    $('cancel-task-edit').onclick=()=>{resetTaskEditor();$('task-title').value='';$('task-goal').value='';$('task-artifacts').value='';};
    $('send-message').onclick=async()=>{if(!$('message-task').value){notice('请先选择本工作区任务。',true);return;}try{const input={task_id:$('message-task').value,recipient:$('message-recipient').value,kind:$('message-kind').value,text:$('message-text').value};const body=JSON.stringify({...input,workspace_id:workspaceId});if(!messageRequest||messageRequest.body!==body)messageRequest={body,key:'local-'+crypto.randomUUID()};vscode.setState({...vscode.getState(),messageRequest});await api('sendMessage',{...input,client_request_id:messageRequest.key});messageRequest=undefined;vscode.setState({...vscode.getState(),messageRequest});$('message-text').value='';notice('已发送。送达、处理与任务完成仍分别记录。');}catch(error){notice(error.message,true);}};
  }

  function drawTasks(){
    const active=new Set(data.nativeWorkers?.active||[]),queued=new Set(data.nativeWorkers?.queued||[]),roleNames=new Map(data.roles.map(role=>[role.id,role.name]));
    $('worker-status').textContent=`原生执行槽 ${active.size}/${data.nativeWorkers?.limit||2}；本机等待 ${queued.size}`;$('start-queue').disabled=!data.tasks.some(task=>task.status==='queued'&&!task.ownerAgentId);
    $('tasks').replaceChildren();if(!data.tasks.length){$('tasks').append(element('p','暂无任务。创建明确目标后，可由外部 AI 领取，或由本地用户启动原生队列。','empty'));return;}
    const taskTime=task=>Date.parse(task.updatedAt||task.createdAt||'')||0;
    for(const task of [...data.tasks].sort((a,b)=>taskTime(b)-taskTime(a)||(Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0)||String(a.id).localeCompare(String(b.id)))){const node=element('article',undefined,'task'),header=element('header');header.append(element('h3',task.title));const status=element('span',stateLabels[task.status]||task.status,'status');status.classList.add(task.status);header.append(status);node.append(header,element('div',`${roleNames.get(task.roleId)||task.roleId} · 修订 ${task.revision} · ${task.id}`,'meta'),element('div',task.goal,'goal'));
      node.append(element('div','最近更新：'+(taskTime(task)?new Date(taskTime(task)).toLocaleString('zh-CN'):'未记录时间'),'meta'));
      if(task.status==='completed')node.append(element('div',task.acceptedBy==='local-user'?'用户已验收':'执行器自主完成；验证范围以结果记录为准','meta'));
      if(task.pauseReason)node.append(element('div',task.pauseReason,'hint'));
      if(task.dependencies?.length)node.append(element('div','依赖：'+task.dependencies.map(id=>data.tasks.find(other=>other.id===id)?.title||id).join('；'),'meta'));
      if(task.ownerAgentId)node.append(element('div','持有成员：'+(task.ownerName||data.agents.find(agent=>agent.id===task.ownerAgentId)?.name||task.ownerAgentId)+(task.attempts?.find(attempt=>attempt.id===task.activeAttemptId)?.kind==='native'?'（本机原生执行记录，非 MCP 在线声明）':task.ownerConnected?'（当前 MCP）':'（历史记录，当前未连接）'),'meta'));
      if(queued.has(task.id))node.append(element('div','本机已获启动确认，等待依赖或执行槽。','hint'));
      if(task.output){const details=element('details');details.append(element('summary','提交结果 / 阻塞记录'),element('pre',task.output));node.append(details);}
      drawExecutionDetails(node,task);
      const attempt=task.attempts?.find(item=>item.id===task.activeAttemptId),idle=!active.has(task.id)&&!queued.has(task.id);
      const actions=element('div',undefined,'actions');
      if(task.status==='queued'&&!task.ownerAgentId){const configure=element('button','配置模型 / Skills','secondary');configure.disabled=!idle;configure.onclick=()=>editTask(task);actions.append(configure);}
      if(attempt?.kind==='native'&&attempt.checkpointAvailable&&['running','blocked'].includes(task.status)&&idle)taskButton(actions,'确认后恢复上下文','resumeNative',{taskId:task.id},attempt.unknownOperations>0||attempt.runningCommands>0);
      if(task.status==='queued'&&!task.ownerAgentId)taskButton(actions,'原生执行','startNative',{taskId:task.id},active.has(task.id)||queued.has(task.id));
      if(active.has(task.id)||queued.has(task.id))taskButton(actions,'取消本机模型循环','stopNative',{taskId:task.id});
      if(task.status==='review')taskButton(actions,'确认结果完成','confirmTask',{taskId:task.id,expected_revision:task.revision});
      if(task.status==='blocked'||task.status==='review'||task.status==='running'&&attempt?.kind==='native'&&attempt.displayState==='interrupted')taskButton(actions,'核对后交接','releaseTask',{taskId:task.id,expected_revision:task.revision});
      if(['queued','blocked','review'].includes(task.status))taskButton(actions,'取消任务记录','cancelTask',{taskId:task.id,expected_revision:task.revision},active.has(task.id));
      node.append(actions);$('tasks').append(node);
    }
  }
  // Employee editors contain references only. Pairing secrets never enter webview state.
  const staffEditor={employeeId:null,employeeVersion:0,employeeDirty:false,teamId:null,teamVersion:0,teamDirty:false,workspace:null};
  const teamPhases={draft:'草案（未授权）',active:'已授权执行',paused:'已暂停',confirmation_required:'等待重新授权',needs_attention:'经理受阻，需查看记录',awaiting_acceptance:'等待已启用的本地验收',completed:'团队目标已提交'};
  function staffData(){return data.staff||{employees:[],runs:[],tasks:[],workers:{active:[],queued:[]}};}
  function staffOptions(id,items,selected,multiple=false){const node=$(id),keep=new Set(selected===undefined?(multiple?selectedValues(id):[node.value]):Array.isArray(selected)?selected:[selected]);node.replaceChildren();if(!multiple)node.append(option('','请选择'));for(const item of items){const entry=option(item.id,item.name);entry.selected=keep.has(item.id);node.append(entry);}for(const value of keep)if(value&&!items.some(item=>item.id===value)){const entry=option(value,'当前不可用（保留配置）：'+value);entry.selected=true;node.append(entry);}}
  function staffEmployeeLabel(employee){return employee.name+' · '+(employee.kind==='api'?'API':'MCP')+(employee.enabled?'':' · 已停用');}
  function fillEmployee(employee){staffEditor.employeeId=employee?.id||null;staffEditor.employeeVersion=employee?.version||0;staffEditor.employeeDirty=false;$('employee-name').value=employee?.name||'';$('employee-kind').value=employee?.kind||'api';staffOptions('employee-role',data.roles,employee?.roleId||'developer');modelSelect('employee-model',modelValue(employee?.model));$('employee-paths').value=(employee?.allowedPaths||['.']).join('\n');$('employee-shell').checked=employee?.allowShell===true;$('employee-manager').checked=employee?.canManage===true;$('employee-enabled').checked=employee?.enabled!==false;drawEmployeeFields();}
  function drawEmployeeFields(){const mcp=$('employee-kind').value==='mcp';$('employee-api-fields').hidden=mcp;$('employee-mcp-fields').hidden=!mcp;$('employee-edit-state').textContent=staffEditor.employeeId?staffEditor.employeeId+' · 配置版本 '+staffEditor.employeeVersion+(staffEditor.employeeDirty?' · 未保存':''):'新员工（保存不启动执行）';for(const id of ['employee-bind','employee-pair','employee-unbind'])$(id).disabled=!mcp||!staffEditor.employeeId||staffEditor.employeeDirty;}
  function resetTeamEditor(){staffEditor.teamId=null;staffEditor.teamVersion=0;staffEditor.teamDirty=false;staffEditor.workspace=workspaceId;$('team-name').value='';$('team-goal').value='';$('team-isolation').value='worktree';$('team-max-tasks').value='20';$('team-max-requests').value='60';$('team-integrate').checked=true;$('team-publish').checked=false;$('team-edit-state').textContent='新建团队草案（保存不会发起模型请求）';drawTeamChoices();}
  function fillTeam(run){staffEditor.teamId=run.id;staffEditor.teamVersion=run.version;staffEditor.teamDirty=false;staffEditor.workspace=run.workspaceId;$('team-name').value=run.name;$('team-goal').value=run.goal;$('team-isolation').value=run.isolation;$('team-max-tasks').value=run.maxTasks;$('team-max-requests').value=run.maxNativeRequests;$('team-integrate').checked=run.requireIntegration;$('team-publish').checked=run.publishToSource;drawTeamChoices(run.managerId,run.memberIds);$('team-edit-state').textContent=run.name+' · 配置版本 '+run.version+'（运行中不能改配置）';$('team-editor').open=true;}
  function drawTeamChoices(manager,memberIds){const employees=staffData().employees||[];staffOptions('team-manager',employees.filter(employee=>employee.enabled&&employee.canManage).map(employee=>({id:employee.id,name:staffEmployeeLabel(employee)})),manager);const managerId=$('team-manager').value;staffOptions('team-members',employees.filter(employee=>employee.enabled&&employee.id!==managerId).map(employee=>({id:employee.id,name:staffEmployeeLabel(employee)})),memberIds,true);}
  function drawStaff(){
    const state=staffData(),employees=state.employees||[];$('staff-error').hidden=!state.error;$('staff-error').textContent=state.error||'';
    if(staffEditor.workspace!==workspaceId){resetTeamEditor();}
    const list=$('employee-list');list.replaceChildren();if(!employees.length)list.append(el('p','尚未添加员工。先配置API模型或绑定一个真实MCP代理，再为其选择职位。','empty'));
    for(const employee of employees){const button=el('button',staffEmployeeLabel(employee),'secondary');button.classList.toggle('selected',employee.id===staffEditor.employeeId);button.onclick=()=>{if(staffEditor.employeeDirty&&staffEditor.employeeId!==employee.id){notice('员工配置尚未保存，请先保存或放弃。',true);return;}fillEmployee(employee);drawStaff();};list.append(button);const description=el('p',`${(data.roles.find(role=>role.id===employee.roleId)||{}).name||employee.roleId} · ${employee.kind==='api'?(employee.active?'有当前执行':'已配置模型引用'):(employee.connected?'MCP连接已确认':'等待客户端连接')} · ${employee.allowedPaths.join('、')}`,'hint staff-list-meta');list.append(description);}
    const current=employees.find(employee=>employee.id===staffEditor.employeeId);if(current&&!staffEditor.employeeDirty&&current.version!==staffEditor.employeeVersion)fillEmployee(current);
    staffOptions('employee-role',data.roles);modelSelect('employee-model');if($('employee-kind').value==='api')$('employee-model').options[0].textContent='选择已配置的真实模型（不继承其他员工）';
    staffOptions('employee-agent',(data.agents||[]).map(agent=>({id:agent.id,name:(agent.name||agent.id)+' · '+agent.id.slice(0,18)})));drawEmployeeFields();drawTeamChoices();
    const container=$('team-list');container.replaceChildren();const runs=state.runs||[];
    if(!runs.length)container.append(el('p','当前项目暂无团队。保存草案不发请求，授权启动后经理才可在范围内派工。','empty'));
    const active=new Set(state.workers?.active||[]),queued=new Set(state.workers?.queued||[]),tasks=state.tasks||[];
    for(const run of runs){const node=el('article',null,'task team-run'),header=el('header');header.append(el('h3',run.name),el('span',teamPhases[run.phase]||run.phase,'status'));node.append(header,el('p',run.goal,'goal'),el('p',run.id+' · 配置版本 '+run.version,'meta'));
      node.append(el('p',`原生请求 ${run.nativeRequests}/${run.maxNativeRequests}；任务 ${run.taskCount}/${run.maxTasks}；隔离 ${run.isolation}；整合 ${run.requireIntegration?'必须':'未要求'}；回写原项目 ${run.publishToSource?'已授权':'未授权'}。外部MCP模型费用不由本机计量。`,'hint'));
      if(run.integrationRoot)node.append(el('p','经理整合目录：'+run.integrationRoot,'path-text hint'));if(run.lastError)node.append(el('p',run.lastError,'feedback error'));if(run.pauseReason)node.append(el('p',run.pauseReason,'hint'));
      const actions=el('div',null,'actions'),edit=el('button','查看／编辑草案','secondary');edit.onclick=()=>{if(staffEditor.teamDirty&&staffEditor.teamId!==run.id){notice('请先保存或取消当前团队编辑。',true);return;}fillTeam(run);$('team-editor').scrollIntoView({block:'nearest'});};actions.append(edit);
      if(run.phase!=='completed')taskButton(actions,'授权启动／继续','authorizeTeam',{runId:run.id,expected_version:run.version},run.authorizedHere===true);
      taskButton(actions,'暂停团队','pauseTeam',{runId:run.id},['draft','paused','completed','confirmation_required'].includes(run.phase));
      if(run.integrations?.some(item=>['issued','unknown','partial'].includes(item.state)))taskButton(actions,'核对未知整合（不重发）','reconcileTeam',{runId:run.id});
      if(run.integrationRoot)taskButton(actions,'在新窗口打开整合目录','openTeamWorkspace',{runId:run.id});node.append(actions);
      const jobs=tasks.filter(task=>task.staff?.runId===run.id);if(jobs.length){const details=el('details',null,'team-jobs');details.open=true;details.append(el('summary',`团队任务（${jobs.length}）`));for(const task of jobs){const card=el('section',null,'staff-job'),employee=employees.find(item=>item.id===task.staff.employeeId);card.append(el('h4',task.title+' · '+(stateLabels[task.status]||task.status)),el('p',`${employee?.name||task.staff.employeeId} · ${task.staff.publication?'授权回写执行':task.staff.manager?'经理':'执行员工'} · ${task.id}`,'meta'));if(queued.has(task.id))card.append(el('p','本机队列等待依赖、员工空闲或执行槽。','hint'));if(task.status==='queued'&&employee?.kind==='mcp')card.append(el('p','等待外部MCP员工主动接单；本软件不自动唤醒其模型。','hint'));
          card.append(el('p',`经理审查：${({accept:'已接受（非功能验证）',rework:'要求返工'})[task.staff.review?.decision]||'尚未审查'}；整合：${task.staff.integrated?'已有整合记录，仍需匹配当前经理执行':'未整合'}`,'hint'));
          if(task.staff.review?.note)card.append(el('p',task.staff.review.note,'hint'));if(task.output){const output=el('details');output.append(el('summary','结果／阻塞记录'),el('pre',task.output));card.append(output);}drawExecutionDetails(card,task);
          const controls=el('div',null,'actions'),attempt=task.attempts?.find(item=>item.id===task.activeAttemptId);if(task.status==='review')taskButton(controls,'本地确认验收','confirmTask',{taskId:task.id,expected_revision:task.revision});if(['blocked','review'].includes(task.status)||task.status==='running'&&attempt?.displayState==='interrupted')taskButton(controls,'核对后交接','releaseTask',{taskId:task.id,expected_revision:task.revision},active.has(task.id));if(['queued','blocked','review'].includes(task.status))taskButton(controls,'取消任务记录','cancelTask',{taskId:task.id,expected_revision:task.revision},active.has(task.id));card.append(controls);details.append(card);}node.append(details);}
      container.append(node);
    }
  }
  function wireStaff(){
    for(const id of ['employee-name','employee-kind','employee-role','employee-model','employee-paths','employee-shell','employee-manager','employee-enabled'])$(id).addEventListener('input',()=>{staffEditor.employeeDirty=true;drawEmployeeFields();});
    for(const id of ['team-name','team-goal','team-manager','team-members','team-isolation','team-max-tasks','team-max-requests','team-integrate','team-publish'])$(id).addEventListener('input',()=>{staffEditor.teamDirty=true;});
    $('employee-kind').onchange=drawEmployeeFields;$('team-manager').onchange=()=>drawTeamChoices();
    $('employee-new').onclick=()=>{if(staffEditor.employeeDirty){notice('请先保存或放弃员工修改。',true);return;}fillEmployee(null);drawStaff();$('employee-name').focus();};
    $('employee-discard').onclick=()=>fillEmployee(staffData().employees.find(employee=>employee.id===staffEditor.employeeId));
    $('employee-save').onclick=async()=>{try{const value=await act('saveEmployee',{id:staffEditor.employeeId||undefined,expected_version:staffEditor.employeeVersion||undefined,name:$('employee-name').value,kind:$('employee-kind').value,roleId:$('employee-role').value,model:$('employee-kind').value==='api'?selectedModel('employee-model'):null,allowedPaths:lines('employee-paths'),allowShell:$('employee-shell').checked,canManage:$('employee-manager').checked,enabled:$('employee-enabled').checked},$('employee-save'));fillEmployee(value);notice('员工配置已保存；未发起模型请求。');await api('refresh');}catch{}};
    for(const [id,kind]of[['employee-manager-role','manager'],['employee-review-role','reviewer']])$(id).onclick=async()=>{try{const role=await act('createStaffRole',{kind},$(id));if(![...$('employee-role').options].some(item=>item.value===role.id))$('employee-role').append(option(role.id,role.name));$('employee-role').value=role.id;$('employee-manager').checked=kind==='manager';staffEditor.employeeDirty=true;drawEmployeeFields();notice('新建了独立职位模板，未覆盖已有职位；请保存员工绑定。');}catch{}};
    $('employee-api-settings').onclick=()=>act('openEmployeeApiSettings',{},$('employee-api-settings')).catch(()=>{});$('employee-model-refresh').onclick=()=>act('refreshCatalog',{},$('employee-model-refresh')).catch(()=>{});
    $('employee-bind').onclick=()=>act('bindEmployee',{employeeId:staffEditor.employeeId,agentId:$('employee-agent').value},$('employee-bind')).catch(()=>{});
    $('employee-pair').onclick=async()=>{try{await act('copyEmployeePairing',{employeeId:staffEditor.employeeId,expected_version:staffEditor.employeeVersion},$('employee-pair'));notice('一次性配对信息已复制到本机剪贴板，有效10分钟；不要写入任务、日志或公共分享。');}catch{}};
    $('employee-unbind').onclick=()=>act('unbindEmployee',{employeeId:staffEditor.employeeId},$('employee-unbind')).catch(()=>{});
    $('team-new').onclick=()=>{if(staffEditor.teamDirty){notice('请先保存或取消团队编辑。',true);return;}resetTeamEditor();$('team-editor').open=true;$('team-name').focus();};$('team-discard').onclick=resetTeamEditor;
    $('team-integrate').onchange=()=>{if(!$('team-integrate').checked)$('team-publish').checked=false;};$('team-publish').onchange=()=>{if($('team-publish').checked)$('team-integrate').checked=true;};
    $('team-save').onclick=async()=>{if(staffEditor.workspace!==workspaceId){notice('工作区已变化，请重新选择团队目标。',true);return;}try{const value=await act('saveTeam',{id:staffEditor.teamId||undefined,expected_version:staffEditor.teamVersion||undefined,workspace_id:workspaceId,name:$('team-name').value,goal:$('team-goal').value,managerId:$('team-manager').value,memberIds:selectedValues('team-members'),isolation:$('team-isolation').value,maxTasks:Number($('team-max-tasks').value),maxNativeRequests:Number($('team-max-requests').value),requireIntegration:$('team-integrate').checked,publishToSource:$('team-publish').checked},$('team-save'));fillTeam(value);notice('团队草案已保存；尚未授权，不会发起模型请求。');await api('refresh');}catch{}};
  }

  function render(value){
    const previous=data;data=value;workspaceId=data.workspaceId;
    const enabled=data.collaborationEnabled===true,toggle=$('collaboration-toggle');
    toggle.setAttribute('aria-checked',String(enabled));toggle.textContent='多模型协作：'+(enabled?'开启':'关闭');
    $('collaboration-content').hidden=!enabled;$('workspace').disabled=!enabled;$('add-workspace').disabled=!enabled;
    $('collaboration-state').textContent=enabled?'已开启：职位限制、成员登记、任务分配和原生协作执行生效。启动模型仍需单独确认。':'已关闭：职位不限制普通工具，成员与协作任务已暂停；原配置和记录保留。独立规则、认证、文件安全与原生规划模式仍有效。开启不会自动恢复模型请求。';
    $('native-review-required').checked=data.nativeTaskReviewRequired===true;$('native-review-required').disabled=!enabled;
    if(!enabled)return;
    options($('workspace'),[{id:'global',name:'通用 / 未指定工作区'},...data.workspaces.map(item=>({id:item.id,name:item.name+' — '+item.root}))],data.workspaceId);
    if(selectedRole===undefined)selectedRole=data.roles.find(role=>role.id==='developer')?.id||data.roles[0]?.id;
    if(!roleDirty&&selectedRole!==null){const item=data.roles.find(role=>role.id===selectedRole);if(!item||roleVersion!==item.version||!previous)fillRole(item?.id||data.roles[0]?.id);else drawRoleList();}else drawRoleList();
    const taskRole=$('task-role').value||'developer';options($('task-role'),data.roles,taskRole);const selectedDeps=[...$('task-dependencies').selectedOptions].map(item=>item.value);$('task-dependencies').replaceChildren(...data.tasks.filter(task=>task.status!=='cancelled').map(task=>option(task.id,task.title)));for(const item of $('task-dependencies').options)item.selected=selectedDeps.includes(item.value);
    drawAgents();drawRouting();drawMessages();drawTasks();drawStaff();
  }
  for(const id of ['role-name','role-instructions','role-tools','role-readonly'])$(id).addEventListener('input',()=>{roleDirty=true;});
  $('native-review-required').addEventListener('change',()=>{if(!data)return;act('setNativeTaskReviewRequired',{required:$('native-review-required').checked,expected_version:data.nativeTaskReviewVersion||0},$('native-review-required')).catch(()=>api('refresh').catch(()=>{}));});
  $('collaboration-toggle').addEventListener('click',()=>{if(!data)return;act('setCollaborationEnabled',{enabled:data.collaborationEnabled!==true,expected_version:data.collaborationVersion||0},$('collaboration-toggle')).catch(()=>{});});
  $('workspace').addEventListener('change',()=>act('selectWorkspace',{workspaceId:$('workspace').value}).catch(()=>{}));
  $('add-workspace').addEventListener('click',()=>act('addWorkspace',{},$('add-workspace')).catch(()=>{}));
  $('refresh').addEventListener('click',()=>act('refresh',{},$('refresh')).catch(()=>{}));
  $('new-role').addEventListener('click',()=>{if(roleDirty){notice('请先保存或放弃职位修改。',true);return;}fillRole(null);$('role-name').focus();});
  $('copy-role').addEventListener('click',()=>{selectedRole=null;roleVersion=undefined;roleDirty=true;$('role-name').value=($('role-name').value||'职位')+' 副本';$('save-role').disabled=false;drawRoleList();});
  $('discard-role').addEventListener('click',()=>fillRole(selectedRole||'developer'));
  $('save-role').addEventListener('click',async()=>{try{const value=await act('saveRole',{id:selectedRole||undefined,expected_version:roleVersion,name:$('role-name').value,instructions:$('role-instructions').value,allowedTools:$('role-tools').value.split(/[\n,]+/).map(item=>item.trim()).filter(Boolean),readOnly:$('role-readonly').checked},$('save-role'));if(value?.id){selectedRole=value.id;roleVersion=value.version;roleDirty=false;await api('refresh');}}catch{}});
  $('create-task').addEventListener('click',async()=>{if(!data)return;try{const config=taskConfiguration();if(editingTask){if(!data.tasks.some(task=>task.id===editingTask))throw Error('该任务不在当前工作区，请取消配置编辑后重新选择。');await act('configureTask',{...config,task_id:editingTask,expected_revision:editingRevision},$('create-task'));resetTaskEditor();$('task-title').value='';$('task-goal').value='';await api('refresh');return;}const input={...config,title:$('task-title').value,goal:$('task-goal').value,role_id:$('task-role').value,dependencies:[...$('task-dependencies').selectedOptions].map(item=>item.value)};const body=JSON.stringify({...input,workspace_id:data.workspaceId});if(!createRequest||createRequest.body!==body)createRequest={body,key:crypto.randomUUID()};vscode.setState({...vscode.getState(),createRequest});await act('createTask',{...input,client_request_id:createRequest.key},$('create-task'));createRequest=undefined;vscode.setState({...vscode.getState(),createRequest});$('task-title').value='';$('task-goal').value='';await api('refresh');}catch(error){notice(error.message,true);}});
  $('start-queue').addEventListener('click',()=>act('startQueue',{},$('start-queue')).catch(()=>{}));
  wireCollaborationExtras();wireStaff();
  window.addEventListener('message',event=>{const message=event.data;if(!message||typeof message!=='object')return;if(message.type==='state'){render(message.value);return;}if(message.type==='tab'){tab(message.tab);return;}if(message.type==='error'){notice(message.message,true);return;}if(message.type==='result'){const entry=pending.get(message.id);if(!entry)return;pending.delete(message.id);if(message.error)entry.reject(Error(message.error));else entry.resolve(message.value);}});
  tab(['roles','staff','teams','tasks','routing','messages'].includes(vscode.getState()?.tab)?vscode.getState().tab:'tasks');vscode.postMessage({type:'ready'});
})();
