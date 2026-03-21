# Plan: 答题页美化、双语内容、设置开关、答题卡修复

## Goal

1. **答题页**：整体视觉升级；上一题/下一题更易用；**题目加载时同时拉取英文 + 用户偏好语言的题干、选项与解析**，答题区提供语言切换（与 UI 语言解耦：偏好语言以 `user_preferences.question_language` 为准，未登录则用当前路由 `locale`）。
2. **设置页**：改为卡片 + **开关（Switch）** 式布局；**答对自动下一题**、**练习模式（进入题目即显示解析/答案，等价于可开关的「背题/Reveal」行为）** 可在设置中配置。
3. **答题卡**：修复少量题目时网格被 `1fr` 拉成「对半开」的布局；美化样式；修复 **当前题覆盖 correct/wrong 导致与顶部统计/图例不一致** 的问题。

---

## Approach

### 1. 双语题目数据（服务端一次拉齐）

- 扩展 `src/lib/data/questions.ts` 中 `Question` 类型，例如增加：
  - `contentByLocale: Record<string, { question_text; category_name; options; explanation }>`  
  - 或等价结构，**至少包含 `en` 与 `preferred`（`question_language` 或路由 `locale`）**；若两者相同则只存一份，避免重复查询。
- `getQuestionsForPractice` / `getQuestionsByIds`：
  - 入参增加 `preferredLocale`（来自已登录用户的 `question_language`，否则用页面 `locale`）。
  - 对每道题并行读取：`questions`/`options` 基表 + `question_translations` / `option_translations` / `category_translations` 中 **`en` 与 `preferredLocale`** 的文本；**解析**从 `questions.explanation` + `question_translations.explanation` 取齐（背题/已提交展示均用本地数据切换，无需再为解析单独打 API）。
- `src/app/[locale]/certifications/[certId]/page.tsx`：在拉题前读取 `user_preferences.question_language`（若已登录），传入 data 层。

**客户端 `QuizView` / `QuestionDisplay`**：

- 状态 `contentLocale: 'en' | preferredCode`（默认：**与 `question_language` 一致**；若与 `en` 相同则默认 `en`，可隐藏切换）。
- 工具栏增加 **语言切换控件**（如分段按钮或 `EN | 中文`），仅在有两种不同内容时显示。
- `AnswerState` 中解析可改为按语言存储或直接使用题目 bundle 中对应语言的 `explanation`（提交后仍用服务端校验结果 + `correctOptionIds`，解析文本从 bundle 取，保证与切换一致）。

**`POST /api/submit-answer`**（小改）：

- 可选：请求体增加 `explanationLocale` 仅作校验日志用；或保持不返回长解析、由前端用 bundle 展示（需与当前「返回 explanation」行为对齐，避免重复维护）。**推荐**：仍返回 `correctOptionIds` / `isCorrect`，解析以前端 `contentByLocale` 为准，减少 API 与 DB 往返；若担心 bundle 与 DB 不一致，可保留 API 返回英文解析作 fallback。

### 2. 答题页 UI（上一题 / 下一题 / 设置入口）

- 顶栏：返回链接 + **带文案的上一题/下一题**（Outline + 图标，桌面可显示 `Previous` / `Next`），中间或右侧保留题号与认证名。
- **答对自动下一题**：从 Popover 迁出为主流程由**设置 + localStorage** 控制（见下）；答题页可保留小型「快捷开关」或仅保留设置页单一来源（计划在实现时二选一，默认 **设置页为主、localStorage 同步**）。
- 题目区：`QuestionDisplay` 外层的卡片化、间距与主站 `design-practice.md` 双栏描述对齐（适度阴影、圆角、选项 hover）。

### 3. 设置页（Switch + 练习偏好）

- 使用 Shadcn **Switch**（新增 `src/components/ui/switch.tsx`，与现有 Button/Sheet 风格一致）。
- 布局：分区卡片（Profile / Language / **Practice**），每行「标题 + 说明 + Switch」。
- **答对自动下一题**：`localStorage` key 与现有一致（如 `practice_autoNextOnCorrect`），设置页读写；登录用户 **写入 `user_preferences`** 新字段以实现跨设备（见迁移）。
- **练习模式（直接显示解析）**：新 key `practice_revealImmediate`（或命名一致文案），`QuizView` 行为与当前 `memorizationMode` 类似：**进入题目即展示正确答案与解析**，可不调用 `submit-answer` 写入 attempts（与现背题模式一致）；或与 memorization 合并为一个由设置驱动的布尔。  
  - URL `?mode=memorization` 可保留为「深链入口」，与设置开关逻辑统一，避免两套行为分叉（实现时以设计文档一句说明为准）。

