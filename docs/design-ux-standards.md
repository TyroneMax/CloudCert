# UX 设计标准

> 关联总纲：[Cursor.md](../Cursor.md) | 贯穿所有页面和组件

## 概述

本文档定义 CloudCert 的统一 UX 设计标准，包括 Design Tokens、组件规范、交互模式、无障碍访问和响应式规范。所有页面和组件必须遵循这些标准，确保一致的用户体验。

---

## 1. Design System / Design Tokens

### 1.1 颜色系统

基于 Tailwind CSS 4 自定义主题，使用 CSS 变量实现 Light / Dark Mode 切换。

#### 品牌色

| Token | Light Mode | 用途 |
|-------|-----------|------|
| `--color-primary` | `#2563EB` (Blue 600) | 主按钮、链接、当前状态高亮 |
| `--color-primary-hover` | `#1D4ED8` (Blue 700) | 主按钮 Hover |
| `--color-primary-light` | `#DBEAFE` (Blue 100) | 主色浅底背景 |

#### 语义色

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-success` | `#16A34A` (Green 600) | 正确答案、成功操作 |
| `--color-success-light` | `#DCFCE7` (Green 100) | 正确答案背景 |
| `--color-error` | `#DC2626` (Red 600) | 错误答案、错误提示 |
| `--color-error-light` | `#FEE2E2` (Red 100) | 错误答案背景 |
| `--color-warning` | `#D97706` (Amber 600) | 警告提示 |
| `--color-warning-light` | `#FEF3C7` (Amber 100) | 警告背景 |
| `--color-info` | `#2563EB` (Blue 600) | 信息提示 |

#### 中性色

| Token | Light Mode | 用途 |
|-------|-----------|------|
| `--color-bg` | `#FFFFFF` | 页面背景 |
| `--color-bg-secondary` | `#F9FAFB` (Gray 50) | 卡片/区块背景 |
| `--color-bg-tertiary` | `#F3F4F6` (Gray 100) | 输入框背景、Hover 状态 |
| `--color-border` | `#E5E7EB` (Gray 200) | 边框、分割线 |
| `--color-text-primary` | `#111827` (Gray 900) | 主要文本 |
| `--color-text-secondary` | `#6B7280` (Gray 500) | 次要文本、标签 |
| `--color-text-tertiary` | `#9CA3AF` (Gray 400) | 占位符、禁用文本 |

#### 答题专用色

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-correct` | `#16A34A` | 正确选项边框/图标 |
| `--color-correct-bg` | `#F0FDF4` | 正确选项背景 |
| `--color-wrong` | `#DC2626` | 错误选项边框/图标 |
| `--color-wrong-bg` | `#FEF2F2` | 错误选项背景 |
| `--color-current` | `#2563EB` | 当前题目高亮（答题卡片） |
| `--color-locked` | `#9CA3AF` | 锁定/付费题目 |

### 1.2 字体

使用 `next/font/google` 加载，自动自托管优化。

| 用途 | 字体 | 回退 |
|------|------|------|
| 正文 & UI | Inter | system-ui, sans-serif |
| 代码 | JetBrains Mono | monospace |

#### 字号梯度

| Token | 大小 | 行高 | 用途 |
|-------|------|------|------|
| `text-xs` | 12px | 16px | 标签、徽章 |
| `text-sm` | 14px | 20px | 辅助文本、表格内容 |
| `text-base` | 16px | 24px | 正文（默认） |
| `text-lg` | 18px | 28px | 小标题 |
| `text-xl` | 20px | 28px | 卡片标题 |
| `text-2xl` | 24px | 32px | 页面区块标题 (h2) |
| `text-3xl` | 30px | 36px | 页面标题 (h1) |
| `text-4xl` | 36px | 40px | Landing Page 标题 |
| `text-5xl` | 48px | 48px | Hero 主标题 |

#### 字重

| Token | 值 | 用途 |
|-------|-----|------|
| `font-normal` | 400 | 正文 |
| `font-medium` | 500 | 按钮文本、导航项 |
| `font-semibold` | 600 | 小标题、卡片标题 |
| `font-bold` | 700 | 页面标题、Hero 标题 |

### 1.3 间距系统

使用 Tailwind 4 的 4px 基础间距单位：

