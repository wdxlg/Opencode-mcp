# 任务：节点测速流式显示（opencode-隧道代理流式测速-20261111-2145-step01）

状态：源码修改、构建校验 errors=[]；发布被拦（opencode 运行中，脚本不停进程），待用户关闭后发布
## 改动
- tunnel-proxy.mjs：testLatency 后台运行、立即返回；每测完一项就写进 state.delays，并给出进度 done/total；测速错误单独保存，不被轮询清掉。
- opencode-tunnel-proxy-section.mjs：测速中每 700 ms 拉一次状态；未出结果的格子显示「…」；按钮显示「测速中 n/总数」；测速中保持行顺序，测完按延迟排序。
