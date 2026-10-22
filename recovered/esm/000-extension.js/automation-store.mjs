// Maintained source: version-independent rules and cooperative task ownership.
// Text instructions are not proof of model understanding and are not an OS sandbox.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { withResourceLocks } from './concurrency-runtime.mjs';
import { now, digest, publicAgentId, fail, cleanText, requiredText, TASK_OPTION_FIELDS, RESULT_SCHEMA, EXECUTION_SCOPED_TOOLS } from './collaboration-contracts.mjs';
import { CollaborationRuntime, initializeCollaborationState, validateCollaborationState } from './collaboration-runtime.mjs';
import { StaffService } from './collaboration-staff.mjs';
import { STAFF_TOOL_DEFINITIONS, STAFF_TOOL_NAMES, STAFF_READ_TOOLS, STAFF_MANAGER_TOOLS } from './collaboration-staff-contracts.mjs';

const FORMAT = 'opencode.rules-and-collaboration';
const SCHEMA = 4;
const LEGACY_TASK_WORKFLOW_TEXT = "每次对话先创建或更新 Bridge 任务卡，等待确认。";
const TASK_WORKFLOW_TEXT = "每次对话由 AI 自行创建、更新并收尾自己的 Bridge 任务卡；确认指工具返回的成功回执，不是等待用户点击或人工验收。实际工作完成后由 AI 提交 completed，实际受阻则提交 blocked/cancelled；不得要求用户手动完成普通会话任务卡，也不得把未做的检查写成通过。若任务卡同步失败，尝试 Bridge update_plan 一次后继续已授权且被工具允许的工作，并如实说明同步失败，不把卡片同步问题转嫁给用户；规则、权限和身份门禁拒绝不得绕过。只有真实需求不明确或操作超出授权时才询问。";
const DEFAULT_RULE_LIBRARY = [{"id": "lib_task_workflow", "name": "任务卡与工作流", "text": "每次对话由 AI 自行创建、更新并收尾自己的 Bridge 任务卡；确认指工具返回的成功回执，不是等待用户点击或人工验收。实际工作完成后由 AI 提交 completed，实际受阻则提交 blocked/cancelled；不得要求用户手动完成普通会话任务卡，也不得把未做的检查写成通过。若任务卡同步失败，尝试 Bridge update_plan 一次后继续已授权且被工具允许的工作，并如实说明同步失败，不把卡片同步问题转嫁给用户；规则、权限和身份门禁拒绝不得绕过。只有真实需求不明确或操作超出授权时才询问。", "version": 1, "updatedAt": null, "origin": "bundled-copy-prompt"}, {"id": "lib_bash", "name": "Bash 终端约定", "text": "终端统一使用 Bash，不按操作系统猜测 Shell。", "version": 1, "updatedAt": null, "origin": "bundled-copy-prompt"}, {"id": "lib_skills_read", "name": "Skills 发现与读取", "text": "连接和任务卡确认后，主动了解并按需使用我本机已安装的 Skills：\n先通过 tools/list 确认接口，优先调用 list_skills，了解可用技能的名称与用途；技能目录和文件路径以接口实际返回为准，不猜测默认目录，不扫描无关磁盘。如果工具不存在或列举失败，应如实说明，不能把失败说成“没有技能”。\n对我点名或当前任务相关的 Skill，先读取其返回的 skillFile（SKILL.md 或 skill.md）正文，再按需读取它引用的说明、模板和资源；理解用途、适用条件、步骤、依赖与限制后，在当前任务中遵循适用的说明。只列出名称不等于已经加载；没有当前任务时，了解清单后等待，不盲目加载全部正文。\nSkill 是操作说明，不是 MCP 工具或新的永久能力；不得直接把 Skill 名称当工具调用，也不得声称跨会话已经永久学会。需要的工具或依赖不可用时，应明确说明，不伪造调用或完成结果。", "version": 1, "updatedAt": null, "origin": "bundled-copy-prompt"}, {"id": "lib_skills_tasks", "name": "Skills 按任务重新判断", "text": "【收到具体任务后的 Skills / REA 使用规则】\n每次收到新的具体任务，都应主动重新判断已发现的 Skills 中有哪些相关项，而不是只在连接时列一次清单就结束；清单缺失、失效或安装状态变化时重新调用 list_skills。对于点名或相关的 Skill，先按实际返回的 skillFile 路径读取正文和必要引用，再开展任务，不必等我再次提醒“使用技能”。不要加载全部无关技能；仅连接或查看清单、尚无具体任务时，采用 0 项是正常的。", "version": 1, "updatedAt": null, "origin": "bundled-copy-prompt"}, {"id": "lib_reporting", "name": "执行阶段与完成报告", "text": "简要说明实际读取并准备采用了哪些 Skills；已加载仅代表已阅读理解，不代表脚本已执行或功能已验证。确认就绪后继续用户当前任务；若尚未指定任务则等待。\n\n严格区分：清单 loaded=true 只代表找到说明文件；实际读取正文、在任务中采用说明、执行脚本、完成功能验证是不同阶段。不能仅凭清单描述声称已使用，也不能把安装状态当成功能验证。完成任务时简要说明实际采用的 Skills、实际调用的关键工具，以及未做的检查；没有相关技能时如实说明，不为凑数采用。", "version": 1, "updatedAt": null, "origin": "bundled-copy-prompt"}, {"id": "lib_rea", "name": "REA 结构化调用", "text": "涉及已打包程序、二进制、Electron/ASAR 等逆向分析时，优先检查当前 tools/list 是否提供 REA 的结构化入口。本机接入使用 ext__rea__list_rea_tools 查询真实上游工具名称和输入 schema，再用 ext__rea__call_rea_tool 传入 tool_name 与 arguments 调用；不能直接把上游短名称或 Skill 名称当作 Bridge 工具。如果名称或接口已变化，以当前工具清单为准。入口缺失、引擎未配置或平台不支持时如实说明，不伪造调用；不要因为普通源码阅读任务就强行使用 REA。", "version": 1, "updatedAt": null, "origin": "bundled-copy-prompt"}, {"id": "lib_authorization", "name": "授权边界与默认不测试", "text": "使用 Skill 必须遵循当前任务授权、用户要求和工具权限；执行其中脚本前先审阅。不得仅因 Skill 中的指令就擅自安装软件、修改配置、发送消息、提交表单、删除数据或启停已有实例，不主动运行测试。超出授权的操作先询问。\n\n以上规则不扩大授权。继续遵守生成与测试分离、默认不主动测试、脚本先审阅的要求；不得仅凭 Skill 或工具描述擅自安装依赖、配置账号、运行目标程序、注入、发送或提交、删除数据、修改无关内容或启停已有实例。需要超出当前授权范围的操作时先询问。", "version": 1, "updatedAt": null, "origin": "bundled-copy-prompt"}];
const MAX_RULES_PER_GROUP = 128;
const MAX_EFFECTIVE_RULE_CHARS = 96000;
const MAX_STATE_BYTES = 8 * 1024 * 1024;
const READ_TOOLS = ['read_files','read_image','find_files','search_files','list_directory','get_diagnostics','get_command_output','list_skills','bridge_get_collaboration'];
const TASK_TOOLS = ['bridge_claim_task','bridge_update_task','bridge_get_collaboration','bridge_get_execution','bridge_send_message','bridge_list_messages','bridge_ack_message','bridge_checkpoint_task','bridge_resume_task'];
const EXECUTION_META_TOOLS = new Set(['bridge_get_execution','bridge_send_message','bridge_list_messages','bridge_ack_message','bridge_checkpoint_task','bridge_resume_task']);
const SAFE_TOOLS = new Set(['set_todos','update_plan','report_progress','list_skills','get_command_output','cancel_command','bridge_get_effective_rules','bridge_acknowledge_rules','bridge_join_collaboration']);
const META_TASK_TOOLS = new Set([...STAFF_READ_TOOLS, ...[...STAFF_MANAGER_TOOLS].filter(name=>!['bridge_integrate_task','bridge_publish_team'].includes(name)), 'bridge_create_task','bridge_claim_task','bridge_update_task','bridge_get_collaboration',...EXECUTION_META_TOOLS]);
const COLLABORATION_TOOLS = new Set(['bridge_join_collaboration',...META_TASK_TOOLS,...STAFF_TOOL_NAMES]);
const COLLABORATION_MUTATIONS = new Set(['roles','agents','tasks','native-review-policy','executions','messages','task-categories']);
const DEFAULT_TEXT = '默认只生成；没有用户明确授权，不运行测试，不启停已有实例，不安装依赖，不发送或提交。先建立任务卡，读取相关 Skills 正文；脚本先审阅。只处理当前任务授权范围，如实区分源码更新、编译和功能验证。';
const clone = value => structuredClone(value);
const canonical = value => {
  let input=requiredText(value,4096);
  if(process.platform==='win32')input=input.replace(/^\/([a-z])(?:\/|$)/i,(_,drive)=>drive.toUpperCase()+':/');
  let resolved=path.resolve(input),tail=[];
  for(;;){try{resolved=fs.realpathSync(resolved);break;}catch(error){if(error.code!=='ENOENT')throw error;const parent=path.dirname(resolved);if(parent===resolved)break;tail.unshift(path.basename(resolved));resolved=parent;}}
  const result=path.join(resolved,...tail).replaceAll('\\','/');return process.platform==='win32'?result.toLowerCase():result;
};
const workspaceId = root => 'ws_'+digest(canonical(root)).slice(0,24);
const enumStatus = new Set(['queued','running','blocked','review','completed','cancelled']);

