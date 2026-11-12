/**
 * dsh-vidstyle 技能 provider。
 *
 * 把插件包内 skills/ 下的每个技能目录注册为 ctx.skills 的一个 provider，
 * 满足 @deepseek-ai/dsh-skill 的 SkillProvider 契约：
 *
 * - list(options)：返回 SkillCandidate[]（complete 简写形式）；
 * - get(candidate, options)：加载完整 SkillDefinition（含正文 content）。
 *
 * 只依赖 node: 内置模块与相对导入，不做外部包解析。无状态：list/get
 * 均按需读盘，不持有句柄，因此无需在 control.signal 上挂清理逻辑
 * （注册器本身负责 fiber 销毁时的注销）。
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  isSkillName,
  optionalMetadata,
  parseFrontmatter,
  parseInvocationPolicy,
  stringField,
} from './frontmatter.js';

/** provider 唯一名（同一 registry 层内不可重复）。 */
export const PROVIDER_NAME = 'dsh-vidstyle';

/** bundled 级 rank：与 @deepseek-ai/dsh-skill 导出的 BUNDLED_SKILL_RANK 一致。 */
export const PROVIDER_RANK = 600;

/**
 * 创建 stateless 技能 provider。
 * @param {object} ctx - Cordis 上下文（用 ctx.logger 输出告警）。
 * @param {string} skillsRoot - 插件包内 skills 目录的绝对路径。
 * @returns {import('@deepseek-ai/dsh-skill').SkillProvider}
 */
export function createProvider(ctx, skillsRoot) {
  return {
    name: PROVIDER_NAME,

    async list(options) {
      const candidates = [];
      let entries;
      try {
        entries = await readdir(skillsRoot, { withFileTypes: true });
      } catch (error) {
        if (isAbsentPathError(error)) return candidates;
        throw error;
      }

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        options.signal?.throwIfAborted();

        const skillDir = join(skillsRoot, entry.name);
        const skillFile = join(skillDir, 'SKILL.md');
        const candidate = await readCandidate(skillDir, skillFile, options.signal);
        if (candidate === undefined) {
          ctx.logger.warn(`dsh-vidstyle: ${skillFile} ignored: missing or invalid frontmatter`);
          continue;
        }
        candidates.push(candidate);
      }

      candidates.sort((a, b) => a.name.localeCompare(b.name));
      return candidates;
    },

    async get(candidate, options) {
      const locator = candidate.locator;
      if (
        typeof locator !== 'object'
        || locator === null
        || typeof locator.path !== 'string'
        || typeof locator.directory !== 'string'
      ) {
        return undefined;
      }

      const parsed = await readSkillFile(locator.path, options.signal);
      if (parsed === undefined) return undefined;

      const data = parsed.data;
      const name = stringField(data, 'name') ?? candidate.name;
      const description = stringField(data, 'description') ?? candidate.description;
      if (!isSkillName(name)) return undefined;

      let invocation;
      try {
        invocation = parseInvocationPolicy(data);
      } catch {
        return undefined;
      }

      return {
        name,
        description,
        ...optionalWhenToUse(data),
        invocation,
        source: candidate.source,
        provider: PROVIDER_NAME,
        resourceBase: { kind: 'directory', path: locator.directory },
        path: locator.path,
        ...optionalMetadata(data),
        content: parsed.body.trim(),
      };
    },
  };
}

/**
 * 解析一个技能目录并产出候选；文件缺失 / frontmatter 非法时返回 undefined。
 * @param {string} skillDir - 技能目录绝对路径（作为 resourceBase）。
 * @param {string} skillFile - SKILL.md 绝对路径。
 * @param {AbortSignal | undefined} signal - 取消信号。
 * @returns {Promise<object | undefined>}
 */
async function readCandidate(skillDir, skillFile, signal) {
  const parsed = await readSkillFile(skillFile, signal);
  if (parsed === undefined) return undefined;

  const data = parsed.data;
  const name = stringField(data, 'name');
  const description = stringField(data, 'description');
  if (name === undefined || description === undefined) return undefined;
  if (!isSkillName(name)) return undefined;

  let invocation;
  try {
    invocation = parseInvocationPolicy(data);
  } catch {
    return undefined;
  }

  return {
    name,
    description,
    ...optionalWhenToUse(data),
    invocation,
    source: 'bundled',
    provider: PROVIDER_NAME,
    rank: PROVIDER_RANK,
    locator: { path: skillFile, directory: skillDir },
    resourceBase: { kind: 'directory', path: skillDir },
    path: skillFile,
    ...optionalMetadata(data),
  };
}

/**
 * 读取并解析 SKILL.md；文件缺失或非法时返回 undefined。
 * @param {string} path - SKILL.md 绝对路径。
 * @param {AbortSignal | undefined} signal - 取消信号。
 * @returns {Promise<{ data: Record<string, string>, body: string } | undefined>}
 */
async function readSkillFile(path, signal) {
  signal?.throwIfAborted();
  try {
    const raw = await readFile(path, { encoding: 'utf8', signal });
    return parseFrontmatter(raw);
  } catch (error) {
    signal?.throwIfAborted();
    if (isAbsentPathError(error)) return undefined;
    throw error;
  }
}

function optionalWhenToUse(data) {
  const value = data['whenToUse'];
  return typeof value === 'string' && value.length > 0 ? { whenToUse: value } : {};
}

function isAbsentPathError(error) {
  return (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error.code === 'ENOENT' || error.code === 'ENOTDIR')
  );
}