**数据库**（与 `Cursor.md` / `design-auth.md` 同步）：

- 新迁移：`user_preferences` 增加  
  - `practice_auto_next_on_correct boolean NOT NULL DEFAULT true`  
  - `practice_reveal_immediate boolean NOT NULL DEFAULT false`  
- `settings/page.tsx` 查询并传入 `SettingsClient`；保存时 `update` 两字段。
- 未登录用户仅 localStorage；登录后以 DB 为准初始化（首次进入设置可从 DB 覆盖本地，避免分叉——在计划中采用 **打开设置页时用 DB 覆盖本地 practice 键** 的简单策略）。

### 4. 答题卡（`answer-card.tsx`）

- **布局**：不再使用 `repeat(min(10, n), 1fr)`（会导致 n=2 时两列各占 50%）。改为 **固定列数**（如 `grid-cols-5 sm:grid-cols-6`）+ `gap-2`，单元格 `aspect-square` 或固定 `min-w-[2rem]`，多余空位自然留在最后一行。
- **题号**：展示 **1-based 局部题号**（`localIdx + 1`），而非当前的 `localIdx`（0 起易被误认为 bug）。
- **状态一致性**：`current` 不与 `correct`/`wrong` 互斥覆盖。采用 **组合样式**：已作答 → 绿/红背景；当前题额外 **`ring-2 ring-primary` 或外圈指示**，图例中说明「当前题在已答状态上带主色环」。顶部 **correct/wrong 统计** 仍基于真实作答，与格子颜色一致。
- 视觉：统计行做成小 Pill/分隔线；图例紧凑一行或两行；与 `design-practice.md` 答题卡示意一致处更新文档。

---

## Files Affected（预计）

| 操作 | 路径 |
|------|------|
| 修改 | `src/lib/data/questions.ts`（双语 bundle、类型） |
| 修改 | `src/app/[locale]/certifications/[certId]/page.tsx`（传 `question_language`、双语文题目） |
| 修改 | `src/components/practice/quiz-view.tsx`（语言切换、布局、读 practice 偏好） |
| 修改 | `src/components/practice/question-display.tsx`（接收当前 locale 文案） |
| 修改 | `src/components/practice/answer-card.tsx`（网格、题号、状态层叠） |
| 修改 | `src/app/[locale]/settings/settings-client.tsx`、`settings/page.tsx` |
| 新增 | `src/components/ui/switch.tsx` |
| 新增 | `supabase/migrations/xxxxxxxx_practice_prefs.sql` |
| 修改 | `src/app/api/submit-answer/route.ts`（按需精简/保留 explanation） |
| 修改 | `docs/design-practice.md`、`Cursor.md`（`user_preferences` 字段说明） |
| 修改 | `src/messages/en.json`、`zh.json`、`ja.json`、`ko.json`（新文案） |

---

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 每题多语言查询增加 DB round-trips | 按认证批量 `in()` 拉取 translations，避免每题单独 query；必要时合并为单次批量查询 |
| `practice_reveal` 与 URL memorization 双入口 | 统一数据源（设置 + query param 覆盖）并在文档中写清优先级 |
| 提交后解析仅英文 | 以 `contentByLocale` 为准，与语言切换一致 |

---

## Steps（实现顺序）

1. `user_preferences` 迁移 + 设置页读写 + Switch 组件 + 练习区 UI  
2. `questions` 数据层双语 bundle + 认证详情页传参  
3. `QuizView` / `QuestionDisplay` 语言切换与样式  
4. `answer-card` 网格与状态修复 + 美化  
5. 同步 `design-practice.md` / `Cursor.md` 与 i18n 文案  

---

请确认是否按此方案执行；若有偏好（例如练习模式是否仍写入 `user_attempts`、答题页是否完全移除自动下一题 Popover），请说明后再开工。