| Token | 值 | 常见用途 |
|-------|-----|---------|
| `spacing-1` | 4px | 图标与文本间距 |
| `spacing-2` | 8px | 紧凑元素间距 |
| `spacing-3` | 12px | 按钮内边距（垂直） |
| `spacing-4` | 16px | 表单项间距、卡片内边距 |
| `spacing-6` | 24px | 区块间距 |
| `spacing-8` | 32px | 页面区块间距 |
| `spacing-12` | 48px | Landing Page 区块间距 |
| `spacing-16` | 64px | 大区块间距 |
| `spacing-20` | 80px | Hero Section 上下间距 |

### 1.4 圆角

| Token | 值 | 用途 |
|-------|-----|------|
| `rounded-sm` | 4px | 小元素（标签、徽章） |
| `rounded` | 6px | 输入框、小按钮 |
| `rounded-md` | 8px | 按钮、下拉框 |
| `rounded-lg` | 12px | 卡片 |
| `rounded-xl` | 16px | 大卡片、Modal |
| `rounded-full` | 9999px | 头像、Pill 标签 |

### 1.5 阴影

| Token | 值 | 用途 |
|-------|-----|------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 按钮、输入框 |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | 卡片 |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | 下拉菜单、弹出层 |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modal、Popover |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1)` | 大弹窗 |

### 1.6 动画

使用 Framer Motion 12 (`motion/react`) 统一动画规范：

| 类型 | Duration | Easing | 用途 |
|------|----------|--------|------|
| 快速反馈 | 150ms | `ease-out` | 按钮 Hover、Toggle |
| 标准过渡 | 200ms | `ease-in-out` | 页面切换、展开折叠 |
| 强调动画 | 300ms | `spring(stiffness: 300, damping: 24)` | 答案反馈弹入、卡片进入 |
| 页面进入 | 400ms | `spring(stiffness: 200, damping: 20)` | 页面内容淡入 |

---

## 2. 组件规范

### 2.1 按钮 (Button)

| 变体 | 样式 | 用途 |
|------|------|------|
| Primary | 蓝色实心底 + 白色文字 | 主要操作（Submit、Sign Up、Start Practice） |
| Secondary | 白色底 + 蓝色边框 + 蓝色文字 | 次要操作（Cancel、View Detail） |
| Ghost | 透明底 + 蓝色文字 | 三级操作（链接式按钮） |
| Danger | 红色实心底 + 白色文字 | 危险操作（Delete、Ban） |
| Disabled | 灰色底 + 灰色文字 | 不可用状态 |

**尺寸：**

| Size | 高度 | 字号 | Padding |
|------|------|------|---------|
| `sm` | 32px | 14px | 12px 16px |
| `md` | 40px | 16px | 12px 20px |
| `lg` | 48px | 18px | 16px 24px |

**规则：**
- 按钮文案使用动词开头（"Start Practice"、"Submit Answer"）
- Loading 状态显示 Spinner + "Loading..." 文案
- 禁用状态使用 `cursor-not-allowed` + 降低透明度

### 2.2 输入框 (Input)

- 高度 40px（md）/ 48px（lg）
- 边框 `--color-border`，Focus 时蓝色边框 + 外发光
- 错误状态红色边框 + 底部红色错误提示文本
- Label 在输入框上方，必填项标注 `*`
- Placeholder 使用 `--color-text-tertiary`

### 2.3 卡片 (Card)

- 白色背景 + `rounded-lg` (12px) + `shadow`
- 内边距 `spacing-6` (24px)
- Hover 状态：`shadow-md` + 微上移 `translateY(-2px)`
- 可点击卡片使用 `cursor-pointer`

### 2.4 Modal / Dialog

- 居中显示，最大宽度 480px（小）/ 640px（中）/ 800px（大）
- 背景遮罩 `rgba(0,0,0,0.5)` + 模糊效果
- `rounded-xl` (16px) + `shadow-xl`
- 右上角关闭按钮 + ESC 关闭 + 点击遮罩关闭
- 进入/退出使用 Framer Motion `AnimatePresence`

### 2.5 Toast / Notification

- 右上角弹出，堆叠显示
- 4 种类型：Success (绿)、Error (红)、Warning (黄)、Info (蓝)
- 自动消失（5 秒）+ 手动关闭按钮
- 使用 Framer Motion 滑入/滑出动画

### 2.6 Skeleton Loading

- 页面加载时显示内容区域的骨架屏
- 使用 `--color-bg-tertiary` 背景 + 闪烁动画
- 骨架形状模拟实际内容布局（圆形头像、长条文本、矩形卡片）

---

## 3. 交互规范

### 3.1 加载状态

| 场景 | 处理方式 |
|------|---------|
| 页面首次加载 | Skeleton 骨架屏 |
| 数据刷新 | 顶部线性进度条（不阻塞内容） |
| 按钮操作 | 按钮内 Spinner + 禁用状态 |
| 列表加载更多 | 底部 Spinner + "Loading..." |
| 图片加载 | `next/image` blur placeholder |

### 3.2 错误处理

| 场景 | 处理方式 |
|------|---------|
| 网络错误 | Toast 提示 "Connection error, please try again" + 重试按钮 |
| 表单验证 | 实时验证 + 字段底部红色错误提示 |
| 404 页面 | 友好的 404 页面（插图 + 返回首页按钮） |
| 500 服务器错误 | 友好的错误页面 + "Report Issue" 按钮 |
| API 错误 | Toast 提示具体错误信息 |

### 3.3 空状态

每个列表/内容区域都必须设计空状态：

| 场景 | 空状态内容 |
|------|-----------|
| 错题本无错题 | 插图 + "No wrong answers yet. Keep it up!" |
| 搜索无结果 | 插图 + "No results found" + 搜索建议 |
| 仪表盘无数据 | 插图 + "Start your first practice!" + CTA 按钮 |
| 认证列表无可用 | "Coming soon" 提示 |

### 3.4 确认操作

危险操作必须二次确认：

- 删除账户 → Confirm Dialog + 输入 "DELETE" 确认
- 管理后台删除题目 → Confirm Dialog
- 退款操作 → Confirm Dialog + 原因选择

### 3.5 反馈模式

| 操作 | 反馈 |
|------|------|
| 答题提交 | 选项立即变色（绿/红）+ ✅/❌ 图标弹入动画 |
| 保存成功 | Toast "Saved successfully" |
| 复制成功 | Toast "Copied to clipboard" |
| 语言切换 | 内容平滑过渡（淡入淡出） |
| 购买成功 | 成功页面 + confetti 动画 |

### 3.6 滚动行为

- 页面切换时滚动到顶部
- 锚点导航使用 `scroll-behavior: smooth`
- 答题页面切题时平滑滚动到题目顶部
- 长列表使用虚拟滚动（如答题卡片 > 200 题时）

---

## 4. 无障碍访问 (Accessibility / a11y)

### 4.1 键盘导航

| 键 | 行为 |
|-----|------|
| `Tab` | 焦点在可交互元素间移动，遵循 DOM 顺序 |
| `Shift + Tab` | 反向移动焦点 |
| `Enter / Space` | 激活按钮、选中选项 |
| `Escape` | 关闭 Modal、Popover、下拉菜单 |
| `Arrow Keys` | 在选项列表、下拉菜单中移动 |

**规则：**
- 所有可交互元素必须可通过键盘访问
- 焦点样式清晰可见（蓝色外发光 ring，不可隐藏）
- Modal 打开时 Focus Trap（焦点锁定在 Modal 内）
- Skip to content 链接（页面顶部）

### 4.2 屏幕阅读器

- 所有图片有 `alt` 属性（装饰性图片使用 `alt=""`）
- 表单字段有关联的 `<label>`
- 图标按钮有 `aria-label`（如 `aria-label="Close"`, `aria-label="Switch language"`）
- 动态内容更新使用 `aria-live` 通知（如答题结果）
- 答题卡片状态使用 `aria-label` 描述（如 `aria-label="Question 3, answered correctly"`）

### 4.3 颜色对比度

- 正文：对比度 ≥ 4.5:1（WCAG AA）
- 大文本（≥18px bold / ≥24px）：对比度 ≥ 3:1
- 不仅靠颜色传达信息（答题正确/错误同时使用颜色 + 图标 ✅/❌）

### 4.4 ARIA 标签示例

```html
<!-- 答题选项 -->
<div role="radiogroup" aria-labelledby="question-title">
  <label>
    <input type="radio" name="answer" value="a" aria-describedby="option-a-text" />
    <span id="option-a-text">A. Amazon S3</span>
  </label>
