# 登录与注册逻辑完善计划

> 目标：补全 design-auth.md 中定义但尚未实现的认证功能

## 现状分析

当前已有：
- 登录页：Google OAuth + Email/Password
- 注册页：Google OAuth + Email/Password + 邮箱验证提示
- OAuth 回调：`exchangeCodeForSession` 处理
- Middleware：受保护路由重定向到 `/auth/login?redirect=...`

## 待完成项

### 1. 登录页增强

| 项 | 说明 |
|----|------|
| Forgot Password 链接 | 当前 `href="#"`，需改为 `/auth/forgot-password` |
| 登录后重定向 | 读取 URL 中 `?redirect=` 参数，登录成功后跳转至该地址（而非固定 dashboard） |
| OAuth 重定向传递 | Google 登录时，将 `redirect` 参数传入 `redirectTo` 的 query，使 callback 能正确跳回 |

### 2. 注册页增强

| 项 | 说明 |
|----|------|
| 登录后重定向 | 同登录页，OAuth 和 Email 注册完成后需支持 redirect |
| 密码强度提示 | design-auth 要求「最少 8 位，含强度提示」— 可选实现简单强度条 |

### 3. OAuth 回调增强

| 项 | 说明 |
|----|------|
| Locale 提取 | 从 pathname 提取 locale（如 `/zh/auth/callback` → `zh`），错误时重定向到 `/${locale}/auth/login` |
| 默认 next | 无 `next` 时使用 `/${locale}/dashboard` 而非硬编码 `/en/dashboard` |

### 4. 忘记密码流程（design-auth 要求）

| 页面 | 说明 |
|------|------|
| `/auth/forgot-password` | 输入邮箱 → 调用 `resetPasswordForEmail` → 显示 "Check your email" |
| `/auth/reset-password` | 从邮件链接进入 → 输入新密码 + 确认 → 调用 `updateUser({ password })` → 跳转 Dashboard |

Supabase 密码重置流程：用户点击邮件链接后，会带 `type=recovery` 等参数重定向到配置的 URL。需在 Supabase Dashboard 配置 Site URL 和 Redirect URLs，并在应用中处理 hash fragment 或 query 中的 token。

> 注：Supabase v2 使用 PKCE，密码重置链接会重定向到 `redirectTo` URL，并附带 `type=recovery` 等参数。需在 reset-password 页检测并调用 `supabase.auth.verifyOtp` 或 `updateUser`。

### 5. Middleware

| 项 | 说明 |
|----|------|
| 受保护路由 | 将 `/practice` 加入 `protectedRoutes`（Cursor.md 规定练习页需登录） |

### 6. 国际化

为 forgot-password、reset-password 新增翻译 key（en/zh/ja/ko）。

---

## Supabase 配置提醒

在 Supabase Dashboard → Authentication → URL Configuration 中，需将以下 URL 加入 Redirect URLs：

- `http://localhost:3000/*`（开发环境）
- `https://yourdomain.com/*`（生产环境）

密码重置链接会重定向到 `/{locale}/auth/reset-password`，需确保该路径可被 Supabase 访问。

---

## 涉及文件

| 操作 | 文件 |
|------|------|
| 修改 | `src/app/[locale]/auth/login/page.tsx` |
| 修改 | `src/app/[locale]/auth/register/page.tsx` |
| 修改 | `src/app/[locale]/auth/callback/route.ts` |
| 修改 | `src/middleware.ts` |
| 新建 | `src/app/[locale]/auth/forgot-password/page.tsx` |
| 新建 | `src/app/[locale]/auth/reset-password/page.tsx` |
| 修改 | `src/messages/en.json`（及 zh/ja/ko） |

---

## 风险与注意事项

1. **Supabase 密码重置**：需在 Supabase Dashboard → Authentication → URL Configuration 中配置 Redirect URLs，包含 `https://yourdomain.com/[locale]/auth/reset-password`（开发时可用 localhost）。
2. **Email 注册的 displayName**：已通过 `options.data: { full_name: displayName }` 传递，`handle_new_user` 触发器会读取，无需改动。
3. **密码强度提示**：可选实现，若时间紧张可延后。

---

## 实施步骤（建议顺序）

1. 修改 callback：locale 提取 + next 默认值
2. 修改 login：redirect 读取与传递 + Forgot 链接
3. 修改 register：redirect 读取与传递
4. 新建 forgot-password 页
5. 新建 reset-password 页
6. 修改 middleware：加入 /practice
7. 补充翻译

---

请确认此计划，确认后开始实施。
