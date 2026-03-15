# 题目详解功能详细设计

> 关联总纲：[Cursor.md](../Cursor.md) | 嵌入于练习页面 `/practice/[certId]`

## 概述

每道题在用户提交答案后展示详细解析，帮助用户理解"为什么对"和"为什么错"。解析内容支持多语言，与题目语言切换联动。

## 展示时机

- **触发条件**：用户提交答案后立即显示
- **显示方式**：在答题卡片下方展开解析区域（带入场动画）
- **始终可见**：一旦展开，用户可向上滚动重新查看题目和选项

## 解析区域设计

```
┌─────────────────────────────────────────┐
│  ✅ Correct! (or ❌ Incorrect)          │
│─────────────────────────────────────────│
│                                         │
│  📖 Explanation                         │
│                                         │
│  Amazon EC2 (Elastic Compute Cloud)     │
│  provides resizable compute capacity    │
│  in the cloud. It allows you to launch  │
│  virtual servers, configure security    │
│  and networking, and manage storage.    │
│                                         │
│  Why other options are incorrect:       │
│                                         │
│  • A. Amazon S3 — Object storage        │
│    service, not compute.                │
│  • C. Amazon RDS — Managed relational   │
│    database service, not general        │
│    compute.                             │
│  • D. AWS Lambda — Serverless compute,  │
│    not resizable instances.             │
│                                         │
│  🌐 [English] [中文]                    │
│                                         │
│         [ Next Question → ]             │
└─────────────────────────────────────────┘
```

### 元素说明

| 元素 | 说明 |
|------|------|
| 结果标识 | ✅ 正确（绿色）/ ❌ 错误（红色），显示正确答案 |
| 主解析 | 解释正确答案为什么正确 |
| 错误选项分析 | 逐一说明其他选项为何不正确 |
| 语言切换 | 可独立切换解析语言（不影响全局语言设置） |
| 下一题按钮 | 跳转到下一道题 |

## 数据结构

解析内容存储在 `questions` 表的 `explanation` 字段中（英文），翻译版本在 `question_translations` 表中。

### 解析内容格式

解析文本以 Markdown 格式存储，支持：

- 段落文本
- 粗体 / 斜体
- 无序列表（用于错误选项分析）
- 代码块（用于技术配置示例）
- 链接（指向官方文档）

```json
{
  "question_id": "uuid",
  "explanation": "**Amazon EC2** provides resizable compute capacity...\n\n**Why other options are incorrect:**\n\n- **A. Amazon S3** — Object storage service...\n- **C. Amazon RDS** — Managed relational database...\n- **D. AWS Lambda** — Serverless compute...",
  "language": "en"
}
```

### 查询解析内容

```sql
-- 优先获取用户偏好语言的翻译，回退到英文原文
SELECT
  COALESCE(qt.explanation, q.explanation) AS explanation
FROM questions q
LEFT JOIN question_translations qt
  ON qt.question_id = q.id AND qt.language = $1
WHERE q.id = $2;
```

## 语言切换行为

- 解析区域内有独立的语言切换按钮（如 `[English] [中文]`）
- 切换后仅更新解析内容，不影响全局 UI 语言或题目语言设置
- 切换时通过 API 请求对应语言的翻译内容
- 使用本地缓存避免重复请求（同一题目同一语言只请求一次）

## 渲染策略

- 解析文本为 Markdown 格式，使用 `react-markdown` 或 `next-mdx-remote` 在前端渲染
- 代码块使用语法高亮（如 `rehype-highlight`）
- 链接在新窗口打开 (`target="_blank"`)

## 动画

- 解析区域使用 Framer Motion 12 `motion/react` 的 `AnimatePresence` + `motion.div` 实现展开/折叠动画
- 结果标识（✅ / ❌）使用缩放弹入动画

## 技术实现要点

- 解析内容随题目数据一起在 Server Component 中预加载（英文版本）
- 切换到其他语言时，Client Component 发起异步请求获取翻译
- 使用 React `useState` 管理当前解析语言状态
- Markdown 渲染在客户端完成（因需交互式语言切换）
