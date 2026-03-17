# 练习模式增强计划

> 目标：优化 practice 页面布局、答题卡、用户交互，减少操作步骤，增加背题模式与偏好控制

## 一、目标

1. **布局与视觉**：信息文本分层着色，答题卡动画与页面一致，作答状态在答题卡上有清晰反馈
2. **用户交互**：答错自动展示解析；可配置答对是否自动下一题；背题模式直接显示答案；提供上一题/下一题按钮

---

## 二、修改范围

### 2.1 信息文本颜色分层

| 元素 | 当前 | 修改后 | 说明 |
|------|------|--------|------|
| 分类标签 (Category) | `text-muted-foreground` | `text-primary` 或 `text-blue-600` | 突出知识领域 |
| 题号 (Question N of Total) | 与分类同色 | `text-muted-foreground` | 次要信息 |
| 题目正文 | `text-lg font-medium` | 保持，可加 `text-foreground` | 主内容 |
| 解析标题 | `text-sm font-semibold` | `text-primary` | 与主色一致 |
| 解析内容 | `text-muted-foreground` | `text-foreground/90` | 略深于当前，提升可读性 |

**涉及文件**：`src/components/practice/question-display.tsx`

---

### 2.2 答题卡优化

| 项目 | 当前 | 修改后 |
|------|------|--------|
| 动画 | 无 | 使用 Framer Motion，与页面统一（spring / 200ms ease-in-out） |
| 作答反馈 | 有 correct/wrong 样式，但可能不够明显 | 强化 correct（绿）/ wrong（红）/ current（蓝）的视觉区分，确保状态变化有过渡动画 |
| 与页面一致性 | 独立样式 | 使用 design-ux-standards 中的 `--color-correct`、`--color-wrong`、`--color-current` |
| 移动端展示 | 通过按钮切换显示/隐藏 | 使用 Sheet/Drawer，滑入滑出动画与设计规范一致 |
| **题型分组** | 单一网格，全局题号 1~N | **按题型分组**：单选、多选分开展示，各自 index 从 0 开始 |

#### 2.2.1 答题卡题型分组（单选 / 多选）

- **布局**：答题卡分为两个区块
  - **单选 (Single Choice)**：标题 + 题号网格，题号 0, 1, 2, ...
  - **多选 (Multiple Choice)**：标题 + 题号网格，题号 0, 1, 2, ...
- **编号规则**：每种题型内部独立编号，从 0 开始（展示时可显示为 1-based 如「第 1 题」）
- **数据映射**：`questions` 按 `question_type` 分组，得到 `singleChoiceIndices[]`、`multipleChoiceIndices[]`（全局 index 数组）；点击时 `onQuestionClick(globalIndex)`
- **当前高亮**：根据 `currentIndex` 判断所属题型，在对应区块内高亮其局部题号
- **空区块**：若某题型无题目，则不显示该区块
- **可滚动**：中间的题号网格区域为可滚动列表，题量多时可纵向滚动，避免撑满或溢出

**涉及文件**：
- `src/components/practice/answer-card.tsx`：增加题型分组、Framer Motion 动画、强化状态样式；Props 增加 `questions` 或 `questionTypeIndices`
- `src/components/practice/quiz-view.tsx`：按题型分组后传入 AnswerCard；移动端答题卡使用 Sheet 组件

---

### 2.3 用户交互优化

#### 2.3.1 答错自动展示解析

- **当前**：提交后显示解析，需点击 "Next Question" 进入下一题
- **修改**：答错时自动展开解析区域，无需额外操作；答对时根据用户偏好决定是否自动下一题

#### 2.3.2 答对是否自动下一题（用户偏好）

- 新增设置项：`autoNextOnCorrect`（默认 `true`）
- **开启**：答对后自动进入下一题（不显示解析，或可折叠显示）
- **关闭**：答对后显示解析，用户手动点击「下一题」
- 在答题区域提供 **切换按钮**（如图标 + Tooltip），可临时切换，并持久化到 `localStorage`（后续可接入 `user_preferences`）

#### 2.3.3 背题模式

- 新增模式：**背题模式**（Memorization Mode）
- 行为：进入题目后直接显示正确选项和解析，无需选择、无需提交
- 实现方式：
  - 新增 API：`GET /api/question-answer?questionId=xxx`，返回 `{ correctOptionIds, explanation }`（需校验题目访问权限）
  - 练习入口或答题页顶部增加「背题模式」开关
  - 背题模式下：加载题目时同时请求答案，直接渲染正确选项高亮 + 解析
  - 背题模式不写入 `user_attempts`（仅浏览学习）

**涉及文件**：
- `src/app/api/question-answer/route.ts`（新建）
- `src/components/practice/quiz-view.tsx`
- `src/components/practice/question-display.tsx`
- `src/components/practice/practice-entry.tsx`（入口增加背题模式入口）

#### 2.3.4 上一题 / 下一题按钮

