# dsh-vidstyle — 中式美学 AI 视频风格库

> Registers a Chinese-aesthetic AI video style library: 12 fully-specified visual styles (6 original Chinese-aesthetic + 6 international rewrites) that translate a look into paste-ready Chinese prompts for 即梦 / Seedance / 可灵 / 通义万相, with per-style prompt recipes, camera vocabulary, signature moves, failure pitfalls, and platform-specific syntax conversion for aspect ratio, shot length and negative prompts.

**中文**：一个「风格 → 提示词」的翻译库。12 个风格，每个一份 11 节方法卡，直接产出能粘进即梦 / Seedance / 可灵 / 万相的中文视频提示词。本库**不生成图片或视频**，只产出提示词。

---

## 为什么存在

「把这个画面写成敦煌风格的视频提示词」这句话，今天要靠模型现场即兴发挥——结果是每次风格都不一样，颜色、材质、运镜全靠运气。

本库把风格**固化成规则**：材质是什么、色号是什么、运镜词汇有哪些、招牌动作是什么、最容易崩在哪、负面词该写什么。模型每次读同一份方法卡，输出就稳定。

它和图片/视频生成模型的关系是**上游**：

```
题材 ──► 本库选风格 ──► 填 §10 配方 ──► 平台换算 ──► 一段可粘贴的提示词 ──► 即梦/Seedance/可灵/万相
```

## 12 个风格

### 国风原创（6）

| 风格 | slug | 一句话 |
|---|---|---|
| 敦煌飞天 | `dunhuang-feitian` | 矿物料绘于泥壁，飞天不生双翼、全凭飘带腾空 |
| 工笔花鸟 | `gongbi-flora` | 绢本细笔设色，三矾九染叠出半透明层次，丝毛一根根劈出 |
| 宋代极简 | `song-minimal` | 单色釉瓷器与边角构图，汝窑天青、哥窑开片，少即是满 |
| 水墨动画 | `ink-motion` | 生宣湿墨，边缘有纤维毛刺，墨分五色由焦到清 |
| 赛博中国 | `cyber-sino` | 雨夜霓虹的中式赛博，汉字招牌、飞檐斗拱、数据流穿过榫卯 |
| 皮影戏 | `shadow-puppet` | 驴皮镂刻的影人，五分侧面，关节线缀，透光色投在白幕上 |

### 国际重写（6）

| 风格 | slug | 一句话 |
|---|---|---|
| 浮世绘 | `ukiyoe` | 江户木版画，多版套印平涂色块，木刻钝感线，普鲁士蓝主导 |
| 油画厚涂 | `impasto-oil` | 堆厚的油画颜料，笔触与画刀的脊在光下有真实起伏 |
| 水彩晕染 | `watercolor-bleed` | 湿纸上的透明水彩，水自己走，边缘堆出水痕圈 |
| 像素复古 | `pixel-retro` | 低分辨率网格上的有限色板，硬边无抗锯齿，渐变靠抖动点阵 |
| 黑白电影 | `noir-archive` | 高对比黑白胶片，低调照明切出窄亮部，百叶窗影与银盐颗粒 |
| 拼贴手账 | `collage-journal` | 撕边纸张层次叠压，和纸胶带压角，拍立得与手写标注 |

完整索引（含每个风格的 `traits` 与 `native_moves`）：[`skills/dsh-vidstyle/catalog.json`](skills/dsh-vidstyle/catalog.json)。

## 每个风格给了什么

一份 `styles/<slug>/STYLE.md`，**11 节固定结构**：

| 节 | 内容 | 作用 |
|---|---|---|
| 1 | 本质，以及它不是什么 | 划清与易混风格的界线 |
| 2 | 材质与质感 | 物理媒介 + AI 怎么模仿它（含 hex） |
| 3 | 色彩逻辑 | 规则而非色板：几色、什么永不上色 |
| 4 | 字体与字幕 | 字体、字号、字幕如何属于这个世界 |
| 5 | 运动质感 | 抽帧感、缓动、重量、什么永不动 |
| 6 | 运镜语法 | **词汇表**（运动 → 表达什么 → 能服务什么） |
| 7 | 声音色板 | 乐器、拟音、静默作为工具 |
| 8 | 招牌动作 | **只有这个媒介能做的瞬间**，每个带 3 个适用例 |
| 9 | AI 生成避坑 | **最容易崩的地方 + 修法 + 专属负面词** |
| 10 | 提示词配方 | **一句话版 + 完整版，可直接复制** |
| 11 | 变化空间 | 三个结构 / 三个开场 / 三个结尾 |

