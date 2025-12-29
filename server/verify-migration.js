// 验证 better-sqlite3 迁移是否完整
const fs = require('fs');
const path = require('path');

const indexJsPath = path.join(__dirname, 'index.js');
const content = fs.readFileSync(indexJsPath, 'utf8');

const issues = [];
const warnings = [];

console.log('=== Better-SQLite3 迁移验证 ===\n');

// 1. 检查是否还有 sqlite3 的 require
if (content.includes("require('sqlite3')") || content.includes('require("sqlite3")')) {
  issues.push('❌ 发现 sqlite3 的 require 语句');
} else {
  console.log('✅ 没有 sqlite3 引用');
}

// 2. 检查是否使用了 better-sqlite3
if (!content.includes("require('better-sqlite3')") && !content.includes('require("better-sqlite3")')) {
  issues.push('❌ 未找到 better-sqlite3 的 require 语句');
} else {
  console.log('✅ 正确使用 better-sqlite3');
}

// 3. 检查是否有异步回调模式（sqlite3 的特征）
const asyncPatterns = [
  { pattern: /\.serialize\(/, name: 'db.serialize()' },
  { pattern: /\.run\([^)]*function\s*\(/, name: 'db.run(function...)' },
  { pattern: /\.get\([^)]*function\s*\(/, name: 'db.get(function...)' },
  { pattern: /\.all\([^)]*function\s*\(/, name: 'db.all(function...)' },
  { pattern: /this\.lastID/, name: 'this.lastID (sqlite3 模式)' }
];

asyncPatterns.forEach(({ pattern, name }) => {
  if (pattern.test(content)) {
    issues.push(`❌ 发现异步回调模式: ${name}`);
  }
});

if (issues.length === 0) {
  console.log('✅ 没有发现异步回调模式');
}

// 4. 检查是否使用了 better-sqlite3 的同步模式
const syncPatterns = [
  { pattern: /db\.prepare\(/, name: 'db.prepare()' },
  { pattern: /\.run\(/, name: '.run()' },
  { pattern: /\.get\(/, name: '.get()' },
  { pattern: /\.all\(/, name: '.all()' },
  { pattern: /result\.lastInsertRowid/, name: 'result.lastInsertRowid' }
];

let hasSyncPatterns = false;
syncPatterns.forEach(({ pattern, name }) => {
  if (pattern.test(content)) {
    hasSyncPatterns = true;
  }
});

if (hasSyncPatterns) {
  console.log('✅ 正确使用同步 API');
} else {
  warnings.push('⚠️  未发现 better-sqlite3 的同步模式');
}

// 5. 检查错误处理
const hasTryCatch = content.includes('try') && content.includes('catch');
if (hasTryCatch) {
  console.log('✅ 有错误处理 (try-catch)');
} else {
  warnings.push('⚠️  缺少 try-catch 错误处理');
}

// 6. 检查 db.js 文件（旧文件，应该未使用）
const dbJsPath = path.join(__dirname, 'db.js');
if (fs.existsSync(dbJsPath)) {
  const dbJsContent = fs.readFileSync(dbJsPath, 'utf8');
  if (!content.includes("require('./db')") && !content.includes('require("./db")')) {
    warnings.push('⚠️  发现未使用的 db.js 文件（包含旧的 sqlite3 代码）');
  }
}

// 输出结果
console.log('\n=== 验证结果 ===\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ 迁移验证完全通过！');
  console.log('\n所有检查项：');
  console.log('  ✅ 使用 better-sqlite3');
  console.log('  ✅ 使用同步 API');
  console.log('  ✅ 没有异步回调模式');
  console.log('  ✅ 有错误处理');
  process.exit(0);
} else {
  if (issues.length > 0) {
    console.log('发现严重问题：\n');
    issues.forEach(issue => console.log(`  ${issue}`));
  }
  if (warnings.length > 0) {
    console.log('\n警告：\n');
    warnings.forEach(warning => console.log(`  ${warning}`));
  }
  process.exit(issues.length > 0 ? 1 : 0);
}

