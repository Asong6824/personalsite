#!/usr/bin/env node
/**
 * 总门禁脚本 - Total Gate Check
 *
 * Harness Engineering 核心组件：把"是否完成"从 AI 的主观汇报变成可检查的客观结果。
 * 只有本脚本全部通过，才能认为代码具备合并/部署条件。
 *
 * 检查项（按依赖顺序）：
 * 1. Lint 代码检查
 * 2. 单元测试
 * 3. 文章索引验证（路由冲突、slug 合法性、配置有效性）
 * 4. TypeScript 编译 + Next.js 构建
 */

import { execSync } from "child_process";

interface CheckResult {
  name: string;
  passed: boolean;
  duration: number;
  output?: string;
  error?: string;
}

const checks: CheckResult[] = [];

function runCheck(name: string, command: string): CheckResult {
  console.log(`\n🔍 ${name}...`);
  const start = Date.now();
  try {
    const output = execSync(command, {
      encoding: "utf-8",
      stdio: "pipe",
      cwd: process.cwd(),
    });
    const duration = Date.now() - start;
    console.log(`  ✅ ${name} 通过 (${duration}ms)`);
    return { name, passed: true, duration, output };
  } catch (error: any) {
    const duration = Date.now() - start;
    const stderr = error.stderr?.toString() || error.message || "";
    console.log(`  ❌ ${name} 失败 (${duration}ms)`);
    return { name, passed: false, duration, error: stderr };
  }
}

function printSummary() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 总门禁检查汇总");
  console.log("=".repeat(60));

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    const icon = check.passed ? "✅" : "❌";
    const status = check.passed ? "通过" : "失败";
    console.log(`${icon} ${check.name} — ${status} (${check.duration}ms)`);
    if (!check.passed) {
      failed++;
      if (check.error) {
        // 只输出前 15 行错误，避免刷屏
        const lines = check.error.split("\n").slice(0, 15);
        for (const line of lines) {
          console.log(`   ${line}`);
        }
        if (check.error.split("\n").length > 15) {
          console.log(`   ... (${check.error.split("\n").length - 15} more lines)`);
        }
      }
    } else {
      passed++;
    }
  }

  console.log("-".repeat(60));
  const total = checks.length;
  const allPassed = failed === 0;

  if (allPassed) {
    console.log(`🎉 全部通过！${passed}/${total} 项检查通过，代码可安全部署。`);
  } else {
    console.log(`💥 检查未通过：${passed}/${total} 通过，${failed} 项失败。`);
    console.log("   修复上述问题后重新运行本脚本。");
  }
  console.log("=".repeat(60));

  process.exit(allPassed ? 0 : 1);
}

async function main() {
  console.log("🚀 启动总门禁检查...");
  console.log(`⏰ ${new Date().toISOString()}`);

  // 1. ESLint
  // 注：当前项目有遗留 warning（第三方组件），先检查 exit code，未来目标 --max-warnings=0
  checks.push(runCheck("ESLint 代码检查", "npx next lint"));

  // 2. 单元测试
  checks.push(runCheck("单元测试", "npx vitest run --reporter=dot"));

  // 3. 文章索引验证
  checks.push(runCheck("文章索引验证", "npx tsx scripts/build-posts-index.ts"));

  // 4. Next.js 构建
  // 注意：构建是最慢的，放在最后
  checks.push(runCheck("Next.js 构建", "npx next build"));

  printSummary();
}

main().catch((err) => {
  console.error("门禁脚本异常：", err);
  process.exit(1);
});
