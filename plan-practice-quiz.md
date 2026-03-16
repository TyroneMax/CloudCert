# 练习页与题库关联实施计划

> 关联设计：[design-practice.md](docs/design-practice.md) | 路由：`/certifications`、`/practice/[certId]`

## 目标

1. **创建答题界面（Quiz UI）**：用户从练习入口点击「从第 1 题开始」或「从第 n 题继续」后，进入实际的答题界面（题目展示、选项选择、提交、反馈、答题卡片）
2. **建立与题库页的关联**：完善 `/certifications`（题库列表）→ `/practice/[certId]`（练习入口）→ 答题界面 的完整流程与导航关系

## 当前状态

| 页面 | 状态 | 说明 |
|------|------|------|
| `/certifications` | ✅ 已有 | 题库列表，卡片链接到 `/practice/[code]` |
| `/practice/[certId]` | ⚠️ 部分 | 仅展示练习入口（统计、全部题目、按分类），**缺少答题界面** |
| 练习入口按钮 | ⚠️ 未生效 | 「Start from Q1」「Continue from Q157」链接到 `?start=1`，但页面未根据该参数切换为答题模式 |

## 设计依据

- `Cursor.md`：questions、options、user_attempts 表结构
- `design-practice.md`：答题界面布局、答题卡片、反馈流程、响应式
- `design-ux-standards.md`：Design Tokens、组件规范

## 实施步骤

### Step 1：路由与模式切换

**文件：** `src/app/[locale]/practice/[certId]/page.tsx`

- 读取 `searchParams`: `start`（起始题号）、`mode`（all | category）、`category`（分类 ID）
- 若存在 `start` 或 `mode=category&category=` → 渲染 **答题界面**（QuizView）
- 否则 → 渲染 **练习入口**（PracticeEntry，当前已有）

**逻辑：**
```
if (searchParams.start || (searchParams.mode === 'category' && searchParams.category)) {
  → QuizView (答题界面)
} else {
  → PracticeEntry (练习入口)
}
```

---

### Step 2：答题界面主组件

**新建文件：** `src/components/practice/quiz-view.tsx`

- Client Component，接收：`certCode`、`startIndex`（1-based）、`mode`、`categoryId?`
- 布局：
  - **Desktop (≥1024px)**：双栏，左侧题目区（70%）+ 右侧答题卡片（30%，sticky）
  - **Tablet/Mobile**：单栏，导航栏显示「📋」按钮，点击滑出答题卡片（Drawer/Sheet）
- 导航栏：返回、认证名称、Q n/Total、答题卡片按钮、语言切换
- 底部进度条

**子组件拆分：**
- `QuestionDisplay` — 题目文本、分类标签、选项列表（单选/多选）
- `AnswerCard` — 题号网格、状态（✅❌▶⬜🔒）、点击跳转
- `SubmitButton` / `NextButton` — 提交答案、下一题

---

### Step 3：题目数据层

**新建/修改：** `src/lib/data/questions.ts`

- `getQuestionsForPractice(certCode, options?)`：按认证获取题目列表
  - `options.mode`: `all` | `category`
  - `options.categoryId`: 分类 ID（mode=category 时）
  - 返回：`{ questions: Question[], total: number }`
- `Question` 类型：`id`, `question_text`, `question_type`, `category_name`, `options`（不含 `is_correct`）
- **降级**：数据库未就绪时使用 mock 数据（5–10 道示例题）

---

### Step 4：答题状态与提交

**新建：** `src/app/api/submit-answer/route.ts`（或 Server Action）

- `POST` 请求：`{ questionId, selectedOptionIds[] }`
- 服务端判定正误（比对 options.is_correct）
- 返回：`{ isCorrect, correctOptionIds, explanation }`
- **降级**：可先实现 mock 逻辑，不写入 user_attempts

**Client 状态：**
- `currentIndex`：当前题目索引
- `answers`: `Map<questionId, { selectedIds, isCorrect?, status }>`
- 提交后更新状态，显示反馈（正确/错误 + 解析）

---

### Step 5：与题库页的关联强化

**修改：** `src/components/certifications/certification-card.tsx`

- 保持现有 `Link` 到 `/practice/[code]`
- 可选：卡片上增加「题目数」「免费题数」等文案，强化「题库」概念

**修改：** `src/components/layout/navbar.tsx`

- 确保「Certifications」链接指向 `/certifications`（已有）
- 可选：在答题界面导航栏增加「← 返回题库」链接到 `/certifications`

**修改：** `src/components/practice/practice-entry.tsx`

- 「← Back」已指向 `/certifications`，保持不变
- 确保「Start from Q1」「Continue」链接正确（已有 `?start=`）

---

### Step 6：国际化

**修改：** `src/messages/en.json`、`zh.json`、`ja.json`、`ko.json`

新增 `practice.quiz` 相关 key：
- `submitAnswer`, `nextQuestion`, `correct`, `wrong`, `explanation`, `answerCard`, `progress`, `questionN`, `locked`, `reviewMode` 等

---

## 文件变更清单

| 操作 | 路径 |
|------|------|
| 修改 | `src/app/[locale]/practice/[certId]/page.tsx` |
| 新建 | `src/components/practice/quiz-view.tsx` |
| 新建 | `src/components/practice/question-display.tsx` |
| 新建 | `src/components/practice/answer-card.tsx` |
| 新建 | `src/lib/data/questions.ts` |
| 新建 | `src/app/api/submit-answer/route.ts` |
| 修改 | `src/messages/en.json` |
| 修改 | `src/messages/zh.json` |
| 修改 | `src/messages/ja.json` |
| 修改 | `src/messages/ko.json` |

---

## 风险与备选

| 风险 | 应对 |
|------|------|
| 数据库表未就绪 | 使用 mock 题目数据，接口抽象便于后续替换 |
| 未登录访问答题 | 按 design-practice，练习需登录；可在 middleware 或页面级校验 |
| 付费题目锁定 | 先实现基础流程，锁定逻辑可后续加 |

---

## 验收标准

1. 访问 `/[locale]/certifications` 可看到题库卡片
2. 点击卡片进入 `/[locale]/practice/[certId]` 练习入口
3. 点击「Start from Q1」进入答题界面，显示题目与选项
4. 选择选项后点击「Submit」可看到正确/错误反馈
5. 答题卡片（Desktop 右侧 / Mobile 底部 Sheet）显示题号与状态
6. 点击题号可跳转到对应题目
7. 「← Back」可返回练习入口，再返回题库列表
8. 多语言切换正常
