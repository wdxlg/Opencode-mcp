// Default Windows-MCP registration plus an explicit setup command.
// Importing/building starts nothing; only the application's defaults initializer registers it.
import crypto from 'node:crypto';
// The pinned published wheel was statically reviewed; this is not a runtime test certificate.
export const WINDOWS_MCP_RELEASE = Object.freeze({
  "id": "windows_mcp",
  "version": "0.8.8",
  "package": "windows-mcp",
  "python": "3.14",
  "reviewedWheelSha256": "597ef720e1902ba76510a4d2b946949f8a48f281dd210c183de5ded60ea3b873",
  "expectedTools": [
    "App",
    "Click",
    "Clipboard",
    "ControlStatus",
    "DisplayInventory",
    "FileSystem",
    "Move",
    "MultiEdit",
    "MultiSelect",
    "Notification",
    "PowerShell",
    "Process",
    "Registry",
    "Scrape",
    "Screenshot",
    "Scroll",
    "Shortcut",
    "Snapshot",
    "Type",
    "Wait",
    "WaitFor"
  ],
  "source": "https://github.com/CursorTouch/Windows-MCP",
  "license": "MIT"
});
export const WINDOWS_MCP_SETUP_COMMAND = 'opencode.mcp.windows.setup';
// Routing: looking at the screen / screenshots / videos go through the native see_now tool;
// Windows-MCP stays registered for clicking, typing and other desktop input.
export const WINDOWS_MCP_ROUTING_NOTE = '看屏幕、截图、看视频请用原生工具 see_now（单张截图 action:"peek"）；Windows-MCP 只负责点击、键入等桌面操作。';
export function windowsMcpConfiguration(){
  return {mcpServers:{windows_mcp:{
    command:'uvx',
    args:['--python','3.14','--from','windows-mcp==0.8.8','windows-mcp','serve'],
    env:{ANONYMIZED_TELEMETRY:'false'},
    timeout:180,
    description:'Windows-MCP 0.8.8：负责点击、键入等桌面操作（共 21 项工具）；'+WINDOWS_MCP_ROUTING_NOTE+'需 Windows 10/11 和 Python 3.14。使用前按任务授权，不自动测试。'
  }}};
}
// Uses the catalog's cross-process lock and normal secret storage. No desktop RPCs.
export async function initializeBundledWindowsMcp(context,catalog,log){
  if(process.platform!=='win32')return;
  await catalog.exclusive(async()=>{
    const current=catalog.snapshot();
    if(current.servers.some(server=>server.id===WINDOWS_MCP_RELEASE.id)){
      // Existing custom versions and per-target disable switches always win.
      await context.globalState.update('bundledWindowsMcpInitialized',true);
      log('[defaults] Windows-MCP existing configuration preserved');
      return;
    }
    if(context.globalState.get('bundledWindowsMcpInitialized')){
      log('[defaults] Windows-MCP deliberate removal preserved');
      return;
    }
    const preset=windowsMcpConfiguration().mcpServers.windows_mcp;
    const refs=[];
    const save=async value=>{
      const ref='opencode.externalMcp.'+crypto.randomUUID();
      await context.secrets.store(ref,value);refs.push(ref);return ref;
    };
    let persisted=false;
    try{
      const server=await catalog.persistDraft({
        ...preset,id:WINDOWS_MCP_RELEASE.id,label:'Windows-MCP 0.8.8 (bundled default)',transport:'stdio'
      },save,'both');
      catalog.save([...current.servers,server]);persisted=true;
      await context.globalState.update('bundledWindowsMcpInitialized',true);
      log('[defaults] Windows-MCP registered for editor and Bridge; dependencies resolve on first connection; no desktop actions verified');
    }catch(error){
      if(!persisted)for(const ref of refs)await context.secrets.delete(ref);
      throw error;
    }
  });
}
export function registerWindowsMcpIntegration({vscode,catalog,ready,getBridge}){
  return vscode.commands.registerCommand(WINDOWS_MCP_SETUP_COMMAND,async()=>{
    if(process.platform!=='win32')throw Error('Windows-MCP 需要 Windows 10/11 的交互式桌面，不能在其他平台假装完整接入。');
    if(!vscode.workspace.isTrusted)throw Error('请先信任工作区，再配置 Windows-MCP。');
    await ready();
    if(catalog.snapshot().servers.some(server=>server.id===WINDOWS_MCP_RELEASE.id)){
      await vscode.window.showInformationMessage('已有 windows_mcp 配置，已保留其版本、启停状态和权限；不会自动覆盖。请在 MCP 管理页确认或升级。');
      await vscode.commands.executeCommand('opencode.mcp.open');
      return {configured:true,existing:true,changed:false};
    }
    const approval=await vscode.window.showWarningMessage(
      '将 Windows-MCP 0.8.8 的全部 21 项工具发布到编辑器和 Bridge。首次连接会由 uv 按需复用或下载 Python 3.14 与依赖，可能需要联网；工具能够控制键鼠、窗口、文件、注册表和进程。会重新加载 MCP 配置，现有 MCP 连接可能重连。匿名遥测默认关闭。不改变多模型协作总开关，也不替你执行任何桌面操作或功能测试。是否配置并连接？',
      {modal:true},'配置并连接 Windows-MCP');
    if(approval!=='配置并连接 Windows-MCP')return {cancelled:true,changed:false};
    if(!vscode.workspace.isTrusted)throw Error('工作区信任状态已变化；未写入配置。');
    const raw=JSON.stringify(windowsMcpConfiguration());
    const preview=catalog.preview(raw);
    const entry=preview.entries.find(item=>item.id===WINDOWS_MCP_RELEASE.id);
    if(!entry||preview.errors.length)throw Error('Windows-MCP 配置预检未通过，未覆盖现有配置。');
    return vscode.window.withProgress({location:vscode.ProgressLocation.Notification,title:'Windows-MCP：发布配置与发现工具',cancellable:false},async progress=>{
      progress.report({message:'发布到编辑器与 Bridge；首次依赖准备可能需要数分钟。'});
      await catalog.import(raw,preview.token,[entry.id],'both');
      const bridge=getBridge();
      if(!bridge||bridge.getStatus().state!=='running'){
        await vscode.window.showInformationMessage('Windows-MCP 已配置到编辑器与 Bridge。Bridge 当前未运行，因此未自动启动 Bridge，也未验证其工具发现。编辑器连接状态请在 MCP 管理页查看。未运行功能测试。');
        return {configured:true,target:'both',discoveryVerified:false,functionalTestsRun:false};
      }
      try{
        await bridge.refreshExternalMcp({ids:[entry.id],connectTimeoutMs:180000});
        const definitions=await bridge.nativeWorkerToolDefinitions();
        const exposed=definitions.filter(tool=>tool.serverId===entry.id);
        const actual=new Set(exposed.map(tool=>tool.upstreamName));
        const missing=WINDOWS_MCP_RELEASE.expectedTools.filter(name=>!actual.has(name));
        if(missing.length){
          await vscode.window.showWarningMessage('Windows-MCP 配置已保留，但 Bridge 工具发现不完整：'+missing.join('、')+'。这不是功能测试通过，请检查 MCP 管理页。');
          return {configured:true,target:'both',discoveryVerified:false,discoveredTools:exposed.length,missing,functionalTestsRun:false};
        }
        await vscode.window.showInformationMessage('Bridge 已发现 Windows-MCP 全部 21 项工具；编辑器侧配置已发布。原生协作仅在总开关开启并单独确认启动后运行。图像需要宿主与模型支持，文字 UIA 快照不要求视觉模型。未执行键鼠、应用、文件写入或其他功能测试。');
        return {configured:true,target:'both',discoveryVerified:true,discoveredTools:exposed.length,functionalTestsRun:false};
      }catch(error){
        await vscode.window.showWarningMessage('Windows-MCP 配置已保留，首次连接尚未确认成功。请查看 MCP 管理页；没有自动重试桌面或系统操作。');
        return {configured:true,target:'both',discoveryVerified:false,functionalTestsRun:false};
      }
    });
  });
}
