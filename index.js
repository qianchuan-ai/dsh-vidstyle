/**
 * dsh-vidstyle —— host 端入口。
 *
 * 纯 host 插件（exports "."）：通过 import.meta.url 定位插件包内的
 * skills 目录，经 ctx.skills.registerProvider 注册一个 bundled 级
 * （rank 600）技能 provider，把中式美学 AI 视频风格库暴露给 DSH 的
 * 技能发现（技能选择器 / 技能调用）。
 *
 * 本插件只产出提示词，不生成图片或视频，因此没有任何 client 端代码、
 * 没有 UI 注入、没有外部运行时依赖。
 *
 * 生命周期：registerProvider 由 ctx.skills 注册器管理，fiber 销毁时
 * 自动注销 provider，无需额外副作用清理。apply() 对重复挂载保持幂等。
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProvider } from './lib/provider.js';

const name = 'dsh-vidstyle';

/** skills 是硬依赖：等 skills 服务出现后再激活。 */
const inject = ['skills'];

/** 防重复挂载：同一进程内 apply() 被调用两次时只注册一次。 */
let registered = false;

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx - Cordis 上下文。
 */
function apply(ctx) {
  if (registered) {
    ctx.logger.warn('dsh-vidstyle: provider already registered — duplicate mount ignored');
    return;
  }

  // index.js -> 包根目录 -> skills
  const packageRoot = dirname(fileURLToPath(import.meta.url));
  const skillsRoot = join(packageRoot, 'skills');

  ctx.skills.registerProvider(() => createProvider(ctx, skillsRoot));
  registered = true;

  ctx.effect(() => () => {
    registered = false;
  });
}

export { apply, inject, name };
