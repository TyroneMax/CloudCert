# CloudCert 实施计划

> 跟踪项目开发进度，对应 Phase 1: Foundation 阶段

## 已完成

### 1. 项目骨架 ✅
- Next.js 16 + React 19 + TypeScript 5.9 + Tailwind CSS 4
- Shadcn/UI 组件库 (Button, Accordion)
- ESLint + PostCSS 配置
- `.gitignore` + `.env.local` 环境变量

### 2. Landing Page ✅
- 8 个 section 完整实现 (Hero, Certifications, Features, How It Works, Pricing, Testimonials, FAQ, CTA)
- Navbar + Footer 响应式布局
- Framer Motion 动画
- 设计文档: `docs/design-landing-page.md`

### 3. i18n 国际化 ✅
- next-intl 4.8 集成，路由重构为 `/[locale]/...`
- 4 种语言翻译文件: en / zh / ja / ko
- Navbar 多语言下拉菜单切换器
- 设计文档: `docs/design-i18n.md`

### 4. Per-Locale 字体 ✅
- EN: Plus Jakarta Sans / ZH: Noto Sans SC / JA: Zen Kaku Gothic New / KO: Gothic A1
- CJK 字体 `preload: false` 按需加载
- JetBrains Mono 等宽字体 (所有语言共用)

### 5. Supabase 基础集成 ✅
- 客户端 (`src/lib/supabase/client.ts`) + 服务端 (`src/lib/supabase/server.ts`)
- Middleware session 管理 (`src/lib/supabase/middleware.ts`)
- 数据库: `users` + `user_preferences` 表 + RLS + Triggers

### 6. 认证系统 (Auth) ✅
- 登录页 (`/[locale]/auth/login`) — Google OAuth + Email/Password
- 注册页 (`/[locale]/auth/register`) — 表单验证 + 邮箱确认提示
- OAuth 回调 (`/[locale]/auth/callback`)
- Middleware: i18n 路由 + Auth 受保护路由重定向
- 设计文档: `docs/design-auth.md`

### 7. Waitlist 候补名单 ✅
- `waitlist` 表 (email unique, locale, source, created_at) + RLS
- `WaitlistForm` 组件 — 双变体 (hero 浅色 / cta 深色)
- Hero Section + CTA Section 集成 waitlist 表单
- 4 语言翻译 (成功、重复、错误提示)
- 设计文档: `docs/design-landing-page.md`

### 8. 数据库完整 Schema ✅
- 核心表: `certifications`, `categories`, `questions`, `options`
- 翻译表: `certification_translations`, `category_translations`, `question_translations`, `option_translations`
- 业务表: `user_attempts`（`user_subscriptions` 已存在）
- 管理表: `admin_users`, `audit_logs`, `site_content`, `stripe_events`
- RLS 策略 + 索引 + 触发器
- 种子数据: AWS SAA 认证 + 3 分类 + 3 道示例题目

### 9. Dashboard 仪表盘页面 ✅
- 统计概览卡片 (总答题数、正确率、错题数)
- 认证卡片列表 (继续练习 / 开始练习)
- 分类正确率柱状图
- 最近活动
- 快捷操作

### 10. Practice 练习页面 ✅
- 数据层接入 Supabase (certifications, practice, questions)
- 认证列表从数据库获取
- 练习入口页 + 答题界面
- 提交答案 API 接入 Supabase (user_attempts)

---

## 待实施

### 11. Practice 练习页面（增强） ✅
- 答题界面 (单选 / 多选)
- 题目导航 (上一题 / 下一题 / 跳转)
- 答题状态管理 (未答 / 已答 / 标记)
- 题目内容多语言切换
- 进度条显示
- 设计文档: `docs/design-practice.md`

### 13. Explanation 解析功能 ✅
- 提交答案后显示详细解析
- 正确/错误选项分析
- 解析内容多语言支持
- 设计文档: `docs/design-explanation.md`

### 14. Wrong Answers 错题本 ✅
- 自动收集错题记录
- 按认证 / 分类筛选
- 重做单题 / 批量重做
- 设计文档: `docs/design-wrong-answers.md`

### 15. Search 搜索功能 ✅（含关键词高亮）
- 题目关键词搜索
- 认证浏览 / 筛选
- 搜索结果高亮
- 设计文档: `docs/design-search.md`

### 16. Settings 设置页面 ✅
- 个人资料编辑 (Display Name, Avatar)
- 语言偏好 (UI Language, Question Language)
- 订阅管理入口

### 17. Stripe 支付集成 ⏭️ 跳过
- Checkout 流程 (Monthly / Yearly / Single Cert)
- Webhook 处理 (订阅状态同步)
- 免费题目限制逻辑
- 设计文档: `docs/design-profit-model.md`

### 18. SEO + 性能优化 ✅
- Meta tags / Open Graph / Structured Data
- 静态页面预渲染
- 设计文档: `docs/design-seo.md`

---

## 建议下一步优先级

| 优先级 | 任务 | 理由 |
|--------|------|------|
| 🟠 P1 | Explanation 解析 (#12) | 与 Practice 紧密关联 |
| 🟠 P1 | Wrong Answers 错题本 (#13) | 与 Practice 紧密关联 |
| 🟡 P2 | Search 搜索 (#14) | 辅助功能 |
| 🟡 P2 | Settings 设置 (#15) | 辅助功能 |
| 🟡 P2 | Stripe 支付 (#16) | 可后期集成 |
| ⚪ P3 | SEO (#17) | 上线前完善 |

---

## 技术栈

| 项目 | 版本 |
|------|------|
| Next.js (App Router + Turbopack) | 16.1.x |
| React | 19.x |
| TypeScript | 5.9.x |
| Tailwind CSS | 4.x |
| Shadcn/UI (Base UI) | latest |
| next-intl | 4.8.x |
| @supabase/supabase-js | 2.99.x |
| @supabase/ssr | latest |
| Framer Motion (motion/react) | 12.x |
| JetBrains Mono | Google Fonts |
