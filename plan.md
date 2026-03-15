# 实施计划：i18n 国际化 + 认证系统

## 目标

1. 集成 next-intl 实现 UI 国际化（EN + ZH），重构路由为 `/[locale]/...` 结构
2. 集成 Supabase Auth 实现 Google OAuth + Email/Password 登录注册
3. 实现受保护路由中间件

## 技术栈

| 项目 | 版本 |
|------|------|
| next-intl | 4.x |
| @supabase/supabase-js | latest |
| @supabase/ssr | latest |

## 实施步骤

### Phase 1: i18n 国际化

1. **安装 next-intl**
2. **创建 i18n 配置**
   - `src/i18n/routing.ts` — 路由配置（locales: en/zh, defaultLocale: en）
   - `src/i18n/request.ts` — next-intl server 配置
3. **创建翻译文件**
   - `src/messages/en.json` — 英文翻译（Landing Page 所有文案）
   - `src/messages/zh.json` — 中文翻译
4. **重构路由结构**
   - 将 `src/app/` 下所有页面移至 `src/app/[locale]/`
   - 更新 root layout → locale layout
5. **配置 Middleware**
   - 语言检测 + 重定向
6. **更新 Landing Page 组件**
   - 将硬编码文案替换为 `useTranslations()` 调用
7. **语言切换器组件**
   - Navbar 添加语言切换下拉菜单

### Phase 2: Supabase Auth 认证

8. **安装 Supabase 依赖**
   - `@supabase/supabase-js` + `@supabase/ssr`
9. **创建 Supabase 客户端**
   - `src/lib/supabase/client.ts` — 浏览器端客户端
   - `src/lib/supabase/server.ts` — 服务端客户端
10. **实现登录页** (`/[locale]/auth/login`)
    - Google OAuth 按钮
    - Email/Password 表单
    - 表单验证
11. **实现注册页** (`/[locale]/auth/register`)
    - Google OAuth 按钮
    - Display Name + Email + Password + Confirm Password
    - 注册后邮箱验证提示
12. **Auth 回调处理**
    - `/auth/callback` route — OAuth 回调
13. **更新 Middleware**
    - 合并 i18n + Auth Session 检查
    - 受保护路由重定向
14. **更新 Navbar**
    - 已登录：显示用户头像 + 下拉菜单
    - 未登录：Login / Sign Up 按钮

## 受影响文件

### 新增
- `src/i18n/routing.ts`
- `src/i18n/request.ts`
- `src/messages/en.json`
- `src/messages/zh.json`
- `src/middleware.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/auth/callback/route.ts`
- `.env.local` (Supabase keys)

### 修改
- 所有 `src/app/` 下的页面 → 移至 `src/app/[locale]/`
- Landing Page 组件 → 文案国际化
- Navbar → 语言切换 + Auth 状态

### 删除
- `src/app/layout.tsx`（替换为 `src/app/[locale]/layout.tsx`）

## 风险 / 权衡

| 风险 | 应对 |
|------|------|
| next-intl 4.x 与 Next.js 16 兼容性 | 使用 latest 版本，必要时降级 |
| Supabase 未配置项目 | 先创建代码结构 + `.env.local.example`，用户需自行创建 Supabase 项目 |
| 路由结构大变 | 一次性迁移所有路由到 `[locale]` 下 |
