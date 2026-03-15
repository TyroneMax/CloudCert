# Roadmap 页面详细设计

> 关联总纲：[Cursor.md](../Cursor.md) | 路由：`/roadmap`

## 概述

Roadmap 页面向用户展示 CloudCert 的产品发展规划，增强用户信任感并收集反馈。页面无需登录即可访问。

## 页面设计

```
┌─────────────────────────────────────────────────┐
│  Navigation Bar                                  │
│─────────────────────────────────────────────────│
│                                                 │
│  🗺️ Product Roadmap                             │
│  See what's coming next for CloudCert           │
│                                                 │
│─── Phase 1: Foundation (Current) ───────────────│
│  Status: 🟢 In Progress                        │
│                                                 │
│  ✅ AWS Certification Question Bank             │
│  ✅ Web Application                             │
│  ✅ Google + Email Authentication               │
│  ✅ Multi-language Support (EN + ZH)            │
│  ✅ Question Explanations                       │
│  ✅ Wrong Answer Review                         │
│  ✅ Search (Questions + Certifications)         │
│  ✅ Practice Progress Tracking                  │
│  ✅ Freemium Model                              │
│                                                 │
│─── Phase 2: UX Enhancement ───────────────────│
│  Status: 🟡 Planned                            │
│                                                 │
│  📋 Exam Simulation Mode (Timed Mock Exams)     │
│  📋 Bookmark / Favorites                        │
│  📋 Dark Mode                                   │
│  📋 Spaced Repetition (Anki-style Algorithm)    │
│  📋 More AWS Certifications (SAP, DVA, etc.)    │
│  📋 Performance & UX Optimization               │
│                                                 │
│─── Phase 3: Platform Expansion ────────────────│
│  Status: 🔵 Future                             │
│                                                 │
│  📋 Azure Certification Question Banks          │
│  📋 GCP Certification Question Banks            │
│  📋 Apple Sign-In                               │
│  📋 iOS Mobile App (React Native)               │
│  📋 Community Features                          │
│  📋 AI-Powered Explanations                     │
│  📋 More Certification Providers                │
│                                                 │
│─────────────────────────────────────────────────│
│                                                 │
│  💬 Have a feature request?                     │
│  [Submit Feedback]                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 模块说明

### 阶段时间线

| 阶段 | 状态 | 关键交付物 |
|------|------|-----------|
| Phase 1: Foundation | 🟢 当前 | AWS SAA 题库、Web 应用、基础功能全套 |
| Phase 2: UX Enhancement | 🟡 已规划 | 模拟考试、收藏夹、深色模式、间隔重复、UX 优化 |
| Phase 3: Platform Expansion | 🔵 未来 | Azure/GCP 题库、iOS App、社区、AI、Apple 登录 |

### 各阶段详细内容

#### Phase 1: Foundation（第一阶段）

| 功能 | 说明 | 状态 |
|------|------|------|
| AWS 认证题库 | AWS SAA 等题库上线 | ✅ |
| Web 应用 | Next.js 16 + Vercel 部署 | ✅ |
| Google + Email 登录 | Supabase Auth | ✅ |
| 多语言支持 | 英文 + 中文（UI + 题目内容） | ✅ |
| 题目详解 | 每题详细解析（为什么对/错） | ✅ |
| 错题本 | 自动收集错题，支持重做 | ✅ |
| 搜索功能 | 题目和认证搜索 | ✅ |
| 进度追踪 | 仪表盘展示学习进度 | ✅ |
| Freemium 模式 | 10~20 免费题 + 付费解锁 | ✅ |

#### Phase 2: UX Enhancement（第二阶段 — 聚焦用户体验）

| 功能 | 说明 | 状态 |
|------|------|------|
| 模拟考试模式 | 限时模拟真实考试环境（如 65 题 / 130 分钟），含成绩报告和通过/未通过判定 | 📋 Planned |
| 收藏夹 | 用户主动标记重点题目，独立于错题本，方便复习 | 📋 Planned |
| 深色模式 | Dark Mode 支持，适合长时间学习和夜间使用 | 📋 Planned |
| 间隔重复复习 | 类似 Anki 的科学记忆算法，根据掌握程度自动安排复习计划 | 📋 Planned |
| 更多 AWS 认证 | 扩充 AWS 认证题库（SAP、DVA、SOA、ANS 等） | 📋 Planned |
| 性能与 UX 优化 | 页面加载速度优化、交互动画打磨、无障碍访问（a11y）改进 | 📋 Planned |

#### Phase 3: Platform Expansion（第三阶段 — 平台扩展）

| 功能 | 说明 | 状态 |
|------|------|------|
| Azure 认证题库 | AZ-900、AZ-104 等 | 📋 Future |
| GCP 认证题库 | ACE、PCA 等 | 📋 Future |
| Apple 登录 | iOS App Store 要求 | 📋 Future |
| iOS App | React Native 原生应用 | 📋 Future |
| 社区功能 | 用户讨论、题目评论 | 📋 Future |
| AI 辅助解析 | AI 生成个性化解析和学习建议 | 📋 Future |
| 更多认证 | Kubernetes (CKA)、HashiCorp 等 | 📋 Future |

### 反馈入口

- 页面底部 "Submit Feedback" 按钮
- 跳转到 Google Form / Typeform 或站内反馈表单
- 收集用户最期待的功能

## 数据驱动（可选）

Roadmap 内容可以：
- **静态方式**：直接写在页面组件中，更新时修改代码
- **动态方式**：通过管理后台的 `site_content` 表管理，实现无代码更新

建议第一阶段使用静态方式，后续迁移到动态管理。

## 技术实现要点

- 使用 Server Component 渲染，SEO 友好
- 时间线布局使用 Tailwind CSS 实现
- 各阶段使用颜色和图标区分状态
- 支持 next-intl 多语言
- 响应式：Desktop 水平时间线，Mobile 垂直时间线

## 响应式设计

| 断点 | 布局调整 |
|------|---------|
| Desktop (≥1024px) | 水平或垂直时间线，卡片并排展示 |
| Mobile (<768px) | 垂直时间线，全宽卡片 |
