// Maintained native-theme workbench and explicitly started model workers.
// No model requests, terminals, tests or external instances start merely by opening it.
const vscode=require('vscode');
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';


import { NativeTaskWorkers } from './collaboration-workers.mjs';

export function registerAutomationWorkbench(context,bridge,output){
  const service=bridge.automation,workers=new NativeTaskWorkers(service,bridge,output),staff=service.staff,staffWorkers=new NativeTaskWorkers(staff.facade,bridge,output),panels=new Map();
  staff.attach(bridge,staffWorkers);
  const taskService=id=>typeof id==='string'&&id.startsWith('staffjob_')?staff.facade:service;
  const selected={rules:service.currentWorkspaceId(),collaboration:service.currentWorkspaceId()};
  const screens={rules:{viewType:'opencode.rules',title:'规则中心',html:'rules.html',script:'rules.js'},collaboration:{viewType:'opencode.collaboration',title:'多任务协作',html:'collaboration.html',script:'collaboration.js'}};
  const sharedActions=new Set(['refresh','selectWorkspace','addWorkspace']);
  const pageActions={rules:new Set(['savePreset','deletePreset','selectGlobal','bindWorkspace','exportRules','saveLibraryRule','deleteLibraryRule']),collaboration:new Set(['saveEmployee','createStaffRole','bindEmployee','copyEmployeePairing','unbindEmployee','saveTeam','authorizeTeam','pauseTeam','reconcileTeam','openTeamWorkspace','openEmployeeApiSettings','setNativeTaskReviewRequired','setCollaborationEnabled','saveTaskCategory','configureTask','resumeNative','sendMessage','ackMessage','deliverLocalMessages','readExecution','openTaskDiff','refreshCatalog','saveRole','assignAgent','createTask','startNative','startQueue','stopNative','confirmTask','releaseTask','cancelTask'])};
  const snapshot=page=>{const base=service.snapshot(selected[page]),people=page==='collaboration'&&base.collaborationEnabled?staff.snapshot(selected[page]):null;if(people&&!people.error)for(const agent of base.agents){const employee=people.employees.find(item=>item.agentId===agent.id);if(employee){agent.employeeId=employee.id;agent.roleId=employee.roleId;}}return {...base,nativeWorkers:workers.snapshot(),routingCatalog:workers.catalog,staff:people,page};};
  const post=page=>{const panel=panels.get(page);if(!panel)return;try{panel.webview.postMessage({type:'state',value:snapshot(page)});}catch(error){panel.webview.postMessage({type:'error',message:error.message});}};
  const postAll=()=>{updateCollaborationStatus();for(const page of panels.keys())post(page);};
  async function open(page){
    const screen=screens[page];if(!screen)return;const existing=panels.get(page);if(existing){existing.reveal();post(page);return;}
    const directory=vscode.Uri.joinPath(context.extensionUri,'media','task-workbench');
    const panel=vscode.window.createWebviewPanel(screen.viewType,screen.title,vscode.ViewColumn.Active,{enableScripts:true,retainContextWhenHidden:true,localResourceRoots:[directory]});panels.set(page,panel);
    let html=fs.readFileSync(path.join(directory.fsPath,screen.html),'utf8');const nonce=crypto.randomBytes(18).toString('base64');
    const style=panel.webview.asWebviewUri(vscode.Uri.joinPath(directory,'automation.css')),script=panel.webview.asWebviewUri(vscode.Uri.joinPath(directory,screen.script));
    const csp=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource} data:; style-src ${panel.webview.cspSource}; script-src 'nonce-${nonce}'; connect-src 'none'; object-src 'none'; base-uri 'none'">`;
    panel.webview.html=html.replace('<head>','<head>'+csp).replace('href="automation.css"','href="'+style+'"').replace('src="'+screen.script+'"','nonce="'+nonce+'" src="'+script+'"');
    panel.onDidDispose(()=>{if(panels.get(page)===panel)panels.delete(page);});
    panel.webview.onDidReceiveMessage(async message=>{
      if(!message||typeof message!=='object')return;
      try{
        if(message.type==='ready'){if(page==='collaboration'&&service.isCollaborationEnabled())await workers.refreshCatalog();post(page);return;}
        if(message.type!=='action'||typeof message.action!=='string'||typeof message.id!=='string')return;
        if(!sharedActions.has(message.action)&&!pageActions[page].has(message.action))throw Error('此页面不支持该操作。');
        const input=message.input&&typeof message.input==='object'?message.input:{};let value;
        if(page==='collaboration'&&!['setCollaborationEnabled','refresh','selectWorkspace','stopNative','pauseTeam'].includes(message.action))service.requireCollaboration();
        if(message.action==='selectWorkspace'){service.workspace(input.workspaceId);selected[page]=input.workspaceId;}
        else if(message.action==='refresh'){if(page==='collaboration'&&service.isCollaborationEnabled())await workers.refreshCatalog();}
        else{
          /* Workspace trust check removed - all workspaces trusted by default */
          switch(message.action){
            case 'addWorkspace':{const choice=await vscode.window.showOpenDialog({canSelectFolders:true,canSelectFiles:false,canSelectMany:false,title:'指定工作区（不会更改文件访问权限）'});if(choice?.[0]){const entry=await service.registerWorkspace(choice[0].fsPath);selected[page]=entry.id;}break;}
            case 'savePreset':value=await service.savePreset(input);break;
            case 'saveLibraryRule':{const current=input.id?service.read().ruleLibrary.find(rule=>rule.id===input.id):service.read().ruleLibrary.find(rule=>rule.name===input.name?.trim());if(current){const uses=service.libraryUsage(current.id);const answer=await vscode.window.showWarningMessage(`保存库规则会同步影响 ${uses.length} 个引用规则组。是否继续？`,{modal:true},'保存库规则');if(answer!=='保存库规则')break;}value=await service.saveLibraryRule(input);break;}
            case 'deleteLibraryRule':{const answer=await vscode.window.showWarningMessage('移除库预设？已有引用将保留当前正文并变成独立规则，不删除组内内容。',{modal:true},'移除库预设');if(answer==='移除库预设')await service.deleteLibraryRule(input.libraryId,input.expected_version);break;}

            case 'deletePreset':{const answer=await vscode.window.showWarningMessage('删除未被引用的规则组？',{modal:true},'删除');if(answer==='删除')await service.deletePreset(input.presetId,input.expected_version);break;}
            case 'selectGlobal':await service.selectGlobal(input.presetId,input.expected_version);break;
            case 'bindWorkspace':await service.bindWorkspace(selected[page],input.mode,input.presetId,input.expected_version);break;
            case 'setNativeTaskReviewRequired':value=await service.setNativeTaskReviewRequired(input.required,input.expected_version);break;
            case 'setCollaborationEnabled':{
              if(typeof input.enabled!=='boolean')throw Error('协作开关必须是布尔值。');
              if(!input.enabled&&(workers.active.size||workers.queued.size||staffWorkers.active.size||staffWorkers.queued.size||staff.grants.size)){const answer=await vscode.window.showWarningMessage('关闭会清空待启动的协作队列并请求取消本机协作模型循环。已发送的命令、外部操作和费用不能保证撤销；任务所有权和记录保留。普通规则和安全确认仍有效。',{modal:true},'关闭多模型协作');if(answer!=='关闭多模型协作')break;}
              value=await service.setCollaborationEnabled(input.enabled,input.expected_version);if(input.enabled)await workers.refreshCatalog();workers.sync();break;
            }
            case 'saveEmployee':value=await staff.saveEmployee(input);break;
            case 'createStaffRole':value=await staff.createRoleTemplate(input.kind);break;
            case 'bindEmployee':value=await staff.bindMcp(input.employeeId,input.agentId);break;
            case 'copyEmployeePairing':{const code=await staff.issuePairing(input.employeeId,input.expected_version);await vscode.env.clipboard.writeText(JSON.stringify(code));value={copied:true,expires_at:code.expires_at};break;}
            case 'unbindEmployee':value=await staff.unbind(input.employeeId);break;
            case 'saveTeam':if(input.workspace_id!==selected.collaboration)throw Error('工作区已变化，请重新填写团队目标。');value=await staff.saveTeam(input);break;
            case 'authorizeTeam':{const preview=staff.previewActivation(input.runId);if(preview.version!==input.expected_version||preview.workspace.id!==selected.collaboration)throw Error('团队或当前工作区已变化，请刷新后重新确认。');const answer=await vscode.window.showWarningMessage(`授权经理管理团队“${preview.run.name}”？\n项目：${preview.workspace.root}\n目标：${preview.run.goal}\n员工：${preview.employees.map(employee=>employee.name+' ['+employee.kind+'] '+(employee.model?employee.model.vendor+'/'+employee.model.id:'外部客户端主动接单')).join('；')}\n任务总数最多 ${preview.run.maxTasks}；原生SDK请求累计 ${preview.run.nativeRequests}/${preview.run.maxNativeRequests}（恢复不重置，每次执行最多12轮，提供方内部重试依原配置，不是金额上限）。\nauto降级或单写者会由员工直接改原项目；不允许时必须选择worktree。\n隔离：${preview.run.isolation}；整合：${preview.run.requireIntegration?'要求':'未要求'}；应用回原项目：${preview.run.publishToSource?'明确授权':'未授权'}。\n经理可在上述范围内自主派工与审查，不逐张审批普通任务卡。可能产生模型费用，并向所选提供方发送授权项目上下文；外部MCP自身的费用不由本机计量。最多1个原生经理和2个原生执行员工。\n不自动测试、安装、提交或启停已有实例。未知副作用不重放；重启不自动收费续跑。`,{modal:true},'授权并启动团队');if(answer!=='授权并启动团队'){value={confirmed:false};break;}if(selected.collaboration!==preview.workspace.id)throw Error('授权期间工作区已变化。');value=await staff.activate(input.runId,preview.version,preview.fingerprint);break;}
            case 'pauseTeam':value=await staff.pause(input.runId);break;
            case 'reconcileTeam':{const answer=await vscode.window.showWarningMessage('只读取并核对未知整合的当前文件哈希，记录已完成/未执行/部分变化；不重发补丁、不改写旧回执。仍有在途命令时不要交接。',{modal:true},'核对当前文件');if(answer==='核对当前文件')value=await staff.reconcile(input.runId);break;}
            case 'openTeamWorkspace':{const state=staff.store.read(),run=staff.run(state,input.runId),manager=state.tasks.find(task=>task.staff.runId===run.id&&task.staff.manager),attempt=manager?.attempts.find(item=>item.id===manager.activeAttemptId);if(!attempt?.workspace.root)throw Error('经理执行目录尚未建立。');await vscode.commands.executeCommand('vscode.openFolder',vscode.Uri.file(attempt.workspace.root),{forceNewWindow:true});break;}
            case 'openEmployeeApiSettings':if(staff.grants.size)throw Error('先暂停团队，再调整API提供方，避免运行中改变配置。');await vscode.commands.executeCommand('aiCustomization.openManagementEditor','models');break;
            case 'saveTaskCategory':value=await service.collaboration.saveCategory(input);break;
            case 'configureTask':value=await service.collaboration.configureTask(input);break;
            case 'refreshCatalog':value=await workers.refreshCatalog();break;
            case 'resumeNative':value=await workers.authorize([input.taskId],true);break;
            case 'sendMessage':value=await service.collaboration.sendMessage(input);break;
            case 'ackMessage':value=await service.collaboration.acknowledgeMessage(input);break;
            case 'deliverLocalMessages':{let cursor=0,page;do{page=await service.collaboration.listMessages({workspace_id:selected.collaboration,after_sequence:cursor,limit:100});cursor=page.next_sequence;}while(page.has_more);value={delivered:true};break;}
            case 'readExecution':value=await taskService(input.taskId).collaboration.getExecution({task_id:input.taskId,attempt_id:input.attemptId,offset:input.offset||0,limit:100});break;
            case 'openTaskDiff':{const diff=await taskService(input.taskId).collaboration.getDiff(input.taskId,input.attemptId);const document=await vscode.workspace.openTextDocument({content:diff.text+'\n\n# 未跟踪文件（正文需另读）\n'+diff.untracked.join('\n'),language:'diff'});await vscode.window.showTextDocument(document);break;}
            case 'saveRole':value=await service.saveRole(input);break;
            case 'assignAgent':if(staff.snapshot(selected.collaboration).employees.some(employee=>employee.agentId===input.agentId))throw Error('此连接已绑定员工，请在员工配置中管理职位。');await service.assignAgent(input.agentId,input.roleId);break;
            case 'createTask':value=await service.createTask({...input,workspace_id:selected[page]});break;
            case 'startNative':value=await workers.authorize([input.taskId]);break;
            case 'startQueue':value=await workers.authorize(snapshot(page).tasks.filter(task=>task.status==='queued'&&!task.ownerAgentId).sort((a,b)=>(Date.parse(a.createdAt)||0)-(Date.parse(b.createdAt)||0)).map(task=>task.id));break;
            case 'stopNative':{const answer=await vscode.window.showWarningMessage('只取消本次模型循环，不代表命令已停止；不会强制终止已有实例。',{modal:true},'取消模型循环');if(answer==='取消模型循环')workers.stop(input.taskId);break;}
            case 'confirmTask':await taskService(input.taskId).confirmTask(input.taskId,input.expected_revision);break;
            case 'releaseTask':{const answer=await vscode.window.showWarningMessage('交接不会终止命令。请先确认文件、命令和未知结果；确认后才允许重新领取。',{modal:true},'已核对，交接');if(answer==='已核对，交接'){const taskContext=taskService(input.taskId),current=taskContext.task(taskContext.read(),input.taskId);const revision=current.status==='running'?(await taskContext.collaboration.blockInterruptedForHandoff(input.taskId,input.expected_revision)).revision:input.expected_revision;await taskContext.releaseTask(input.taskId,revision);}break;}
            case 'cancelTask':await taskService(input.taskId).cancelTask(input.taskId,input.expected_revision);break;
            case 'exportRules':{const dest=await vscode.window.showSaveDialog({saveLabel:'导出规则组与工作区绑定',filters:{JSON:['json']}});if(dest){const state=service.read();await vscode.workspace.fs.writeFile(dest,Buffer.from(JSON.stringify({format:state.format,schemaVersion:state.schemaVersion,globalPresetId:state.globalPresetId,presets:state.presets,ruleLibrary:state.ruleLibrary,ruleLibraryVersion:state.ruleLibraryVersion,bindings:state.bindings,workspaces:state.workspaces},null,2),'utf8'));}break;}
            default:throw Error('不支持此操作。');
          }
        }
        panel.webview.postMessage({type:'result',id:message.id,value});post(page);
      }catch(error){panel.webview.postMessage({type:'result',id:message.id,error:error.message});post(page);}
    },null,context.subscriptions);
  }
    const memoryScopeStatus=vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,6);memoryScopeStatus.name='MCP 权限与记忆模式';memoryScopeStatus.command='opencode.bridge.toggleWorkspaceScope';
  function updateMemoryScopeStatus(){try{const cfg=vscode.workspace.getConfiguration('opencode'),scope=cfg.get('bridge.workspaceScope','device'),ws=vscode.workspace.name;if(scope==='workspace'&&ws){memoryScopeStatus.text=`$(folder) MCP: 项目 (${ws})`;memoryScopeStatus.tooltip='当前为「项目 MCP 模式」：工具受限于工作区目录，记忆使用项目根目录 .opencode-project/。点击切换为「临时模式」';}else{memoryScopeStatus.text='$(globe) MCP: 临时 (整机设备)';memoryScopeStatus.tooltip='当前为「临时 MCP 模式」：默认拥有整机设备全部权限，记忆使用专属临时目录，不污染项目。点击切换为「项目模式」';}}catch{memoryScopeStatus.text='$(globe) MCP: 临时';}}
  updateMemoryScopeStatus();memoryScopeStatus.show();
  const toggleScopeCmd=vscode.commands.registerCommand('opencode.bridge.toggleWorkspaceScope',async()=>{try{const cfg=vscode.workspace.getConfiguration('opencode'),current=cfg.get('bridge.workspaceScope','device'),next=current==='workspace'?'device':'workspace';await cfg.update('bridge.workspaceScope',next,vscode.ConfigurationTarget.Global);updateMemoryScopeStatus();if(next==='device'){vscode.window.showInformationMessage('已切换为「临时 MCP 模式」：默认拥有整机设备所有权限，需求与随手记写入专属临时记忆目录，不污染项目。');}else{const ws=vscode.workspace.name;if(!ws){vscode.window.showWarningMessage('已切换为「项目 MCP 模式」：当前窗口未打开文件夹，打开项目文件夹可完整启用项目隔离与专属记忆。');}else{vscode.window.showInformationMessage(`已切换为「项目 MCP 模式」：工具权限受限于「${ws}」，使用项目根目录下的专属档案袋记忆。`);}}}catch(e){vscode.window.showErrorMessage('切换 MCP 模式失败：'+(e?.message||String(e)));}});
  const scopeConfigListener=vscode.workspace.onDidChangeConfiguration(e=>{if(e.affectsConfiguration('opencode.bridge.workspaceScope'))updateMemoryScopeStatus();});
  const scopeFolderListener=vscode.workspace.onDidChangeWorkspaceFolders(()=>updateMemoryScopeStatus());
  const rulesStatus=vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,8);rulesStatus.name='规则中心';rulesStatus.text='$(law) 规则组';rulesStatus.tooltip='独立规则中心：一组内可同时启用多条规则';rulesStatus.command='opencode.rules.open';rulesStatus.show();
  const collaborationStatus=vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,7);collaborationStatus.name='多任务协作';collaborationStatus.text='$(organization) 协作';collaborationStatus.tooltip='独立的职位、成员与多任务协作页面';collaborationStatus.command='opencode.collaboration.open';collaborationStatus.show();
  function updateCollaborationStatus(){try{const enabled=service.isCollaborationEnabled();collaborationStatus.text=enabled?'$(organization) 协作':'$(circle-slash) 协作已关闭';collaborationStatus.tooltip=enabled?'多模型协作已开启；职位、成员与任务有效。':'多模型协作已关闭；职位不限制普通工具。点击管理总开关。';}catch{collaborationStatus.text='$(warning) 协作状态不可用';}}
  updateCollaborationStatus();
  const unsubscribe=service.onDidChange(()=>postAll()),timer=setInterval(postAll,3000);timer.unref?.();
  context.subscriptions.push(rulesStatus,collaborationStatus,memoryScopeStatus,toggleScopeCmd,scopeConfigListener,scopeFolderListener,vscode.commands.registerCommand('opencode.rules.open',()=>open('rules')),vscode.commands.registerCommand('opencode.collaboration.open',()=>open('collaboration')),{dispose(){clearInterval(timer);unsubscribe();workers.dispose();staffWorkers.dispose();for(const panel of panels.values())panel.dispose();panels.clear();}});
}
