/**
 * 国际化迁移助手脚本
 * 使用方法：
 * 1. node src/i18n/i18nMigration.js <文件路径>
 * 2. 脚本会分析文件中的文本，提取可能需要国际化的内容
 * 3. 生成一个建议的修改版本和需要添加到语言文件的键值
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('vue-sfc-parser'); // 需要安装

// 命令行参数
const filePath = process.argv[2];

if (!filePath) {
  console.error('请提供一个Vue文件路径');
  process.exit(1);
}

// 读取文件内容
const fileContent = fs.readFileSync(filePath, 'utf8');

// 解析Vue文件
const { descriptor } = parse(fileContent);
const template = descriptor.template;
const script = descriptor.script;

if (!template) {
  console.error('文件没有template部分');
  process.exit(1);
}

// 简单的文本提取逻辑（实际应用中这里可以更加复杂）
const extractTexts = (html) => {
  const textPattern = />([^<>]+)</g;
  const results = [];
  let match;
  
  while ((match = textPattern.exec(html)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 1) { // 忽略空白和单字符
      results.push(text);
    }
  }
  
  return results;
};

// 提取文本并生成键值
const texts = extractTexts(template.content);

// 生成键值建议
const generateKeyValueSuggestions = (texts) => {
  const suggestions = {};
  const usedKeys = new Set();
  
  texts.forEach((text) => {
    // 简单的键生成逻辑
    let baseKey = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 20);
    
    // 处理重复键
    let key = baseKey;
    let counter = 1;
    while (usedKeys.has(key)) {
      key = `${baseKey}_${counter++}`;
    }
    
    usedKeys.add(key);
    suggestions[key] = text;
  });
  
  return suggestions;
};

const keyValueSuggestions = generateKeyValueSuggestions(texts);

// 输出结果
console.log('\n=== 提取的文本 ===');
texts.forEach((text) => console.log(`- "${text}"`));

console.log('\n=== 建议的键值对 ===');
console.log('// 中文 (zh.js)');
console.log('{');
Object.entries(keyValueSuggestions).forEach(([key, value]) => {
  console.log(`  "${key}": "${value}",`);
});
console.log('}');

console.log('\n// 英文 (en.js) - 需要翻译');
console.log('{');
Object.entries(keyValueSuggestions).forEach(([key, value]) => {
  console.log(`  "${key}": "${value}", // TODO: 翻译成英文`);
});
console.log('}');

console.log('\n=== 修改建议 ===');
console.log('在<script>部分添加:');
console.log(`import { useI18n } from 'vue-i18n';`);
console.log(`const { t } = useI18n();`);

console.log('\n将模板中的文本替换为:');
texts.forEach((text) => {
  const key = Object.entries(keyValueSuggestions).find(([_, val]) => val === text)?.[0];
  if (key) {
    console.log(`"${text}" -> {{ $t('${key}') }}`);
  }
});

console.log('\n自动化脚本只能提供建议，请根据实际情况手动调整键值结构和具体实现。'); 