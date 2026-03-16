# 题库列表页与练习入口页实施计划

> 关联设计：[design-practice.md](docs/design-practice.md) | 路由：`/certifications`、`/practice/[certId]`

## 目标

实现两个核心页面：
1. **题库列表页** (`/certifications`) — 展示所有认证（question bank）的网格卡片
2. **练习入口页** (`/practice/[certId]`) — 选择认证后的详情页，展示进度、选择练习方式（全部题目 / 按分类）

## 设计依据

- `Cursor.md`：数据库 Schema（certifications, categories, questions, user_attempts）
- `design-practice.md`：页面布局、卡片内容、交互流程
- `design-ux-standards.md`：Design Tokens、组件规范、响应式

## 实施步骤

### Step 1：题库列表页 (`/certifications`)

**文件：**
- `src/app/[locale]/certifications/page.tsx` — 主页面（Server Component）
- `src/components/certifications/certification-card.tsx` — 认证卡片组件
- `src/components/certifications/provider-filter.tsx` — 厂商筛选（可选，可先内联）
- `src/lib/data/certifications.ts` — 数据获取逻辑（或 Server Action）

**页面内容：**
- 网格卡片展示所有 `is_active = true` 的认证
- 每张卡片：认证图标、名称（多语言）、厂商、题目总数、免费题目数、进度条（已登录）、Available/Coming Soon 标签
- 按厂商筛选：AWS / Azure / GCP / All
- 未登录用户可浏览，点击进入时根据 design-practice 流程：提示登录或跳转

**数据依赖：**
- `certifications` 表（含 `total_questions`, `free_question_limit`, `is_active`）
- `certification_translations` 表（多语言名称）
- 若已登录：`user_attempts` 聚合计算进度

**降级策略：** 若 `certifications` 表尚未创建，使用 mock 数据（1–2 个示例认证）保证页面可渲染，便于后续接入真实数据。

---

### Step 2：练习入口页 (`/practice/[certId]`)

**文件：**
- `src/app/[locale]/practice/[certId]/page.tsx` — 主页面（Server Component）
- `src/components/practice/practice-entry.tsx` — 练习入口主组件
- `src/components/practice/stats-overview.tsx` — 进度/正确率/错题数统计
- `src/components/practice/category-list.tsx` — 按分类练习列表
- `src/lib/data/practice.ts` — 数据获取（认证详情、分类、用户进度）

**页面内容：**
- 认证信息概览：名称、总题数
- 统计卡片：Progress (已完成/总题数)、Correct Rate、Wrong Answers（含跳转错题本链接）
- 练习方式选择：
  - **全部题目**：Continue from Q{n} / Start from Q1
  - **按分类**：各知识领域列表，显示题数、完成情况、进度条
- 返回按钮、语言切换（复用 Navbar）

**数据依赖：**
- `certifications` + `certification_translations`
- `categories` + `category_translations`
- `questions`（按 certification_id、category_id 聚合）
- `user_attempts`（计算进度、正确率、错题数）

**路由参数：** `certId` 为 `certifications.code`（如 `aws-saa`），便于 SEO 友好 URL。

**降级策略：** 若表不存在，使用 mock 数据展示 UI 骨架。

---

### Step 3：国际化与导航

**文件：**
- `src/messages/en.json`、`zh.json`、`ja.json`、`ko.json` — 新增 certifications / practice 相关 key

**新增翻译 key 示例：**
- `certifications.title`, `certifications.filterAll`, `certifications.filterAws`, ...
- `practice.entry.title`, `practice.continueFrom`, `practice.startFrom`, `practice.byCategory`, `practice.wrongAnswers`, ...

**导航：**
- 列表页需包含 Navbar（复用 `layout` 或页面级）
- 练习入口页需「← Back」返回 `/certifications`

---

## 文件变更清单

| 操作 | 路径 |
|------|------|
| 修改 | `src/app/[locale]/certifications/page.tsx` |
| 新建 | `src/components/certifications/certification-card.tsx` |
| 新建 | `src/components/practice/practice-entry.tsx` |
| 新建 | `src/components/practice/stats-overview.tsx` |
| 新建 | `src/components/practice/category-list.tsx` |
| 新建 | `src/lib/data/certifications.ts` |
| 新建 | `src/lib/data/practice.ts` |
| 修改 | `src/app/[locale]/practice/[certId]/page.tsx` |
| 修改 | `src/messages/en.json` |
| 修改 | `src/messages/zh.json` |
| 修改 | `src/messages/ja.json` |
| 修改 | `src/messages/ko.json` |

---

## 风险与备选

| 风险 | 应对 |
|------|------|
| 数据库表未就绪 | 使用 mock 数据，接口抽象便于后续替换 |
| RLS 限制未登录访问 | 列表页 certifications 为公开数据，RLS 允许 `is_active=true` 的 SELECT |
| 练习入口需登录 | 按 design-practice 流程，未登录时重定向到登录页，登录后回跳 |

---

## 技术要点

- 使用 Server Component 预加载数据，减少客户端请求
- 遵循 design-ux-standards：Card 样式、Button 变体、响应式断点
- 使用 Framer Motion 12 做卡片进入动画
- 认证列表：Mobile 单列、Tablet 两列、Desktop 三列
- 练习入口：Mobile 单列、Desktop 可考虑两列布局（统计 + 分类）

---

## 验收标准

1. 访问 `/[locale]/certifications` 可看到认证卡片网格（至少 mock 数据）
2. 点击某认证卡片可进入 `/[locale]/practice/[code]`
3. 练习入口页展示统计、全部题目入口、按分类列表
4. 多语言切换正常
5. 响应式布局在 Mobile / Tablet / Desktop 下正确