</div>

<!-- 答题卡片中的题号 -->
<button
  aria-label="Question 5, answered correctly"
  aria-current={isCurrent ? 'true' : undefined}
>
  5
</button>

<!-- 答案反馈 -->
<div role="alert" aria-live="assertive">
  Correct! The answer is B. Amazon EC2.
</div>
```

### 4.5 运动偏好

尊重用户的 `prefers-reduced-motion` 设置：

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. 响应式规范

### 5.1 断点系统

| 断点 | 宽度 | 对应设备 | Tailwind Class |
|------|------|---------|---------------|
| Mobile | < 640px | 手机竖屏 | 默认 |
| Mobile L | 640px - 767px | 手机横屏/大屏手机 | `sm:` |
| Tablet | 768px - 1023px | iPad 竖屏 | `md:` |
| Desktop | 1024px - 1279px | 笔记本 | `lg:` |
| Desktop L | ≥ 1280px | 外接显示器 | `xl:` |

### 5.2 布局网格

- 最大内容宽度：`max-w-7xl` (1280px)
- 水平内边距：Mobile `px-4` (16px) / Desktop `px-8` (32px)
- 栏间距：`gap-6` (24px) / `gap-8` (32px)

### 5.3 触控区域

- 最小触控区域：44x44px（WCAG 2.5.5）
- Mobile 上的按钮、选项卡片、链接均需满足
- 相邻可点击元素间距 ≥ 8px

### 5.4 响应式行为汇总

| 元素 | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| 导航栏 | 汉堡菜单 | 汉堡菜单 | 水平导航 |
| Landing 卡片 | 单列 | 两列 | 三/四列 |
| 答题界面 | 单栏 + Sheet 卡片 | 单栏 + Drawer 卡片 | 双栏（题目 + 卡片） |
| 认证列表 | 单列卡片 | 两列 | 三列 |
| 错题列表 | 全宽卡片 | 全宽卡片 | 最大宽度 900px |
| 统计图表 | 水平滚动 | 自适应 | 自适应 |
| Modal | 全屏 Sheet | 居中 Modal | 居中 Modal |
| 表格（Admin） | 水平滚动 | 自适应 | 自适应 |

---

## 6. Web PC vs Web Mobile 平台差异规范

> iOS 原生 App 在路线图第三阶段，届时另建独立平台规范文档。

### 6.1 交互模式差异

| 行为 | Web PC (>=1024px) | Web Mobile (<1024px) |
|------|-------------------|---------------------|
| 指针设备 | 鼠标（精确点击） | 手指触控（模糊点击） |
| Hover 状态 | 有，按钮/卡片/链接需设计 Hover 效果 | 无 Hover，使用 `@media (hover: hover)` 限定 |
| 点击区域 | 可较小，最小 32x32px | 最小 44x44px，间距 ≥ 8px |
| 右键菜单 | 浏览器原生右键可用 | 无右键，长按触发系统菜单 |
| 滚动方式 | 鼠标滚轮 / 触控板 | 手指滑动，支持惯性滚动 |
| 文本选中 | 支持鼠标选中文本 | 长按选中，需测试不影响答题选项点击 |
| 键盘快捷键 | 支持（如 Cmd+K 搜索） | 不支持快捷键 |

### 6.2 Hover 状态规范

PC 端 Hover 效果仅在支持 hover 的设备上生效：

```css
@media (hover: hover) {
  .card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .button-primary:hover {
    background-color: var(--color-primary-hover);
  }

  .nav-link:hover {
    color: var(--color-primary);
  }
}
```

Mobile 端不依赖 Hover 传达信息，Active/Press 状态替代：

```css
.card:active {
  transform: scale(0.98);
  opacity: 0.9;
}
```

### 6.3 导航差异

| 元素 | Web PC | Web Mobile |
|------|--------|-----------|
| 主导航 | 水平导航栏，所有链接直接可见 | 汉堡菜单，点击展开全屏/半屏侧边栏 |
| 搜索入口 | 导航栏内搜索框 + `Cmd/Ctrl+K` 快捷键 | 导航栏搜索图标，点击展开全宽搜索框 |
| 用户菜单 | 头像下拉菜单（Hover 或 Click） | 汉堡菜单内用户信息区域 |
| 面包屑 | 始终显示 | 隐藏面包屑，使用 "← Back" 返回按钮 |
| 底部栏 | 无 | 可选：固定底部 Tab Bar（Dashboard / Practice / Wrong / Settings） |

### 6.4 弹出层差异

| 组件 | Web PC | Web Mobile |
|------|--------|-----------|
| Modal | 居中弹窗，max-width 480-800px，背景遮罩 | 从底部滑出的全屏/半屏 Sheet |
| 下拉选择 | 自定义 Dropdown Popover | 使用原生 `<select>` 或底部 Sheet 选择器 |
| 确认框 | 居中小型 Dialog | 底部 Sheet 或全屏 Dialog |
| 答题卡片 | 右侧固定面板（双栏布局） | 底部滑出 Sheet（点击按钮触发） |
| 筛选面板 | 内联展开或 Popover | 全屏筛选 Sheet + "Apply" 按钮 |

### 6.5 表单输入差异

| 行为 | Web PC | Web Mobile |
|------|--------|-----------|
| 输入框聚焦 | 光标定位，键盘输入 | 弹出虚拟键盘，页面自动滚动避免键盘遮挡 |
| 输入类型 | 标准键盘 | 使用正确的 `inputMode`（`email`、`numeric`）触发对应键盘 |
| 密码输入 | 键盘输入 + 显示/隐藏切换 | 同左 + 确保虚拟键盘不遮挡提交按钮 |
| 搜索输入 | 实时搜索（debounce） | 同左，但 Enter 键触发搜索并收起键盘 |
| 表单提交 | 按钮在可视区域内 | 提交按钮使用 `position: sticky` 固定在底部，不被键盘遮挡 |

### 6.6 内容展示差异

| 内容 | Web PC | Web Mobile |
|------|--------|-----------|
| 长文本解析 | 直接展示，宽屏可读性好 | 注意行宽不超过 40-60 字符，适当增大行高 |
| 数据表格 | 标准表格布局 | 转为卡片列表或水平滚动表格 |
| 统计图表 | 自适应容器宽度 | 水平滚动或简化为数字 + 迷你图 |
| 代码块（解析中） | 水平滚动 + 语法高亮 | 同左，字号不缩小，保持 14px |
| 进度条 | 居中显示 | 全宽显示 |

### 6.7 手势支持（Mobile 专属）

| 手势 | 行为 | 页面 |
|------|------|------|
| 左右滑动 | 切换上一题/下一题 | 答题界面 |
| 下拉刷新 | 刷新页面数据 | Dashboard、错题本、认证列表 |
| 上滑收起 | 收起底部 Sheet | 答题卡片 Sheet |

### 6.8 PC 专属功能

| 功能 | 说明 |
|------|------|
| 键盘快捷键 | `Cmd/Ctrl + K` 打开搜索，`A/B/C/D` 快速选择选项，`Enter` 提交答案，`→` 下一题 |
| Tooltip | 鼠标悬停显示提示信息（如题号状态说明） |
| 右键菜单 | 不自定义，保持浏览器默认行为 |
| 多窗口 | 页面支持多窗口/多 Tab 同时打开 |

---

## 7. 设计检查清单

### 每个页面/组件上线前检查：

**通用：**

- [ ] 颜色使用 Design Token，非硬编码
- [ ] 字号/间距遵循梯度系统
- [ ] 按钮有 Hover / Active / Disabled / Loading 状态
- [ ] 列表有空状态设计
- [ ] API 请求有加载状态和错误处理
- [ ] 所有可交互元素支持键盘操作
- [ ] 图片有 `alt` 属性
- [ ] 图标按钮有 `aria-label`
- [ ] 颜色对比度达标（≥ 4.5:1）
- [ ] 信息传达不仅靠颜色（颜色 + 图标/文字）
- [ ] 三个断点下布局正确（Mobile / Tablet / Desktop）
- [ ] 动画尊重 `prefers-reduced-motion`
- [ ] Heading 层级正确（单一 h1，不跳级）

**Web PC 专项：**

- [ ] Hover 效果使用 `@media (hover: hover)` 包裹
- [ ] 键盘快捷键可用（搜索、答题选项）
- [ ] Tooltip 在 Hover 时正确显示
- [ ] 双栏布局在 1024px+ 正确展示

**Web Mobile 专项：**

- [ ] 触控区域 ≥ 44x44px
- [ ] 虚拟键盘弹出时不遮挡关键内容/按钮
- [ ] 手势操作流畅（滑动切题、下拉刷新）
- [ ] Modal 转为底部 Sheet
- [ ] 表单提交按钮固定在底部可见
- [ ] 输入框使用正确的 `inputMode`
