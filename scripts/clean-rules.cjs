const fs = require('fs');
const path = require('path');
const os = require('os');

const userRoot = process.platform === 'win32'
  ? (process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'))
  : (process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'));

const ruleFile = path.join(userRoot, 'OpenCode', 'shared-automation', 'rules-and-collaboration.v1.json');
console.log('Target file:', ruleFile);

if (!fs.existsSync(ruleFile)) {
  console.error('Rule file does not exist');
  process.exit(1);
}

// Create backup
fs.copyFileSync(ruleFile, ruleFile + '.bak');

let content = fs.readFileSync(ruleFile, 'utf8');

const s1 = '默认只生成；没有用户明确授权，不运行测试，不启停已有实例，不安装依赖，不发送或提交。';
const s2 = '只提交本次授权变更；已有未提交或暂存改动不得混称为本次修改，不得丢弃、覆盖或擅自提交无关内容。';

let count1 = 0;
let count2 = 0;

while (content.includes(s1)) {
  content = content.replace(s1, '');
  count1++;
}

while (content.includes(s2)) {
  content = content.replace(s2, '');
  count2++;
}

fs.writeFileSync(ruleFile, content, 'utf8');
console.log(`Replaced sentence 1: ${count1} times`);
console.log(`Replaced sentence 2: ${count2} times`);
console.log('Successfully updated rules file!');
