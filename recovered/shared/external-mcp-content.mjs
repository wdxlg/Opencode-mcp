// Maintained MCP -> native LM content adapter. No IO, model requests or tool execution.
const IMAGE_MIME = /^(?:image\/png|image\/jpeg|image\/webp|image\/gif)$/i;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
export function nativeMcpResultParts(vscode, result) {
  const parts=[];
  const text=value=>parts.push(new vscode.LanguageModelTextPart(String(value)));
  const image=(data,mime)=>{
    if(typeof data!=='string'||!IMAGE_MIME.test(mime||'')||data.length>16*1024*1024||!BASE64.test(data))throw Error('MCP 图像格式无效或超过有界图像预算；未静默截断。');
    const bytes=Buffer.from(data,'base64');
    if(bytes.length>MAX_IMAGE_BYTES)throw Error('MCP 图像超过 12 MiB；请缩小截图区域或显示器范围。');
    const Data=vscode.LanguageModelDataPart;
    if(typeof Data?.image==='function')parts.push(Data.image(bytes,mime));
    else if(typeof Data==='function')parts.push(new Data(bytes,mime));
    else throw Error('当前宿主不支持模型图像内容；图像没有被伪装成 JSON 文本。请使用支持图像的宿主或 UIA 文字快照。');
  };
  if(result?.isError)text('工具返回错误；未知副作用不得自动重试。');
  for(const item of Array.isArray(result?.content)?result.content:[]){
    if(item?.type==='text')text(item.text||'');
    else if(item?.type==='image')image(item.data,item.mimeType);
    else if(item?.type==='resource'&&item.resource){
      const resource=item.resource;
      if(typeof resource.text==='string')text(resource.text);
      else if(typeof resource.blob==='string'&&IMAGE_MIME.test(resource.mimeType||''))image(resource.blob,resource.mimeType);
      else text(JSON.stringify({type:'resource',uri:resource.uri,mimeType:resource.mimeType,embeddedBinary:typeof resource.blob==='string'}));
    }else if(item?.type==='resource_link')text(JSON.stringify(item));
    else if(item?.type==='audio')throw Error('此原生协作内容通道尚不支持音频；没有静默丢弃该结果。');
    else if(item)text(JSON.stringify(item));
  }
  if(!parts.length&&result?.structuredContent!==undefined)text(JSON.stringify(result.structuredContent));
  if(!parts.length)text(JSON.stringify(result??null));
  return parts;
}
