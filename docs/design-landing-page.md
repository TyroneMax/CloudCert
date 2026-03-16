# Landing Page 详细设计

> 关联总纲：[Cursor.md](../Cursor.md) | 路由：`/`

## 概述

Landing Page 是用户访问 CloudCert 的第一个页面，采用现代商业网站风格，目标是传达产品价值、引导用户注册并开始使用。页面不需要登录即可访问。

## 页面结构

```
┌─────────────────────────────────────┐
│           Navigation Bar            │
│  Logo | Features | Pricing | FAQ    │
│                    | Language | Login│
├─────────────────────────────────────┤
│           Hero Section              │
│  标题 + 副标题 + CTA 按钮           │
│  背景：认证相关的插图/动画           │
├─────────────────────────────────────┤
│        Supported Certifications     │
│  AWS / Azure / GCP 认证图标展示      │
│  （第一阶段仅 AWS 可用，其他标记 Coming Soon）│
├─────────────────────────────────────┤
│         Features Section            │
│  3~4 个核心功能卡片展示              │
├─────────────────────────────────────┤
│         How It Works                │
│  3 步流程说明                       │
├─────────────────────────────────────┤
│         Pricing Section             │
│  Free / Pro 方案对比                │
├─────────────────────────────────────┤
│        Testimonials                 │
│  用户评价轮播                       │
├─────────────────────────────────────┤
│           FAQ Section               │
│  常见问题折叠面板                    │
├─────────────────────────────────────┤
│        CTA Section                  │
│  最终引导注册                       │
├─────────────────────────────────────┤
│            Footer                   │
│  链接 | 社交媒体 | 版权信息          │
└─────────────────────────────────────┘
```

## 各模块详细设计

### 1. Navigation Bar

- **左侧**：Logo + 产品名称 "CloudCert"
- **中部**：锚点导航链接（Features、Pricing、FAQ）
- **右侧**：语言切换下拉菜单 + Login / Sign Up 按钮
- **行为**：滚动时固定在顶部（sticky），背景模糊效果
- **移动端**：汉堡菜单

### 2. Hero Section

- **主标题**："Pass Your Cloud Certification with Confidence"（多语言）
- **副标题**：简短描述产品价值（一句话概括）
- **CTA 区域**：
  - 主要：Waitlist 邮箱收集表单（上线前）/ "Start Practicing Free" 按钮（上线后）
  - 次按钮："View Certifications"（滚动到认证区域）
- **视觉**：右侧或背景放置认证相关的插图/3D 元素
- **语言选择提示**：首次访问用户弹出语言偏好选择（存入 localStorage，登录后同步到 user_preferences）

### 3. Supported Certifications

- 横向滚动或网格展示各云厂商认证图标
- AWS 认证标记为 "Available"，Azure / GCP 标记为 "Coming Soon"
- 点击可用认证跳转到 `/certifications` 页面

### 4. Features Section

展示 3~4 个核心功能卡片：

| 功能 | 图标 | 描述 |
|------|------|------|
| 多语言题库 | 🌐 | 支持多语言切换，用你熟悉的语言理解题目 |
| 详细解析 | 📖 | 每道题提供详细解析，理解为什么对、为什么错 |
| 错题本 | 📝 | 自动记录错题，针对性复习薄弱环节 |
| 进度追踪 | 📊 | 实时查看练习进度和正确率统计 |

### 5. How It Works

三步流程：

1. **选择认证** — 选择你要准备的云认证考试
2. **开始练习** — 按顺序或分类进行题目练习，查看详细解析
3. **通过考试** — 复习错题，掌握所有知识点，自信上考场

### 6. Pricing Section

| | Free | Pro |
|---|------|-----|
| 每个认证免费题目 | 10~20 道 | 全部题目 |
| 题目详解 | ✅ | ✅ |
| 错题本 | ✅ | ✅ |
| 进度追踪 | ✅ | ✅ |
| 全部认证题库 | ❌ | ✅ |
| 价格 | $0 | $X/月 或 $Y/年 |
| 单独购买 | — | $Z / 单个认证 |

### 7. Testimonials

- 用户评价卡片轮播（头像 + 姓名 + 认证名称 + 评价内容）
- 初期可使用占位内容，后续替换为真实评价

### 8. FAQ Section

使用折叠面板（Accordion）展示常见问题：

- CloudCert 适合哪些人？
- 免费版包含哪些内容？
- 题库内容来源是什么？
- 支持哪些语言？
- 如何解锁更多题库？
- 题库会定期更新吗？

### 9. Waitlist（候补名单）

在产品正式上线前，Hero Section 和 CTA Section 的主 CTA 按钮替换为 Waitlist 邮箱收集表单：

- **组件**：`WaitlistForm`（`src/components/landing/waitlist-form.tsx`）
- **表单**：邮箱输入框 + "Join the Waitlist" 按钮
- **状态**：idle → loading → success / duplicate / error
- **成功反馈**：带动画的绿色提示 "You're on the list!"
- **重复提交**：友好提示 "You've already joined"
- **双变体**：`hero`（浅色背景）和 `cta`（深色背景，白色输入框样式）
- **数据库**：`public.waitlist` 表（email unique, locale, source, created_at）
- **RLS**：仅允许匿名 INSERT，禁止 SELECT/UPDATE/DELETE

> 产品正式上线后，将 WaitlistForm 替换回注册按钮。

### 10. Final CTA Section

- 大标题："Ready to Get Certified?"
- Waitlist 邮箱表单（CTA 变体，白色输入框风格）
- 简短的信任标语（如 "No credit card required"）

### 10. Footer

- **链接**：About、Privacy Policy、Terms of Service、Contact
- **产品**：Features、Pricing、Roadmap
- **社交**：Twitter/X、GitHub（如适用）
- **版权**：© 2026 CloudCert. All rights reserved.

## 响应式设计

| 断点 | 布局调整 |
|------|---------|
| Desktop (≥1024px) | 标准多列布局 |
| Tablet (768-1023px) | 两列降为单列，间距缩小 |
| Mobile (<768px) | 单列布局，汉堡菜单，CTA 按钮全宽 |

## 技术实现要点

- Next.js 16 App Router 的 Server Component 渲染，SEO 友好
- Tailwind CSS 4 实现响应式布局
- Framer Motion 12 (`motion/react`) 实现页面动效与交互动画
- 图片使用 Next.js `<Image>` 组件优化加载
- FAQ 使用 Shadcn/UI 的 Accordion 组件（与管理后台统一组件库，底层基于 Radix UI）
