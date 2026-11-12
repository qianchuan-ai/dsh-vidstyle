/**
 * dsh-vidstyle — 极简 frontmatter 解析。
 *
 * 只支持本插件实际用到的 YAML 子集：`key: value` 单行键值，
 * 以及 `|` / `>` 块标量（多行描述会用到）。不引入第三方依赖，
 * 不做完整 YAML 实现——技能包的 frontmatter 就该保持简单。
 */

/** 技能名契约：小写字母、数字、连字符，连字符不连续不出现在首尾。 */
const SKILL_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** 保留键：由 provider 的结构化字段处理，不透传进 metadata。 */
const RESERVED_KEYS = new Set([
  'name',
  'description',
  'whenToUse',
  'disable-model-invocation',
  'user-invocable',
  'argument-hint',
]);

/**
 * 解析一段 markdown 的 frontmatter。
 * @param {string} raw - 文件全文。
 * @returns {{ data: Record<string, string>, body: string } | undefined}
 *   头部分隔符缺失或格式非法时返回 undefined。
 */
export function parseFrontmatter(raw) {
  if (typeof raw !== 'string') return undefined;
  const normalized = raw.replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---')) return undefined;

  // 找到起始 `---` 之后的第一个换行，再找闭合的 `---` 行。
  const headStart = normalized.indexOf('\n');
  if (headStart === -1) return undefined;

  const closeRe = /^---[ \t]*$/m;
  const rest = normalized.slice(headStart + 1);
  const closeMatch = closeRe.exec(rest);
  if (closeMatch === null) return undefined;

  const header = rest.slice(0, closeMatch.index);
  const bodyStart = headStart + 1 + closeMatch.index + closeMatch[0].length;
  const afterClose = normalized.slice(bodyStart);

  const data = parseHeader(header);
  if (data === undefined) return undefined;
  // 去掉闭合 `---` 之后的换行与空行，让 body 直接从首个非空字符开始。
  const body = afterClose.replace(/^(?:\r?\n)+/, '');
  return { data, body };
}

/**
 * 逐行解析头部分区。
 * @param {string} header - 分隔符之间的原始文本。
 * @returns {Record<string, string> | undefined} 出现任一无法识别的行时返回 undefined。
 */
function parseHeader(header) {
  const data = {};
  const lines = header.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i += 1; continue; }

    const match = /^([A-Za-z0-9_-]+):[ \t]*(.*)$/.exec(line);
    if (match === null) return undefined;

    const key = match[1];
    let value = match[2];
    i += 1;

    if (value === '|' || value === '>' || value === '|-' || value === '>-') {
      // 块标量：收集后续缩进行，按原文换行拼回。
      const block = [];
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
        block.push(lines[i].slice(2));
        i += 1;
      }
      value = value.startsWith('>')
        ? block.join(' ').trim()
        : block.join('\n').replace(/\s+$/, '');
    }

    data[key] = value;
  }
  return data;
}

/**
 * 校验技能名是否符合契约。
 * @param {unknown} name
 * @returns {boolean}
 */
export function isSkillName(name) {
  return typeof name === 'string' && SKILL_NAME_RE.test(name);
}

/**
 * 取一个非空字符串字段。
 * @param {Record<string, string>} data
 * @param {string} key
 * @returns {string | undefined}
 */
export function stringField(data, key) {
  const value = data[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * 解析技能调用策略（invocation policy）。
 *
 * 本插件的技能是纯路由器，不设置调用约束——一律返回默认策略。
 * 保留此函数是为了让 provider 的返回形状与 @deepseek-ai/dsh-skill 的
 * SkillProvider 契约一致，将来若要支持 `disable-model-invocation` 等键，
 * 只需在这里实现，provider 无需改动。
 *
 * @param {Record<string, string>} data
 * @returns {object}
 */
export function parseInvocationPolicy(data) {
  const invocation = {};
  if (data['disable-model-invocation'] === 'true') {
    invocation.disableModelInvocation = true;
  }
  if (data['user-invocable'] === 'false') {
    invocation.userInvocable = false;
  }
  return invocation;
}

/**
 * 把 provider 特有的剩余键收进 metadata。
 * @param {Record<string, string>} data
 * @returns {{ metadata: Record<string, string> } | {}}
 */
export function optionalMetadata(data) {
  const metadata = {};
  for (const [key, value] of Object.entries(data)) {
    if (RESERVED_KEYS.has(key)) continue;
    if (typeof value === 'string' && value.length > 0) metadata[key] = value;
  }
  if (typeof data['argument-hint'] === 'string' && data['argument-hint'].length > 0) {
    metadata['argument-hint'] = data['argument-hint'];
  }
  return Object.keys(metadata).length > 0 ? { metadata } : {};
}
