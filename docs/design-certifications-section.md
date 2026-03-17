# Certifications Section 详细设计

> 关联总纲：[Cursor.md](../Cursor.md) | Landing Page：[design-landing-page.md](design-landing-page.md) | 组件：`src/components/landing/certifications-section.tsx`

## 概述

Certifications Section 是 Landing Page 的「Supported Certifications」区块，用于展示 AWS、Azure、GCP 等云厂商认证，引导用户了解可用题库并跳转至 `/certifications` 页面。

## 设计目标

- 提升视觉吸引力和专业感
- 与 design-ux-standards 和 design-landing-page 保持一致
- 与 features、hero 等 landing 组件的视觉风格统一

## 视觉规范

### 云厂商 Logo

| 云厂商 | Logo 来源 | 品牌色 |
|--------|----------|--------|
| AWS | Simple Icons CDN (`amazonwebservices`) | #FF9900 |
| Azure | Simple Icons CDN (`microsoftazure`) | #0078D4 |
| GCP | @icons-pack/react-simple-icons `SiGooglecloud` | #4285F4 |

- 图标容器：`h-14 w-14`，`rounded-xl`，浅色背景（`bg-orange-50` / `bg-sky-50` / `bg-blue-50`）

### 卡片样式

- 背景：`bg-card` + `border border-border/60`
- 圆角：`rounded-xl`
- 内边距：`p-6`
- Hover（仅 PC，`@media (hover: hover)`）：`shadow-md` + `-translate-y-0.5`
- 可点击卡片：整体为 `Link`，整卡可点击跳转

### 徽章

| 状态 | 样式 | 图标 |
|------|------|------|
| Available | `bg-green-100 text-green-700` | Check |
| Coming Soon | `bg-muted text-muted-foreground` | Clock |

### 布局

- 标题区：`text-center`，与 features 一致
- 认证列表：`grid gap-8 md:grid-cols-3`
- 区块背景：`bg-background`（与 hero 渐变形成对比）

## 交互规范

- **Available 卡片**：整体可点击，跳转 `/{locale}/certifications`；Hover 时显示 "Browse certifications →" 及箭头图标
- **Coming Soon 卡片**：不可点击，`cursor-default`
- **焦点样式**：可点击卡片 `focus:ring-2 focus:ring-primary focus:ring-offset-2`
- **无障碍**：可点击卡片 `aria-label`，图标 `aria-hidden`

## 动画

- 进入动画：Framer Motion `spring(stiffness: 200, damping: 20)`
- 尊重 `prefers-reduced-motion`

## 技术实现

### 涉及文件

| 文件 | 说明 |
|------|------|
| `src/components/landing/certifications-section.tsx` | 主组件 |
| `src/components/icons/cloud-provider-logos.tsx` | 云厂商 Logo 组件 |

### Logo 组件

- AWS / Azure：通过 `https://cdn.simpleicons.org/{slug}/{hex}` 加载
- GCP：使用 `SiGooglecloud` 组件，传入品牌色

## 注意事项

- **商标**：使用官方 logo 时需注意商标使用合规
- **CDN**：若 Simple Icons CDN 加载慢，可考虑将 logo 下载至 `public/icons/` 本地引用