- 在提交按钮区域增加「上一题」「下一题」按钮
- 上一题：`currentIndex > 0` 时可用
- 下一题：`currentIndex < total - 1` 时可用；最后一题显示「完成」并跳转总结/仪表盘
- 布局：`[上一题] [提交/下一题/完成] [下一题]` 或 `[上一题] [提交] [下一题]`（根据是否已提交调整）

#### 2.3.5 题目/选项/解析语言切换

- **位置**：答题区域顶部或导航栏旁（如 `🌐 EN | 中文`）
- **默认**：在 **英语** 与 **用户偏好语言** 之间切换
  - 偏好语言 = 当前 UI 语言（`useLocale()`，即 URL 的 `/zh/`、`/ja/` 等）
  - 若 UI 为英文，则偏好语言取 `user_preferences.question_language` 或默认 `zh`
- **切换范围**：题目文本、选项文本、解析内容（三者联动）
- **实现**：
  - 新增 API：`GET /api/question-content?questionId=xxx&language=en|zh|ja|ko`，返回 `{ question_text, options, explanation }`（校验题目访问权限）
  - 扩展 `POST /api/submit-answer`：请求体增加可选 `language`，返回对应语言的 `explanation`
  - 初始加载使用服务端传入的 locale 内容；切换时客户端请求对应语言并更新展示
- **提示**：按钮旁或 Tooltip 说明「点击在英语与 [偏好语言] 之间切换题目内容」；首次进入可显示简短引导（如 1 秒后自动消失的提示条）

**涉及文件**：
- `src/app/api/question-content/route.ts`（新建）
- `src/components/practice/quiz-view.tsx`
- `src/components/practice/question-display.tsx`
- 多语言文案（含切换提示、Tooltip）

---

### 2.4 补充优化（不含键盘快捷键、难度标识）

| 项目 | 说明 |
|------|------|
| 选项反馈动画 | 正确/错误选项变色时，✅/❌ 图标使用 Framer Motion 弹入动画（design-ux-standards 要求） |
| 切题过渡 | 切换题目时平滑滚动到题目顶部，题目区域淡入过渡 |
| 错误 Toast | 提交失败时显示 Toast 提示，支持重试（替代当前 TODO） |
| 移动端 Sheet | 答题卡使用 Shadcn Sheet 组件，底部滑出、遮罩、可滑动关闭 |
| 背题模式预取 | 背题模式下预取下一题答案，切换时无等待 |
| user_preferences 扩展 | 预留 `practice_preferences`（JSONB）或单独字段，便于后续持久化 autoNextOnCorrect |

---

## 三、文件清单

| 操作 | 文件路径 |
|------|----------|
| 新建 | `src/app/api/question-answer/route.ts` |
| 新建 | `src/app/api/question-content/route.ts` |
| 修改 | `src/components/practice/question-display.tsx` |
| 修改 | `src/components/practice/answer-card.tsx` |
| 修改 | `src/components/practice/quiz-view.tsx` |
| 修改 | `src/components/practice/practice-entry.tsx` |
| 修改 | `docs/design-practice.md` |
| 修改 | `src/messages/en.json`、`zh.json`、`ja.json`、`ko.json` |

---

## 四、设计文档更新

在 `docs/design-practice.md` 中补充：

1. **信息文本颜色**：分类、题号、解析的语义色规范
2. **答题卡**：题型分组（单选/多选分开展示、各自 index 从 0 开始）、Framer Motion 规范（与 design-ux-standards 一致）
3. **用户偏好**：`autoNextOnCorrect` 说明
4. **背题模式**：流程、API、不记录 user_attempts 的说明
5. **上一题/下一题**：按钮布局与行为
6. **题目内容语言切换**：切换按钮位置、默认英语↔偏好语言、API、提示文案

---

## 五、风险与权衡

| 风险 | 缓解 |
|------|------|
| 背题模式 API 可能被滥用获取答案 | 校验题目访问权限（免费/已购买），与练习模式一致 |
| 用户偏好持久化 | 先使用 localStorage，后续接入 user_preferences 表 |
| 答题卡动画性能 | 题数较多时（>200）可考虑虚拟化或简化动画 |

---

## 六、实施步骤（建议顺序）

1. 信息文本颜色分层（question-display.tsx）
2. 答题卡：题型分组（单选/多选、各自 index 从 0 开始）+ 动画与状态反馈（answer-card.tsx、quiz-view.tsx）
3. 移动端答题卡改用 Sheet 组件（quiz-view.tsx）
4. 上一题/下一题按钮（quiz-view.tsx）
5. 答错自动展示解析（已有，确认逻辑）
6. 答对自动下一题偏好 + 切换按钮（quiz-view.tsx + localStorage）
7. 选项反馈动画（question-display.tsx）
8. 切题过渡 + 错误 Toast（quiz-view.tsx）
9. 背题模式：API + 入口 + 题目展示逻辑 + 预取
10. 题目/选项/解析语言切换：API + 切换按钮 + 提示（quiz-view、question-display）
11. 设计文档同步更新
12. 多语言文案补充

---

请确认此计划是否符合预期，确认后开始实施。