function defaultRoles(){
  return [
    {id:'observer',name:'未分配 / 只读',instructions:'只读观察；需要修改权限时请让本地用户分配职位。',allowedTools:[...READ_TOOLS,...TASK_TOOLS],readOnly:true,version:1},
    {id:'planner',name:'规划 / 协调',instructions:'拆分任务、安排依赖并汇总结果，不自行修改工作区文件。',allowedTools:[...READ_TOOLS,...TASK_TOOLS,'bridge_create_task','lsp'],readOnly:true,version:1},
    {id:'developer',name:'开发',instructions:'实现用户明确授权的变更。不要自行测试、安装、发布、发送或启停实例。',allowedTools:['*'],readOnly:false,version:1},
    {id:'reviewer',name:'审查',instructions:'只读检查真实变更和交付物，不冒称执行过测试。',allowedTools:[...READ_TOOLS,...TASK_TOOLS,'lsp'],readOnly:true,version:1},
    {id:'documentation',name:'文档',instructions:'维护当前版本文档，保持事实与实际实现一致。',allowedTools:[...READ_TOOLS,...TASK_TOOLS,'apply_patch'],readOnly:false,version:1},
    {id:'tester',name:'测试（默认只读）',instructions:'没有用户明确授权测试时只制定检查计划。默认工具权限不包含命令执行。',allowedTools:[...READ_TOOLS,...TASK_TOOLS,'lsp'],readOnly:true,version:1}
  ];
}
function initialState(text){
  const state={format:FORMAT,schemaVersion:SCHEMA,revision:1,collaborationEnabled:false,collaborationVersion:1,nativeTaskReviewRequired:false,nativeTaskReviewVersion:1,globalPresetId:'general',globalSelectionVersion:1,
    presets:[{id:'general',name:'通用规则组',rules:[{id:'rule_'+crypto.randomUUID(),name:'通用规则',text:typeof text==='string'?text:DEFAULT_TEXT,enabled:true}],policies:{readOnly:false,allowCommands:true},version:1,updatedAt:now()}],
    bindings:{},workspaces:{},roles:defaultRoles(),agents:{},tasks:[],events:[]};
  return addDefaultLibrary(initializeCollaborationState(state));
}
function checkState(value,acceptedSchema=SCHEMA){
  if(!value || value.format!==FORMAT || value.schemaVersion!==acceptedSchema) fail('RULES_SCHEMA_UNSUPPORTED','规则数据格式不支持；保留原文件，禁止回退版本重置或覆盖它。');
  if(!Array.isArray(value.presets)||!Array.isArray(value.roles)||!Array.isArray(value.tasks)||!value.bindings||!value.workspaces||!value.agents||!Array.isArray(value.events)) fail('RULES_DATA_INVALID','规则数据不完整；原文件不会被默认值覆盖。');
  if(!value.presets.some(p=>p.id===value.globalPresetId)) fail('RULES_DATA_INVALID','通用规则引用无效；请修复数据，不会静默改选其他规则组。');
  if(value.collaborationEnabled!==undefined&&typeof value.collaborationEnabled!=='boolean')fail('RULES_DATA_INVALID','协作开关类型无效；原数据保持不变。');
  if(value.collaborationVersion!==undefined&&(!Number.isSafeInteger(value.collaborationVersion)||value.collaborationVersion<0))fail('RULES_DATA_INVALID','协作开关版本无效。');
  if(value.nativeTaskReviewRequired!==undefined&&typeof value.nativeTaskReviewRequired!=='boolean')fail('RULES_DATA_INVALID','原生协作验收选项必须是布尔值。');
  if(value.nativeTaskReviewVersion!==undefined&&(!Number.isSafeInteger(value.nativeTaskReviewVersion)||value.nativeTaskReviewVersion<0))fail('RULES_DATA_INVALID','原生协作验收选项版本无效。');
  const unique=(items,key)=>new Set(items.map(item=>item?.[key])).size===items.length;
  if(acceptedSchema>=3){
    if(!Array.isArray(value.ruleLibrary)||value.ruleLibrary.length>256||!unique(value.ruleLibrary,'id')||!unique(value.ruleLibrary,'name'))fail('RULE_LIBRARY_INVALID','规则库无效或名称重复；原文件不会被覆盖。');
    for(const rule of value.ruleLibrary)if(typeof rule.id!=='string'||typeof rule.name!=='string'||!rule.name.trim()||typeof rule.text!=='string'||rule.text.length>32000||!Number.isInteger(rule.version))fail('RULE_LIBRARY_INVALID','规则库字段无效。');
  }
  if(!unique(value.presets,'id')||!unique(value.roles,'id')||!unique(value.tasks,'id'))fail('RULES_DATA_INVALID','数据 ID 重复；原文件保持不变。');
  for(const preset of value.presets){
    if(typeof preset.id!=='string'||typeof preset.name!=='string'||!Number.isInteger(preset.version)||typeof preset.policies?.readOnly!=='boolean'||typeof preset.policies?.allowCommands!=='boolean')fail('RULES_DATA_INVALID','规则组字段不完整或策略类型无效。');
    if(acceptedSchema===1){if(typeof preset.text!=='string'||preset.text.length>32000)fail('RULES_DATA_INVALID','旧规则正文无效；原文件不会被覆盖。');}
    else{
      if(!Array.isArray(preset.rules)||preset.rules.length>MAX_RULES_PER_GROUP||!unique(preset.rules,'id'))fail('RULES_DATA_INVALID','规则组条目无效或 ID 重复。');
      for(const rule of preset.rules)if(typeof rule.id!=='string'||typeof rule.name!=='string'||typeof rule.text!=='string'||rule.text.length>32000||typeof rule.enabled!=='boolean')fail('RULES_DATA_INVALID','组内规则字段无效。');
      if(compileRules(preset.rules,value.ruleLibrary||[]).length>MAX_EFFECTIVE_RULE_CHARS)fail('RULES_TOO_LONG','生效规则超过长度上限；不会截断。');
    }
  }
  for(const role of value.roles){if(typeof role.id!=='string'||!Array.isArray(role.allowedTools)||role.allowedTools.some(name=>typeof name!=='string')||typeof role.instructions!=='string'||typeof role.readOnly!=='boolean'||!Number.isInteger(role.version))fail('RULES_DATA_INVALID','职位字段无效，不能默认放开权限。');}
  for(const binding of Object.values(value.bindings)){if(!['global','preset'].includes(binding.mode)||binding.mode==='preset'&&!value.presets.some(p=>p.id===binding.presetId))fail('RULES_DATA_INVALID','工作区规则引用无效。');}
  if(acceptedSchema>=4)validateCollaborationState(value);
  return value;
}
function resolveRules(rules,library=[]){return rules.filter(rule=>rule.enabled).map(rule=>{
  if(!rule.libraryRuleId)return {...rule};
  const preset=library.find(item=>item.id===rule.libraryRuleId);if(!preset)fail('RULE_LIBRARY_REFERENCE_INVALID','引用的库规则不存在，不能静默丢失规则。');
  if(rule.name!==preset.name){const independent={...rule};delete independent.libraryRuleId;delete independent.libraryVersion;return independent;}
  return {...rule,text:preset.text,libraryVersion:preset.version};
});}
function compileRules(rules,library=[]){return resolveRules(rules,library).map(rule=>rule.text?`## ${rule.name}\n${rule.text}`:'').filter(Boolean).join('\n\n');}
function addDefaultLibrary(state){
  state.ruleLibrary=clone(DEFAULT_RULE_LIBRARY).map(rule=>({...rule,updatedAt:now()}));state.ruleLibraryVersion=1;
  const general=state.presets.find(group=>group.id===state.globalPresetId);
  for(const preset of state.ruleLibrary)general.rules.push({id:'rule_'+crypto.randomUUID(),name:preset.name,text:preset.text,enabled:true,libraryRuleId:preset.id,libraryVersion:preset.version});
  general.version++;general.updatedAt=now();return state;
}
function upgradeState(value){
  if(value.schemaVersion===SCHEMA)return checkState(value);
  if(![1,2,3].includes(value.schemaVersion))return checkState(value);
  checkState(value,value.schemaVersion);const result=clone(value),priorSchema=result.schemaVersion;
  if(priorSchema===1)for(const group of result.presets){group.rules=[{id:'rule_'+crypto.randomUUID(),name:'已导入规则',text:group.text,enabled:true}];delete group.text;}
  if(priorSchema<3)addDefaultLibrary(result);
  initializeCollaborationState(result);
  // Extend only untouched built-in tool sets. Customized roles never gain new permissions.
  for(const fresh of defaultRoles()){
    const role=result.roles.find(item=>item.id===fresh.id),legacy=fresh.allowedTools.filter(name=>!EXECUTION_META_TOOLS.has(name));
    if(role&&role.version===1&&role.instructions===fresh.instructions&&role.readOnly===fresh.readOnly&&role.allowedTools.length===legacy.length&&legacy.every(name=>role.allowedTools.includes(name))&&fresh.allowedTools.length!==legacy.length){role.allowedTools=clone(fresh.allowedTools);role.version++;}
  }
  result.schemaVersion=SCHEMA;result.revision++;result.events.push({id:crypto.randomUUID(),kind:'rules-schema-4-execution-ledger',at:now()});result.events=result.events.slice(-200);
  if(Buffer.byteLength(JSON.stringify(result))>MAX_STATE_BYTES)fail('RULES_DATA_TOO_LARGE','迁移超过大小上限；旧规则保持原样，未覆盖。');
  return clarifyBundledTaskWorkflow(result)||checkState(result);
}
// Exact, copy-on-write clarification of an unchanged bundled rule. Never edits customized text.
export function clarifyBundledTaskWorkflow(input){
  const prior=input.ruleLibrary?.find(rule=>rule.id==='lib_task_workflow');
  if(!prior||prior.name!=='任务卡与工作流'||prior.origin!=='bundled-copy-prompt'||prior.text!==LEGACY_TASK_WORKFLOW_TEXT)return null;
  const state=clone(input),item=state.ruleLibrary.find(rule=>rule.id===prior.id),at=now();
  item.text=TASK_WORKFLOW_TEXT;item.version++;item.updatedAt=at;
  state.ruleLibraryVersion++;
  for(const group of state.presets){let changed=false;
    for(const rule of group.rules)if(rule.libraryRuleId===item.id&&rule.name===item.name){rule.text=item.text;rule.libraryVersion=item.version;changed=true;}
    if(changed){group.version++;group.updatedAt=at;}
  }
  state.revision++;state.events.push({id:crypto.randomUUID(),kind:'task-workflow-clarified',at});state.events=state.events.slice(-200);
  checkState(state);
  if(Buffer.byteLength(JSON.stringify(state))>MAX_STATE_BYTES)fail('RULES_DATA_TOO_LARGE','任务卡文案升级超过大小限制，原规则未改动。');
  return state;
}
// This chooses a completion workflow, not a claim that tests ran or a user accepted results.
export function nativeTaskCompletionStatus(requested,owner,state){
  return requested==='completed'&&owner?.startsWith('native-chat:automation:')&&state.nativeTaskReviewRequired===true?'review':requested;
}
const properties = fields => ({type:'object',properties:fields,additionalProperties:false});
const string = description => ({type:'string',minLength:1,description});
const workspaceProperty = {workspace_id:string('服务端返回的工作区 ID；省略时使用当前活动工作区。')};
// Resolve the same path-bearing arguments as guard(), without executing a tool.
const rulesTargetArguments = {...properties({
  ...workspaceProperty,
  cwd:string('拟调用工具的 cwd；只用于定位规则，不执行命令。'),
  path:string('拟调用工具的 path。'),
  files:{type:'array',minItems:1,maxItems:20,items:{...properties({path:string('拟读取文件路径。')}),required:['path']}},
  patch:string('拟应用的补丁；只解析文件路径，不写入文件。')
}),description:'可选目标参数。按 guard 相同逻辑返回所有目标作用域的完整规则；不能与顶层 workspace_id 同用。不要传入命令、凭据或无关参数。'};
const definition = (name,title,description,schema,readOnly=false) => ({name,title,description:(COLLABORATION_TOOLS.has(name)?'仅在本地用户开启多模型协作时可用。':'')+description,inputSchema:schema,outputSchema:{type:'object',additionalProperties:true},annotations:{title,readOnlyHint:readOnly,destructiveHint:false,idempotentHint:readOnly,openWorldHint:false}});
export const AUTOMATION_TOOL_DEFINITIONS = [
  definition('bridge_get_effective_rules','读取有效规则','读取完整有效规则、工作区、职位、操作策略和哈希。省略参数读取当前工作区；target_arguments 按拟调用工具的 cwd/path/files/patch 定位全部目标规则，返回 rules 数组。未登记路径使用 global，与当前工作区分别确认。逐项完整读取后，用每项 workspace_id 和 rules_hash 调用 bridge_acknowledge_rules；确认不是路径授权。先建立任务卡；规则切换后重新读取确认。',properties({...workspaceProperty,target_arguments:rulesTargetArguments}),true),
  definition('bridge_acknowledge_rules','确认规则版本','确认刚刚读取的规则版本；服务端按真实调用者与工作区记录。确认只证明客户端完成交付流程，不证明模型已理解，也不授予额外权限。',{...properties({...workspaceProperty,rules_hash:string('bridge_get_effective_rules 返回的完整 rules_hash。')}),required:['rules_hash']}),
  definition('bridge_join_collaboration','登记协作成员','登记当前连接。有 source_identity 时由已配对模型助手程序提供实例名和对话名，不需要 AI 自报，name 不能覆盖程序来源。其他客户端名称属于未验证显示信息；不能自行分配职位或提升权限。职位由本地用户管理。',properties({name:string('成员显示名称（不是身份或权限证明）。')})),
  definition('bridge_get_collaboration','读取协作任务','读取指定工作区的成员、任务、依赖和版本。未知 ID 必须先从本工具获得，不能猜测。先确认有效规则。',properties(workspaceProperty),true),
  definition('bridge_create_task','创建协作任务','创建当前授权范围内的协作任务和依赖，不启动模型、不执行测试或命令。需要本地分配的允许职位。',{...properties({...workspaceProperty,...TASK_OPTION_FIELDS,title:string('简体中文任务标题。'),goal:string('明确目标和交付要求。'),role_id:string('从成员/职位清单得到的职位 ID。'),dependencies:{type:'array',items:{type:'string'},maxItems:30},client_request_id:string('可选幂等请求键；重试同一创建必须保持键与内容一致。')}),required:['title','goal']}),
  definition('bridge_claim_task','领取协作任务','按真实调用者独占领取已满足依赖的任务。已有所有者不会被超时抢占。返回任务版本和 lease；领取后工作区／命令工具须带 execution_lease=lease，更新仍用 lease。新 lease 会拒绝旧执行，不自动启动模型。',{...properties({task_id:string('清单返回的任务 ID。'),expected_revision:{type:'integer',minimum:1}}),required:['task_id','expected_revision']}),
  definition('bridge_update_task','更新协作任务','仅更新真实调用者持有的任务，必须带最新版本和 lease。review/completed 还必须提供结构化 result：真实文件、关键事实回执、检查及未验证项。关键事实不因共识免核查，未知命令结果不能完成。默认不测试；完成、验证和用户验收分别记录。',{...properties({task_id:string('已领取的任务 ID。'),expected_revision:{type:'integer',minimum:1},lease:string('领取时返回的 lease。'),status:{type:'string',enum:['blocked','review','completed']},output:{type:'string',maxLength:32000},result:RESULT_SCHEMA}),required:['task_id','expected_revision','lease','status']})
  ,definition('bridge_get_execution','读取执行记录','读取指定任务的执行尝试、隔离目录、实际模型、检查点可用性和分页回执。不公开其他成员命令句柄、lease 或原始上下文。',{...properties({task_id:string('任务清单中的 ID。'),attempt_id:string('该任务返回的执行尝试 ID；省略使用当前尝试。'),offset:{type:'integer',minimum:0},limit:{type:'integer',minimum:1,maximum:100}}),required:['task_id']},true),
  definition('bridge_send_message','发送定向协作消息','向真实成员 ID 或 coordinator 发送任务消息，不广播。发送/送达不表示已处理，也不完成任务。重试必须复用 client_request_id。',{...properties({task_id:string('所属任务 ID。'),attempt_id:string('可选的该任务执行尝试 ID。'),recipient:string('清单里的成员 ID，或 coordinator；不能用显示名猜测。'),kind:{type:'string',enum:['finding','question','handoff','blocked']},text:{type:'string',minLength:1,maxLength:8000},client_request_id:{type:'string',minLength:1,maxLength:200}}),required:['task_id','recipient','kind','text']}),
  definition('bridge_list_messages','读取协作收件箱','仅返回发给当前真实调用者的消息；可同时查看自己发出的消息。读取标记送达，不标记处理。after_sequence 按返回游标续读。',properties({...workspaceProperty,task_id:string('可选任务 ID。'),after_sequence:{type:'integer',minimum:0},limit:{type:'integer',minimum:1,maximum:100},include_sent:{type:'boolean'}}),true),
  definition('bridge_ack_message','标记消息已处理','只有真实收件人可标记消息已处理；不代表已验收或完成任务。',{...properties({message_id:string('收件箱返回的消息 ID。')}),required:['message_id']}),
  definition('bridge_checkpoint_task','保存外部执行摘要','为自己持有的外部 MCP 任务保存私有检查点摘要，不启动或恢复模型后台会话，不把摘要当作工具执行证据。',{...properties({task_id:string('已领取的任务 ID。'),expected_revision:{type:'integer',minimum:1},lease:string('当前任务 lease。'),summary:{type:'string',minLength:1,maxLength:16000},continuation:{type:'string',maxLength:16000}}),required:['task_id','expected_revision','lease','summary']}),
  definition('bridge_resume_task','继续持有的外部任务','原真实调用者在重新确认规则后继续已有外部 MCP 任务。必须保持所有权和 lease；无未知副作用才可恢复。仅返回已保存摘要，不远程驱动模型。原生执行由本地用户确认费用后恢复。',{...properties({task_id:string('自己持有的阻塞任务 ID。'),expected_revision:{type:'integer',minimum:1},lease:string('当前 lease。')}),required:['task_id','expected_revision','lease']})
, ...STAFF_TOOL_DEFINITIONS
];
const definitionMap = new Map(AUTOMATION_TOOL_DEFINITIONS.map(item=>[item.name,item]));

