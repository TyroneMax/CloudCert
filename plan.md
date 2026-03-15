# 实施计划：应用骨架 + Landing Page

## 目标

搭建 CloudCert 项目的 Next.js 应用骨架，并实现完整的 Landing Page 页面。

## 技术栈（遵循 Cursor.md）

| 项目 | 版本 |
|------|------|
| Next.js (App Router) | 16.x |
| React | 19.x |
| TypeScript | 5.9.x |
| Tailwind CSS | 4.x |
| Shadcn/UI | latest |
| next-intl | 4.8.x |
| Framer Motion (motion/react) | 12.x |
| 字体 | Inter + JetBrains Mono (via next/font) |

## 实施步骤

### Phase 1: 项目初始化

1. **创建 Next.js 16 项目**
   - `npx create-next-app@latest` with TypeScript, Tailwind CSS 4, App Router
   - 确保使用 src/ 目录结构

2. **安装依赖**
   - `motion` (Framer Motion 12)
   - `next-intl`（暂仅配置 en，预留 i18n 结构）
   - Shadcn/UI 初始化 + 需要的组件（Accordion, Button）

3. **配置 Design Tokens**
   - 在 Tailwind/CSS 中配置 UX 标准文档中的颜色变量
   - 配置字体（Inter + JetBrains Mono）

### Phase 2: 应用骨架

4. **目录结构**
   ```
   src/
   ├── app/
   │   ├── layout.tsx          # Root Layout（字体、metadata）
   │   ├── page.tsx            # Landing Page
   │   ├── globals.css         # 全局样式 + Design Tokens
   │   ├── auth/
   │   │   ├── login/page.tsx  # 占位
   │   │   └── register/page.tsx # 占位
   │   ├── dashboard/page.tsx  # 占位
   │   ├── certifications/page.tsx # 占位
   │   ├── practice/[certId]/page.tsx # 占位
   │   ├── wrong-answers/page.tsx # 占位
   │   ├── search/page.tsx     # 占位
   │   ├── roadmap/page.tsx    # 占位
   │   └── settings/page.tsx   # 占位
   ├── components/
   │   ├── layout/
   │   │   ├── navbar.tsx      # 导航栏（Landing + 通用）
   │   │   └── footer.tsx      # 页脚
   │   └── landing/
   │       ├── hero-section.tsx
   │       ├── certifications-section.tsx
   │       ├── features-section.tsx
   │       ├── how-it-works-section.tsx
   │       ├── pricing-section.tsx
   │       ├── testimonials-section.tsx
   │       ├── faq-section.tsx
   │       └── cta-section.tsx
   └── lib/
       └── utils.ts            # 工具函数（cn 等）
   ```

### Phase 3: Landing Page 实现

5. **Navbar** — sticky 顶部导航，桌面水平链接 + 移动端汉堡菜单
6. **Hero Section** — 主标题 + 副标题 + 双 CTA 按钮 + 动画
7. **Supported Certifications** — AWS/Azure/GCP 图标网格，Coming Soon 标记
8. **Features Section** — 4 个核心功能卡片
9. **How It Works** — 3 步流程
10. **Pricing Section** — Free / Pro 对比表
11. **Testimonials** — 用户评价卡片（占位内容）
12. **FAQ Section** — Shadcn Accordion 折叠面板
13. **Final CTA** — 引导注册
14. **Footer** — 链接、版权信息

### Phase 4: UX 标准

15. **响应式** — Mobile / Tablet / Desktop 三断点适配
16. **动画** — Framer Motion 页面进入动画、Hover 效果
17. **无障碍** — 语义化 HTML、aria-label、键盘导航
18. **prefers-reduced-motion** — 尊重用户动画偏好

## 受影响文件

- 新增：整个 Next.js 项目文件结构
- 不变：`docs/` 目录、`Cursor.md`、`.cursor/` 配置

## 风险 / 权衡

| 风险 | 应对 |
|------|------|
| Next.js 16 可能尚未稳定发布 | 使用 latest 稳定版（15.x），后续可升级 |
| Tailwind CSS 4 配置方式与 v3 不同 | 使用 CSS-first 配置方式 |
| next-intl 暂只配置 en | 预留 i18n 目录结构，后续扩展 |
| 图片资源暂无 | 使用 SVG 图标 + emoji 占位，后续替换 |