§9 和 §10 是本库的核心：前者是「怎么不崩」，后者是「直接抄」。

## 两份公共技法

- **[`skills/dsh-vidstyle/LIB/TECHNIQUE.md`](skills/dsh-vidstyle/LIB/TECHNIQUE.md)** — 提示词怎么写。三条底层原则（材质优先于形容词 / 数字是约束 / 中文语序有权重）、风格锚点三种写法、占位符六类填法、负面词中式写法、运镜与运动分两层、时长画幅取舍、图生视频改写、一次不满意的排查顺序。
- **[`skills/dsh-vidstyle/LIB/PLATFORMS.md`](skills/dsh-vidstyle/LIB/PLATFORMS.md)** — 平台怎么换。即梦 / Seedance / 可灵 / 万相的语法差异、画幅换算、时长建议、三种语法写法（自然段式 / 结构化分镜式 / 中英混排）、图生视频换算、负面词接受度。

## 快速上手

**已知风格，要一条提示词：**

> 用敦煌飞天风格，写一条 4 秒竖屏提示词，主体是一个散花的天人

→ 读 `styles/dunhuang-feitian/STYLE.md` §10，填 `{主体}` `{环境}` `{运镜}`，按默认 9:16 / 即梦出稿。

**不知道用哪个风格：**

> 想做一条讲宋代茶事的短片，什么风格合适

→ 读 `catalog.json`，按 `traits` 挑 2–3 个给用户选（推荐 `song-minimal` `gongbi-flora` `ink-motion`）。

**要成片：**

→ 走 `SKILL.md` §3 的六步全流程：定风格 → 读全卡 → 写 treatment → 逐镜出提示词 → 平台适配 → 排查。

## 边界

- **不生成图片或视频**，只产出提示词。生成交给平台。
- **不写故事、不写分镜表、不做导演阐述**。本库管「一个镜头长什么样」。
- **不保证一次过**。提示词提高命中率；`TECHNIQUE.md` §8 有排查顺序。
- **平台数值会随版本更新**。`PLATFORMS.md` 写的是结构性差异（语序、负面词支持、图生视频行为），具体时长上限与画幅选项以平台当前文档为准。

---

## 目录结构

```
dsh-vidstyle/                        插件包根（npm 包）
├─ package.json                       dsh.bundle manifest
├─ cordis.patch.yml                   profile roster 插入行
├─ index.js                           host 端入口，注册技能 provider
├─ lib/                               frontmatter 解析 + provider（零外部依赖）
├─ README.md                          本文件
└─ skills/
   └─ dsh-vidstyle/                  技能目录（resourceBase）
      ├─ SKILL.md                    路由器：快查 / 全流程 / 硬规矩 / 文件地图
      ├─ catalog.json                12 风格索引 + 默认参数
      ├─ LIB/
      │  ├─ TECHNIQUE.md             提示词写法
      │  └─ PLATFORMS.md             平台语法对照
      └─ styles/
         ├─ _template/STYLE.md       11 节模板（新增风格照此写）
         └─ <slug>/STYLE.md          12 份方法卡
```

技能目录是自包含的：`SKILL.md`、`catalog.json`、`LIB/`、`styles/` 全在里面，所以 `SKILL.md` 里的相对路径直接就能解析，不依赖安装位置。

## 新增风格

1. 复制 `skills/dsh-vidstyle/styles/_template/STYLE.md` 到 `skills/dsh-vidstyle/styles/<slug>/`
2. 11 节全部填满（**§9 §10 不能省**）
3. 往 `skills/dsh-vidstyle/catalog.json` 的 `styles` 数组加一条，七个字段齐全：

```json
{
  "slug": "your-slug",
  "cn": "中文名",
  "en": "English Name",
  "cat": "国风",
  "cat_en": "Chinese Aesthetics",
  "line": "一句话（目录用，≤40 字）",
  "traits": ["决定性特征1", "特征2", "特征3"],
  "native_moves": ["招牌动作1", "招牌动作2", "招牌动作3"],
  "file": "styles/your-slug/STYLE.md"
}
```

`file` 必须能解析到真实路径。节号固定，别的指南会引用它们，不要改节序。

---

## License

MIT