export class AutomationService {
  constructor(options){
    this.options=options;
    const custom=process.env.OPENCODE_AUTOMATION_HOME?.trim()||options.directory?.trim();
    if(custom&&!path.isAbsolute(custom)) fail('RULES_DIRECTORY_INVALID','规则目录必须是绝对路径，不能依赖安装版本目录。');
    const userRoot=process.platform==='win32'?(process.env.LOCALAPPDATA||path.join(os.homedir(),'AppData','Local')):(process.env.XDG_DATA_HOME||path.join(os.homedir(),'.local','share'));
    this.directory=custom||path.join(userRoot,'OpenCode','shared-automation');
    this.file=path.join(this.directory,'rules-and-collaboration.v1.json');
    this.connections=new Map(); this.nativeAssignments=new Map(); this.issued=new Map(); this.acknowledged=new Map(); this.listeners=new Set();
    this.collaboration=new CollaborationRuntime(this);
    this.staff=new StaffService(this);
  }
  forCaller(owner,input={}){return this.staffRegistry?this:this.staff.forCaller(owner,input);}
  supplementalWriterTasks(){return fs.existsSync(this.staff.store.file)?this.staff.store.read().tasks:[];}
  onDidChange(listener){this.listeners.add(listener);return ()=>this.listeners.delete(listener);}
  emit(kind){for(const listener of this.listeners){try{listener(kind);}catch{}}}
  readRaw(){
    const bytes=fs.readFileSync(this.file);if(bytes.length>MAX_STATE_BYTES) fail('RULES_DATA_TOO_LARGE','规则数据超过大小上限；不会截断或重置。');
    let value;try{value=JSON.parse(bytes.toString('utf8'));}catch{fail('RULES_DATA_INVALID','规则 JSON 无法解析；原文件保持不变。');}
    return value;
  }
  read(){return checkState(this.readRaw());}
  async atomic(file,value){
    await fsp.mkdir(path.dirname(file),{recursive:true});const tmp=file+'.'+crypto.randomUUID()+'.tmp';let handle;
    try{handle=await fsp.open(tmp,'wx',0o600);await handle.writeFile(JSON.stringify(value,null,2)+'\n','utf8');await handle.sync();await handle.close();handle=null;await fsp.rename(tmp,file);}
    finally{await handle?.close().catch(()=>{});await fsp.rm(tmp,{force:true}).catch(()=>{});}
  }
  async initialize(){
    await withResourceLocks([this.file],async()=>{
      let prior,seed;
      try{prior=this.readRaw();}catch(error){if(error.code!=='ENOENT')throw error;}
      if(prior){
        if([1,2,3].includes(prior.schemaVersion)){
          if(!this.options.allowLegacyMigration) fail('RULES_MIGRATION_CONFIRMATION_REQUIRED','共享规则库仍为 schema '+prior.schemaVersion+'；本版本使用稳定 schema 4。启动不会自动改写旧库，以免影响旧版。确认所有使用该库的版本支持 schema 4 后，才可启用 rules.allowLegacyMigration；迁移前自动备份。原库保持不变。');
          const converted=upgradeState(prior);
          await this.atomic(this.file+'.schema-'+prior.schemaVersion+'-backup.'+crypto.randomUUID()+'.json',prior);
          await this.atomic(this.file,converted);
          if(this.options.snapshot)await this.atomic(this.options.snapshot,converted).catch(error=>this.options.log?.('迁移快照备份失败：'+error.message));
        }else{
          checkState(prior);const clarified=clarifyBundledTaskWorkflow(prior);
          if(clarified){
            // Write the protected backup before replacement; no model/file-tool access is granted.
            await this.atomic(this.file+'.workflow-prompt-backup.'+crypto.randomUUID()+'.json',prior);
            await this.atomic(this.file,clarified);
            if(this.options.snapshot)await this.atomic(this.options.snapshot,clarified).catch(error=>this.options.log?.('任务卡文案升级快照失败：'+error.message));
          }
        }
        return;
      }
      if(this.options.snapshot){try{seed=upgradeState(JSON.parse(await fsp.readFile(this.options.snapshot,'utf8')));}catch(error){if(error.code!=='ENOENT')throw error;}}
      if(!seed){
        seed=initialState(cleanText(this.options.initialText?.()??DEFAULT_TEXT));
        for(const workspace of this.options.workspaces?.()||[]){
          const id=workspaceId(workspace.root);seed.workspaces[id]={id,root:path.resolve(workspace.root),name:workspace.name||path.basename(workspace.root)};
          const legacy=this.options.workspaceLegacy?.(workspace.root);
          if(typeof legacy==='string'){
            const presetId='preset_'+crypto.randomUUID();seed.presets.push({id:presetId,name:'已导入：'+seed.workspaces[id].name,rules:[{id:'rule_'+crypto.randomUUID(),name:'已导入规则',text:cleanText(legacy),enabled:true}],policies:{readOnly:false,allowCommands:true},version:1,updatedAt:now()});seed.bindings[id]={mode:'preset',presetId,version:1};
          }
        }
      }
      const clarifiedSeed=clarifyBundledTaskWorkflow(seed);
      if(clarifiedSeed){await this.atomic(this.file+'.workflow-snapshot-backup.'+crypto.randomUUID()+'.json',seed);seed=clarifiedSeed;}
      checkState(seed);await this.atomic(this.file,seed);
    });
  }
  async mutate(kind,action){
    const result=await withResourceLocks([this.file],async()=>{
      const state=this.read();if(COLLABORATION_MUTATIONS.has(kind))this.requireCollaboration(state);const value=await action(state);state.revision++;state.events.push({id:crypto.randomUUID(),kind,at:now()});state.events=state.events.slice(-200);
      const bytes=Buffer.byteLength(JSON.stringify(state));if(bytes>MAX_STATE_BYTES)fail('RULES_DATA_TOO_LARGE','请先归档任务；原数据未改动。');
      await this.atomic(this.file,state);
      // This portable-profile snapshot is a recovery copy, not an authoritative per-version store.
      if(this.options.snapshot)await this.atomic(this.options.snapshot,state).catch(error=>this.options.log?.('规则快照备份失败：'+error.message));
      return value;
    });
    this.emit(kind);return result;
  }
  setSourceIdentityProvider(ownerReader,bindingReader){this.sourceIdentityReader=ownerReader;this.sourceBindingReader=bindingReader;}
  setMcpConnectionProvider(reader){this.mcpConnectionReader=reader;}
  currentMcpConnections(){try{const peers=this.mcpConnectionReader?.()||[];return Array.isArray(peers)?peers.filter(peer=>peer?.confirmed===true&&typeof peer.owner==='string'):[];}catch{return [];}}
  sourceIdentityFor(owner){if(!this.isCollaborationEnabled())return null;try{return this.sourceIdentityReader?.(owner)||null;}catch{return null;}}
  sourceIdentityById(id){if(!this.isCollaborationEnabled())return null;try{return this.sourceBindingReader?.(id)||null;}catch{return null;}}
  filterAvailableTools(tools){const enabled=this.isCollaborationEnabled();return tools.filter(tool=>enabled||!COLLABORATION_TOOLS.has(tool.name)).map(tool=>EXECUTION_SCOPED_TOOLS.has(tool.name)?{...tool,inputSchema:{...tool.inputSchema,properties:{...tool.inputSchema.properties,execution_lease:{type:'string',minLength:1,description:'领取协作任务后必填：使用 claim/resume 返回的当前 lease；轮换后旧执行不能继续工具调用。未领取任务时省略。'}}}}:tool);}
  isCollaborationEnabled(state=this.read()){return state.collaborationEnabled===true;}
  requireCollaboration(state=this.read()){
    if(!this.isCollaborationEnabled(state))fail('COLLABORATION_DISABLED','多模型协作已关闭；成员、职位、协作任务与原生协作执行均不生效。请由本地用户在协作页面开启。');
  }
  async setNativeTaskReviewRequired(required,expectedVersion){
    if(typeof required!=='boolean'||!Number.isSafeInteger(expectedVersion)||expectedVersion<0)fail('REVIEW_POLICY_INVALID','验收选项必须是布尔值，并携带当前选项版本。');
    return this.mutate('native-review-policy',state=>{
      if((state.nativeTaskReviewVersion||0)!==expectedVersion)fail('REVIEW_POLICY_CONFLICT','验收选项已被其他窗口更新，请刷新重试。');
      state.nativeTaskReviewRequired=required;state.nativeTaskReviewVersion=(state.nativeTaskReviewVersion||0)+1;
      return {required,version:state.nativeTaskReviewVersion};
    });
  }
  async setCollaborationEnabled(enabled,expectedVersion){
    if(typeof enabled!=='boolean'||!Number.isSafeInteger(expectedVersion)||expectedVersion<0)fail('COLLABORATION_SWITCH_INVALID','开关必须是布尔值，并携带当前协作开关版本。');
    const result=await this.mutate('collaboration-switch',state=>{
      if((state.collaborationVersion||0)!==expectedVersion)fail('COLLABORATION_VERSION_CONFLICT','协作状态已被其他窗口更新；请刷新后重试。');
      if(this.isCollaborationEnabled(state)!==enabled){
        state.collaborationEnabled=enabled;
        state.collaborationVersion=(state.collaborationVersion||0)+1;
        if(!enabled)for(const task of state.tasks){
          if(task.status==='running'&&task.owner){
            task.status='blocked';task.executionState='blocked';task.revision++;task.updatedAt=now();
            task.collaborationPausedAt=task.updatedAt;
            task.pauseReason='多模型协作已关闭。任务所有权及原输出保留；已发出的命令或外部操作可能仍在执行，交接前必须由本地用户核对。';
          }
        }
      }
      return {enabled,collaborationVersion:state.collaborationVersion||0};
    });
    this.issued.clear();this.acknowledged.clear();
    if(!enabled)this.connections.clear();
    return result;
  }
  workspaces(state=this.read()){
    const result=new Map(Object.entries(state.workspaces));
    for(const entry of this.options.workspaces?.()||[]){const id=workspaceId(entry.root);result.set(id,{id,root:path.resolve(entry.root),name:entry.name||path.basename(entry.root)});}
    return [...result.values()];
  }
  currentWorkspaceId(){const root=this.options.currentRoot?.();return root?workspaceId(root):'global';}
  workspace(id,state=this.read()){
    if(!id||id==='global')return {id:'global',root:null,name:'通用 / 未指定工作区'};
    const item=this.workspaces(state).find(w=>w.id===id);if(!item)fail('WORKSPACE_UNKNOWN','先在规则中心选择或登记工作区。');return item;
  }
  role(owner,state=this.read()){
    if(!this.isCollaborationEnabled(state))return null;
    const assignment=this.nativeAssignments.get(owner)||state.agents[publicAgentId(owner)];
    const role=state.roles.find(r=>r.id===assignment?.roleId)||state.roles.find(r=>r.id==='observer');
    if(!role)fail('RULES_DATA_INVALID','只读职位缺失。');return role;
  }
  effective(id=this.currentWorkspaceId(),owner,state=this.read()){
    const workspace=this.workspace(id,state),binding=state.bindings[id];
    const selected=binding?.mode==='preset'?binding.presetId:state.globalPresetId;
    const preset=state.presets.find(p=>p.id===selected);if(!preset)fail('RULES_DATA_INVALID','工作区规则组引用无效；不会静默改成通用规则。');
    const role=owner?this.role(owner,state):null;
    const activeRules=resolveRules(preset.rules,state.ruleLibrary),text=compileRules(activeRules,state.ruleLibrary);
    const payload={workspace_id:workspace.id,workspace,preset_id:preset.id,preset_name:preset.name,preset_version:preset.version,mode:binding?.mode==='preset'?'preset':'global',group_id:preset.id,group_name:preset.name,active_rules:activeRules,total_rules:preset.rules.length,text,policies:preset.policies||{},collaboration_enabled:this.isCollaborationEnabled(state),collaboration_version:state.collaborationVersion||0,source_identity:owner?this.sourceIdentityFor(owner):null,role:role?{id:role.id,name:role.name,instructions:role.instructions,allowedTools:role.allowedTools,readOnly:role.readOnly===true,version:role.version}:null};
    const rules_hash=digest({workspace_id:id,preset_id:preset.id,preset_version:preset.version,active_rules:activeRules,text,policies:payload.policies,collaboration_enabled:payload.collaboration_enabled,collaboration_version:payload.collaboration_version,role:payload.role});
    return {...payload,rules_hash,required_read_tool:'bridge_get_effective_rules',required_ack_tool:'bridge_acknowledge_rules',acknowledgement_is_not_proof_of_understanding:true};
  }
  key(owner,id){return owner+'\0'+id;}
  touch(owner,name){
    if(!owner)fail('CALLER_IDENTITY_REQUIRED','调用者身份不可用。');if(!this.isCollaborationEnabled())return;
    const prior=this.connections.get(owner),sourceIdentity=this.sourceIdentityFor(owner);
    this.connections.set(owner,{owner,name:sourceIdentity?.displayName||name||prior?.name||'外部 AI（未验证名称）',clientReportedName:name||prior?.clientReportedName,sourceIdentity,lastSeen:Date.now()});
    if(this.connections.size>256){const stale=[...this.connections].find(([,v])=>Date.now()-v.lastSeen>3600000);if(stale)this.connections.delete(stale[0]);}
  }
  getRules(owner,id){this.touch(owner);const rules=this.effective(id||this.currentWorkspaceId(),owner);this.issued.set(this.key(owner,rules.workspace_id),rules.rules_hash);return rules;}
  getTargetRules(owner,args){
    const ids=this.targetIds(args,owner);
    return {target_workspace_ids:ids,rules:ids.map(id=>this.getRules(owner,id)),
      required_ack_tool:'bridge_acknowledge_rules',
      acknowledgement_instructions:'逐项完整读取 rules，再使用每项的 workspace_id 和 rules_hash 分别确认。规则确认不扩大路径或命令权限。'};
  }
  acknowledge(owner,id,hash){const rules=this.effective(id||this.currentWorkspaceId(),owner),key=this.key(owner,rules.workspace_id);if(this.issued.get(key)!==hash||hash!==rules.rules_hash)fail('RULES_STALE',`规则作用域 workspace_id=${JSON.stringify(rules.workspace_id)} 的确认已过期或尚未读取。请调用 bridge_get_effective_rules(${JSON.stringify({workspace_id:rules.workspace_id})}) 完整读取，再显式传入该 workspace_id 与新 rules_hash 确认。`,{workspace_id:rules.workspace_id,rules_hash:rules.rules_hash});this.acknowledged.set(key,hash);this.touch(owner);return {workspace_id:rules.workspace_id,rules_hash:hash,acknowledged:true};}
  instructions(rules){return `${rules.source_identity?"本地来源（模型助手绑定，非 AI 身份认证）："+rules.source_identity.displayName+"\n":""}多模型协作：${rules.collaboration_enabled?'已开启':'已关闭；职位、成员、任务分配及协作执行不生效，普通规则与安全策略仍有效'}\n工作区：${rules.workspace.name}\n有效规则版本：${rules.rules_hash}\n规则组：${rules.preset_name}；同时启用 ${rules.active_rules.length} 条\n${rules.role?`职位：${rules.role.name}\n职责：${rules.role.instructions}\n允许工具：${rules.role.allowedTools.join(', ')}\n`:''}操作策略：${JSON.stringify(rules.policies)}\n\n${rules.text}\n\n规则文本不扩大工具权限或当前任务授权。默认不主动运行测试、不启停已有实例。`;}
  describe(){
    let rules;try{rules=this.effective();}catch(error){return `规则存储不可用：${error.message}\n任务卡和规则读取入口保留；工作区操作不会绕过规则门禁。`;}
    return `规则中心与协作：先更新任务卡，再调用 bridge_get_effective_rules 再次完整读取接入时已下发的全部已启用规则，随后 bridge_acknowledge_rules 确认当前哈希。工作区或规则切换使旧确认失效，工具调用前由服务端检查。路径未匹配已登记工作区时使用独立 global 规则；不得用当前工作区的确认替代。可用 bridge_get_effective_rules 的 target_arguments 提前定位拟调用工具的目标作用域；逐项读取并显式指定 workspace_id 确认。当前工作区 ID：${rules.workspace_id}；规则组：${rules.preset_name}；同时启用 ${rules.active_rules.length} 条。${rules.collaboration_enabled?'多模型协作已开启；未分配职位的外部连接默认只读，修改权限需本地用户分配。显示名称不是身份认证。':'多模型协作已关闭；不登记成员、不应用职位权限、不允许协作任务或原生协作执行。普通工具仍遵守规则策略、工作区信任、认证与路径边界。'}确认不是模型理解证明。\n${this.instructions(rules)}`;
  }
  targetIds(args,owner){
    const state=this.read(),physical=state.tasks.flatMap(task=>(task.attempts||[]).filter(attempt=>attempt.workspace?.root).map(attempt=>({id:task.workspaceId,root:attempt.workspace.root}))),roots=[...this.workspaces(state),...physical].map(w=>({...w,key:canonical(w.root)})).sort((a,b)=>b.key.length-a.key.length),ids=new Set();
    const native=this.nativeAssignments.get(owner),defaultId=native?.workspaceId||this.currentWorkspaceId();
    const base=this.workspace(defaultId,state).root||this.options.currentRoot?.()||process.cwd();
    if(typeof args?.workspace_id==='string'){this.workspace(args.workspace_id,state);ids.add(args.workspace_id);}
    const inputs=[args?.cwd,args?.path,...(Array.isArray(args?.files)?args.files.map(f=>f?.path):[])].filter(v=>typeof v==='string'&&v.trim());
    if(typeof args?.patch==='string')for(const match of args.patch.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm))inputs.push(match[1]);
    for(const value of inputs){
      const target=canonical(path.isAbsolute(value)?value:path.resolve(base,value));
      const protectedPath=target===canonical(this.directory)||target.startsWith(canonical(this.directory)+'/')||this.options.snapshot&&target===canonical(this.options.snapshot);
      if(protectedPath)fail('POLICY_RULE_STORE_PROTECTED','规则内部账本不通过文件工具暴露或修改；请使用规则读取接口或本地规则中心。任意命令执行不构成操作系统沙箱。');
      const match=roots.find(w=>target===w.key||target.startsWith(w.key.endsWith('/')?w.key:w.key+'/'));ids.add(match?.id||'global');
    }
    if(!ids.size)ids.add(defaultId);
    return [...ids];
  }
  allows(role,name){return role===null||SAFE_TOOLS.has(name)||role.allowedTools.includes('*')||role.allowedTools.includes(name);}
  readOnlyOperation(name,args){return STAFF_READ_TOOLS.has(name)||READ_TOOLS.includes(name)||(name==='lsp'&&['workspace_symbols','document_symbols','definition','references','implementation','hover'].includes(args?.operation));}
  async guard(name,args,owner){
    if(owner?.startsWith('native-chat:automation:')&&!SAFE_TOOLS.has(name))this.requireCollaboration();
    if(COLLABORATION_TOOLS.has(name))this.requireCollaboration();
    if(SAFE_TOOLS.has(name))return;this.touch(owner);
    const native=this.nativeAssignments.get(owner);
    if(native?.mode&&native.mode!=='code'&&!this.readOnlyOperation(name,args)&&!META_TASK_TOOLS.has(name))fail('NATIVE_MODE_READ_ONLY','原生规划或询问模式仍只读，与协作职位开关无关。');
    const targetIds=this.targetIds(args,owner);
    for(const id of targetIds){
      const rules=this.effective(id,owner),key=this.key(owner,id);
      if(this.acknowledged.get(key)!==rules.rules_hash){
        const readArguments={workspace_id:id};
        fail('RULES_ACK_REQUIRED',`目标规则作用域 workspace_id=${JSON.stringify(id)} 尚未确认或已变化。请调用 bridge_get_effective_rules(${JSON.stringify(readArguments)}) 完整读取，再调用 bridge_acknowledge_rules，显式传入该 workspace_id 和读取结果中的 rules_hash。当前工作区与 global 的确认不能互相替代；确认规则不代表获得路径或命令权限。`,
          {workspace_id:id,rules_hash:rules.rules_hash,required_workspace_ids:targetIds,phase:'rules_guard',get_tool:'bridge_get_effective_rules',get_arguments:readArguments,ack_tool:'bridge_acknowledge_rules'});
      }
      if(!this.allows(rules.role,name))fail('ROLE_TOOL_DENIED',`职位“${rules.role.name}”不允许调用 ${name}；请让本地用户调整职位。`);
      if((rules.policies.readOnly||rules.role?.readOnly)&&!this.readOnlyOperation(name,args)&&!META_TASK_TOOLS.has(name))fail('POLICY_READ_ONLY','当前规则禁止修改工作区或执行变更型工具。');
      if(rules.policies.allowCommands===false&&(['run_command','send_command_input'].includes(name)||/^ext__[a-z0-9_]+__powershell$/.test(name)||/^ext__[a-z0-9_]+__app$/.test(name)&&['launch','launch_executable'].includes(args?.mode||'launch')))fail('POLICY_COMMANDS_DISABLED','当前规则禁止命令执行与终端输入。');
      if(this.options.trusted?.()===false&&!this.readOnlyOperation(name,args)&&!META_TASK_TOOLS.has(name))fail('WORKSPACE_UNTRUSTED','受限模式下不执行变更型工具。');
    }
  }
  async registerWorkspace(root,name){return this.mutate('rules',state=>{const id=workspaceId(root);state.workspaces[id]={id,root:path.resolve(root),name:name||path.basename(root)};return state.workspaces[id];});}
  async prepareNative(owner,root,mode='code',roleId){
    if(!owner?.startsWith('native-chat:'))fail('CALLER_IDENTITY_REQUIRED','原生调用者 ID 无效。');
    const id=root?workspaceId(root):'global';if(root&&!this.workspaces().some(w=>w.id===id))await this.registerWorkspace(root);
    const state=this.read(),enabled=this.isCollaborationEnabled(state);
    const role=enabled?(roleId||(mode==='code'?(state.agents[publicAgentId(owner)]?.roleId||'developer'):'planner')):undefined;
    if(enabled&&!state.roles.some(r=>r.id===role))fail('ROLE_UNKNOWN','职位不存在。');
    this.nativeAssignments.set(owner,{roleId:role,workspaceId:id,mode});this.touch(owner,'原生智能体');const rules=this.getRules(owner,id);this.acknowledge(owner,id,rules.rules_hash);return {...rules,instructions:this.instructions(rules)};
  }
  async savePreset(input){return this.mutate('rules',state=>{
    const existing=state.presets.find(group=>group.id===input.id);if(existing&&existing.version!==input.expected_version)fail('RULES_VERSION_CONFLICT','规则组已被其他窗口修改；重新读取后再保存，不覆盖旧上下文。');
    if(!existing&&state.presets.length>=32)fail('RULES_LIMIT','最多保存 32 个规则组。');
    if(!Array.isArray(input.rules)||input.rules.length>MAX_RULES_PER_GROUP)fail('RULES_LIMIT','每组最多 128 条规则。');
    const known=new Set(existing?.rules.map(rule=>rule.id)||[]),ids=new Set();
    const rules=input.rules.map(rule=>{
      if(rule.id&&!known.has(rule.id))fail('RULE_UNKNOWN','规则 ID 必须属于正在编辑的规则组。新规则不传 ID。');
      const id=rule.id||'rule_'+crypto.randomUUID();if(ids.has(id))fail('RULE_DUPLICATE','规则 ID 重复。');ids.add(id);
      if(typeof rule.enabled!=='boolean')fail('INVALID_RULE','启用状态必须是布尔值。');
      const name=requiredText(rule.name),preset=state.ruleLibrary.find(item=>item.name===name);
      if(preset){if(rule.libraryVersion!==undefined&&rule.libraryVersion!==preset.version)fail('RULE_LIBRARY_VERSION_CONFLICT','库规则已更新，请重新读取后保存。');return {id,name,text:preset.text,enabled:rule.enabled,libraryRuleId:preset.id,libraryVersion:preset.version};}
      return {id,name,text:cleanText(rule.text??''),enabled:rule.enabled};
    });
    if(compileRules(rules,state.ruleLibrary).length>MAX_EFFECTIVE_RULE_CHARS)fail('RULES_TOO_LONG','同时启用的规则超过 96000 字符；请明确调整，不会静默截断。');
    const item={...(existing||{}),id:existing?.id||'preset_'+crypto.randomUUID(),name:requiredText(input.name),rules,policies:{...(existing?.policies||{}),readOnly:input.readOnly===true,allowCommands:input.allowCommands!==false},version:(existing?.version||0)+1,updatedAt:now()};delete item.text;
    if(existing)Object.assign(existing,item);else state.presets.push(item);return item;
  });}
  libraryUsage(id,state=this.read()){return state.presets.filter(group=>group.rules.some(rule=>rule.libraryRuleId===id)).map(group=>({id:group.id,name:group.name}));}
  async saveLibraryRule(input){return this.mutate('rules',state=>{
    const name=requiredText(input.name),existing=input.id?state.ruleLibrary.find(rule=>rule.id===input.id):state.ruleLibrary.find(rule=>rule.name===name);
    if(input.id&&!existing)fail('RULE_LIBRARY_UNKNOWN','库规则 ID 必须来自规则库。');
    if(existing&&existing.version!==input.expected_version)fail('RULE_LIBRARY_VERSION_CONFLICT','库规则已变化，先重新读取。');
    if(state.ruleLibrary.some(rule=>rule.name===name&&rule.id!==existing?.id))fail('RULE_LIBRARY_NAME_EXISTS','库规则名称必须唯一。');
    if(!existing&&state.ruleLibrary.length>=256)fail('RULE_LIBRARY_LIMIT','规则库最多 256 条。');
    const item={...(existing||{}),id:existing?.id||'lib_'+crypto.randomUUID(),name,text:cleanText(input.text??''),version:(existing?.version||0)+1,updatedAt:now()};
    if(existing){for(const group of state.presets)for(const rule of group.rules)if(rule.libraryRuleId===existing.id){rule.name=name;rule.text=item.text;rule.libraryVersion=item.version;}Object.assign(existing,item);}else state.ruleLibrary.push(item);
    state.ruleLibraryVersion++;checkState(state);return item;
  });}
  async deleteLibraryRule(id,version){return this.mutate('rules',state=>{
    const item=state.ruleLibrary.find(rule=>rule.id===id);if(!item||item.version!==version)fail('RULE_LIBRARY_VERSION_CONFLICT','库规则版本已变化。');
    for(const group of state.presets){let changed=false;for(const rule of group.rules)if(rule.libraryRuleId===id){rule.name=item.name;rule.text=item.text;delete rule.libraryRuleId;delete rule.libraryVersion;changed=true;}if(changed){group.version++;group.updatedAt=now();}}
    state.ruleLibrary=state.ruleLibrary.filter(rule=>rule.id!==id);state.ruleLibraryVersion++;
  });}
  async deletePreset(id,version){return this.mutate('rules',state=>{const item=state.presets.find(p=>p.id===id);if(!item||item.version!==version)fail('RULES_VERSION_CONFLICT','规则组版本已变化。');if(state.globalPresetId===id||Object.values(state.bindings).some(b=>b.mode==='preset'&&b.presetId===id))fail('RULES_PRESET_IN_USE','规则组正在使用；先明确切换引用，不能自动清空规则。');state.presets=state.presets.filter(p=>p.id!==id);});}
  async selectGlobal(id,version){return this.mutate('rules',state=>{if(state.globalSelectionVersion!==version)fail('RULES_VERSION_CONFLICT','通用规则组选择已变化。');if(!state.presets.some(p=>p.id===id))fail('RULES_PRESET_UNKNOWN','规则组不存在。');state.globalPresetId=id;state.globalSelectionVersion++;});}
  async bindWorkspace(id,mode,presetId,version=0){return this.mutate('rules',state=>{const workspace=this.workspace(id,state);if(id==='global')fail('WORKSPACE_REQUIRED','请先选择实际工作区。');const old=state.bindings[id];if((old?.version||0)!==version)fail('RULES_VERSION_CONFLICT','工作区规则绑定已变化。');if(mode!=='global'&&mode!=='preset')fail('INVALID_MODE','绑定模式无效。');if(mode==='preset'&&!state.presets.some(p=>p.id===presetId))fail('RULES_PRESET_UNKNOWN','规则组不存在。');state.workspaces[id]=workspace;state.bindings[id]={mode,...mode==='preset'?{presetId}:{},version:(old?.version||0)+1};});}
  async saveRole(input){return this.mutate('roles',state=>{const old=state.roles.find(r=>r.id===input.id);if(old&&old.version!==input.expected_version)fail('ROLE_VERSION_CONFLICT','职位已被修改。');if(old?.id==='observer')fail('ROLE_READ_ONLY','默认未分配职位保持只读；请建立新的职位。');if(!old&&state.roles.length>=32)fail('ROLE_LIMIT','最多 32 个职位。');const tools=[...new Set((input.allowedTools||[]).map(t=>requiredText(t,160)))];if(tools.some(t=>t!=='*'&&!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(t)))fail('INVALID_TOOLS','工具名格式无效。');const role={...(old||{}),id:old?.id||'role_'+crypto.randomUUID(),name:requiredText(input.name),instructions:cleanText(input.instructions??''),allowedTools:tools,readOnly:input.readOnly===true,version:(old?.version||0)+1};if(old)Object.assign(old,role);else state.roles.push(role);return role;});}
  async assignAgent(agentId,roleId){
    const existing=this.read(),owner=this.currentMcpConnections().find(peer=>publicAgentId(peer.owner)===agentId)?.owner||[...this.connections.keys()].find(value=>publicAgentId(value)===agentId);
    if(!owner&&!existing.agents[agentId])fail('CALLER_UNKNOWN','成员 ID 必须来自实际连接或已保存记录。');
    await this.mutate('roles',state=>{if(!state.roles.some(r=>r.id===roleId))fail('ROLE_UNKNOWN','职位不存在。');const previous=state.agents[agentId],sourceIdentity=owner?this.sourceIdentityFor(owner):null;state.agents[agentId]={...(previous||{}),id:agentId,name:sourceIdentity?.displayName||this.connections.get(owner)?.name||previous?.name||'外部 AI',roleId,kind:this.nativeAssignments.has(owner)?'native':previous?.kind||'mcp',updatedAt:now()};if(sourceIdentity){state.agents[agentId].sourceBindingId=sourceIdentity.bindingId;state.agents[agentId].clientReportedName=this.connections.get(owner)?.clientReportedName||previous?.clientReportedName||'外部 AI';}});
    const native=this.nativeAssignments.get(owner);if(native)this.nativeAssignments.set(owner,{...native,roleId});this.emit('roles');
  }
  connectionForAgent(id){return [...this.connections].find(([owner])=>publicAgentId(owner)===id)?.[1];}
  task(state,id){const task=state.tasks.find(t=>t.id===id);if(!task)fail('TASK_UNKNOWN','先读取任务清单，不猜测 ID。');return task;}
  publicTask(task){const result=clone(task);result.attempts=this.collaboration.publicAttempts(task);if(result.owner)result.ownerAgentId=result.owner;delete result.owner;delete result.lease;delete result.clientKey;delete result.bodyHash;return result;}
  async createTask(input,owner='local-user',allocation){return this.collaboration.createTask(input,owner,allocation);}
  async claimTask(id,revision,owner){return this.collaboration.claimTask(id,revision,owner);}
  async updateTask(input,owner){return this.collaboration.submitTask(input,owner);}
  async releaseTask(id,revision){return this.mutate('tasks',state=>{const task=this.task(state,id);if(task.revision!==revision)fail('TASK_VERSION_CONFLICT','任务版本已变化。');if(task.owner&&this.connectionForAgent(task.owner)&&Date.now()-this.connectionForAgent(task.owner).lastSeen<120000)fail('TASK_OWNER_ACTIVE','成员仍活动；先停止其任务并确认交接，不强行夺取。');if(!['blocked','queued','review'].includes(task.status))fail('TASK_RELEASE_REFUSED','只交接已阻塞、待领取或待审查的任务。');this.collaboration.closeForHandoff(task,'本地用户明确核对后交接；不等于命令已停止或功能已验证。');delete task.owner;delete task.lease;task.status='queued';task.executionState='not_started';task.validationState='unverified';task.validationScope=[];task.testsRun=false;task.testsPassed=false;task.acceptanceState='not_required';delete task.result;task.artifacts=[];task.revision++;task.updatedAt=now();return this.publicTask(task);});}
  async confirmTask(id,revision){return this.mutate('tasks',state=>{const task=this.task(state,id);if(task.revision!==revision||task.status!=='review')fail('TASK_VERSION_CONFLICT','只能确认当前待审查的结果。');task.status='completed';task.acceptedBy='local-user';task.acceptanceState='accepted';const acceptedAttempt=task.attempts.find(attempt=>attempt.id===task.activeAttemptId);if(acceptedAttempt)acceptedAttempt.acceptanceState='accepted';task.acceptedAt=now();task.completedAt=task.acceptedAt;task.completionMode='user-reviewed';task.revision++;task.updatedAt=now();return this.publicTask(task);});}
  async cancelTask(id,revision){return this.mutate('tasks',state=>{const task=this.task(state,id);if(task.revision!==revision)fail('TASK_VERSION_CONFLICT','任务版本已变化。');if(task.owner&&this.connectionForAgent(task.owner)&&Date.now()-this.connectionForAgent(task.owner).lastSeen<120000)fail('TASK_OWNER_ACTIVE','成员仍活动；先取消自身执行并确认命令状态。');if(task.status==='running')fail('TASK_OWNER_ACTIVE','不擅自取消仍在执行的外部任务。');if(this.collaboration.hasUnknown(task))fail('TASK_OUTCOME_UNKNOWN','取消记录不会停止在途命令，请先核对后交接。');this.collaboration.closeForHandoff(task,'本地用户取消任务记录；未冒称测试通过。');task.status='cancelled';task.executionState='cancelled';task.revision++;task.updatedAt=now();delete task.owner;delete task.lease;return this.publicTask(task);});}
  snapshot(id=this.currentWorkspaceId()){
    const state=this.read(),enabled=this.isCollaborationEnabled(state),workspaces=this.workspaces(state),agents=new Map(),activeAgents=new Map(),dialogues=new Map();
    if(enabled)for(const peer of this.currentMcpConnections()){
      const owner=peer.owner,agentId=publicAgentId(owner),connection=this.connections.get(owner),saved=state.agents[agentId]||{},sourceIdentity=this.sourceIdentityFor(owner);
      if(peer.sourceBindingId&&!sourceIdentity)continue;
      const role=this.role(owner,state);
      const agent={...saved,id:agentId,kind:'mcp',roleId:role.id,name:sourceIdentity?.displayName||connection?.name||saved.clientReportedName||saved.name||'外部 AI（未验证名称）',sourceIdentity,displayNameOrigin:sourceIdentity?'assistant-binding':'client-unverified',connected:true,online:peer.connectionState!=='confirmed-recent',connectionState:peer.connectionState,connectionConfirmedAt:peer.confirmedAt,connectionProtocol:peer.protocol,lastSeen:peer.lastSeen,ruleAcknowledged:this.acknowledged.get(this.key(owner,id))===this.effective(id,owner,state).rules_hash};
      // Display grouping is not authorization: separate credentials never inherit
      // each other's roles, task leases or command handles by a matching name.
      activeAgents.set(agentId,agent);
      const key=sourceIdentity?'native:'+sourceIdentity.instanceId+'\0'+sourceIdentity.conversationId:'owner:'+owner;
      const previous=dialogues.get(key);
      if(!previous||agent.connectionConfirmedAt>previous.connectionConfirmedAt||agent.connectionConfirmedAt===previous.connectionConfirmedAt&&agent.lastSeen>previous.lastSeen)dialogues.set(key,agent);
    }
    for(const agent of dialogues.values())agents.set(agent.id,agent);
    const time=task=>Date.parse(task.updatedAt||task.createdAt||'')||0;
    const tasks=enabled?state.tasks.filter(task=>task.workspaceId===id).slice().sort((a,b)=>time(b)-time(a)||(Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0)||String(a.id).localeCompare(String(b.id))).map(task=>{const result=this.publicTask(task);if(task.owner){const live=activeAgents.get(task.owner),saved=state.agents[task.owner];result.ownerName=live?.name||saved?.name||task.owner;result.ownerConnected=!!live;}return result;}):[];
    return {revision:state.revision,storageFile:this.file,presets:clone(state.presets),ruleLibrary:clone(state.ruleLibrary),ruleLibraryVersion:state.ruleLibraryVersion,globalPresetId:state.globalPresetId,globalSelectionVersion:state.globalSelectionVersion,bindings:clone(state.bindings),workspaces,collaborationEnabled:enabled,collaborationVersion:state.collaborationVersion||0,nativeTaskReviewRequired:state.nativeTaskReviewRequired===true,nativeTaskReviewVersion:state.nativeTaskReviewVersion||0,taskCategories:enabled?clone(state.taskCategories):[],messages:enabled?state.messages.filter(message=>message.workspaceId===id).map(message=>this.collaboration.publicMessage(message)):[],roles:enabled?clone(state.roles):[],agents:[...agents.values()],tasks,workspaceId:id,effectiveRules:this.effective(id,undefined,state),events:state.events.filter(event=>enabled||!COLLABORATION_MUTATIONS.has(event.kind)).slice(-50)};
  }
  async handleTool(name,args,owner){
    if(STAFF_TOOL_NAMES.has(name))return (this.staffRegistry||this.staff).handleTool(name,args,owner);
    if(COLLABORATION_TOOLS.has(name))this.requireCollaboration();
    this.touch(owner);let result;
    if(name==='bridge_get_effective_rules'){
      if(args.target_arguments!==undefined){
        if(args.workspace_id!==undefined)fail('RULES_TARGET_AMBIGUOUS','workspace_id 与 target_arguments 不能同时提供；请指定单一规则作用域或按工具目标定位。');
        result=this.getTargetRules(owner,args.target_arguments);
      }else result=this.getRules(owner,args.workspace_id);
    }
    else if(name==='bridge_acknowledge_rules')result=this.acknowledge(owner,args.workspace_id,args.rules_hash);
    else if(name==='bridge_join_collaboration')result=await this.mutate('agents',state=>{
      const agentId=publicAgentId(owner),sourceIdentity=this.sourceIdentityFor(owner),saved=state.agents[agentId]||{id:agentId,roleId:this.nativeAssignments.get(owner)?.roleId||'observer',kind:this.nativeAssignments.has(owner)?'native':'mcp'};
      saved.clientReportedName=sourceIdentity?(typeof args.name==='string'&&args.name.length<=200?cleanText(args.name,200):'外部 AI（来源由程序提供）'):cleanText(args.name||'外部 AI',200);saved.name=sourceIdentity?.displayName||saved.clientReportedName;
      if(sourceIdentity)saved.sourceBindingId=sourceIdentity.bindingId;
      saved.updatedAt=now();state.agents[agentId]=saved;this.touch(owner,saved.clientReportedName);
      return {agent_id:agentId,name:saved.name,roleId:saved.roleId,source_identity:sourceIdentity,displayNameOrigin:sourceIdentity?'assistant-binding':'client-unverified',displayIdentityUnverified:true};
    });
    else{
      if(args.message_id){const message=this.read().messages.find(item=>item.id===args.message_id);if(!message)fail('MESSAGE_UNKNOWN','消息必须来自收件箱。');await this.guard(name,{workspace_id:message.workspaceId},owner);}else if(args.task_id){const task=this.task(this.read(),args.task_id);await this.guard(name,{...args,workspace_id:task.workspaceId,path:task.workspaceId==='global'?undefined:this.workspace(task.workspaceId).root},owner);}else await this.guard(name,args,owner);
      if(name==='bridge_get_collaboration'){const value=this.snapshot(args.workspace_id||this.currentWorkspaceId());result={workspace_id:value.workspaceId,roles:value.roles,agents:value.agents,tasks:value.tasks,task_categories:value.taskCategories};}
      else if(name==='bridge_create_task')result=await this.createTask(args,owner);
      else if(name==='bridge_claim_task')result=await this.claimTask(args.task_id,args.expected_revision,owner);
      else if(name==='bridge_update_task')result=await this.updateTask(args,owner);
      else if(name==='bridge_get_execution')result=await this.collaboration.getExecution(args,owner);
      else if(name==='bridge_send_message')result=await this.collaboration.sendMessage(args,owner);
      else if(name==='bridge_list_messages')result=await this.collaboration.listMessages({...args,workspace_id:args.workspace_id||this.currentWorkspaceId()},owner);
      else if(name==='bridge_ack_message')result=await this.collaboration.acknowledgeMessage(args,owner);
      else if(name==='bridge_checkpoint_task'){const task=this.task(this.read(),args.task_id);if(task.revision!==args.expected_revision)fail('TASK_VERSION_CONFLICT','任务修订已变化。');if(this.collaboration.attempt(task).kind!=='mcp')fail('TASK_CHECKPOINT_OWNER','原生检查点由执行器维护。');result=await this.collaboration.saveCheckpoint(task.id,owner,args.lease,{format:'external-summary-v1',summary:requiredText(args.summary,16000),continuation:cleanText(args.continuation||'',16000)},args.expected_revision);}
      else if(name==='bridge_resume_task')result=await this.collaboration.resumeExternalTask(args,owner);
      else fail('TOOL_UNKNOWN','协作工具不存在。');
    }
    return {content:[{type:'text',text:JSON.stringify(result,null,2)}],structuredContent:result};
  }
  disconnect(owner){this.staff?.disconnect(owner);this.connections.delete(owner);for(const key of [...this.issued.keys()])if(key.startsWith(owner+'\0'))this.issued.delete(key);for(const key of [...this.acknowledged.keys()])if(key.startsWith(owner+'\0'))this.acknowledged.delete(key);}
  hasTool(name){return definitionMap.has(name);}
  dispose(){this.staff?.dispose();this.listeners.clear();this.connections.clear();this.issued.clear();this.acknowledged.clear();}
}

export function createAutomationService(context,vscode){
  const config=()=>vscode.workspace.getConfiguration('opencode');
  return new AutomationService({
    directory:config().get('rules.dataDirectory',''),
    allowLegacyMigration:config().get('rules.allowLegacyMigration',false) === true,
    snapshot:path.join(context.globalStorageUri.fsPath,'automation-state.v1.json'),
    initialText:()=>{const prior=config().inspect('bridge.customInstructions');return typeof prior?.globalValue==='string'?prior.globalValue:prior?.defaultValue||DEFAULT_TEXT;},
    workspaceLegacy:root=>{const prior=vscode.workspace.getConfiguration('opencode',vscode.Uri.file(root)).inspect('bridge.customInstructions');return prior?.workspaceFolderValue??prior?.workspaceValue;},
    workspaces:()=>vscode.workspace.workspaceFolders?.map(folder=>({root:folder.uri.fsPath,name:folder.name}))||[],
    currentRoot:()=>vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
    trusted:()=>vscode.workspace.isTrusted,
    log:message=>console.warn('[automation] '+message)
  });
}
