# 用户仪表盘详细设计

> 关联总纲：[Cursor.md](../Cursor.md) | 路由：`/dashboard`

## 概述

用户仪表盘是登录后的首页，展示用户的练习进度、正确率统计和错题概览，帮助用户了解自身学习状态并快速进入练习。

## 页面设计

```
┌─────────────────────────────────────────────────┐
│  Navigation Bar                    User Avatar ▼│
│─────────────────────────────────────────────────│
│                                                 │
│  👋 Welcome back, {displayName}!                │
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Total     │ │ Correct  │ │ Wrong    │        │
│  │ Answered  │ │ Rate     │ │ Answers  │        │
│  │   156     │ │  72.4%   │ │   43     │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│─────────── My Certifications ───────────────────│
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ 📜 AWS SAA                              │    │
│  │ Progress: ████████████░░░  156/350      │    │
│  │ Correct Rate: 72.4%                     │    │
│  │ Wrong Answers: 43                       │    │
│  │ [Continue Practice] [View Wrong Answers]│    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ 📜 AWS SAP                              │    │
│  │ Progress: ░░░░░░░░░░░░░░  0/280        │    │
│  │ Not started yet                         │    │
│  │ [Start Practice]                        │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│─────────── Category Breakdown ──────────────────│
│                                                 │
│  AWS SAA Correct Rate by Category:              │
│                                                 │
│  Compute        ████████████████░░  89%         │
│  Storage        ██████████████░░░░  75%         │
│  Networking     ████████████░░░░░░  67%         │
│  Database       ██████████░░░░░░░░  56%         │
│  Security       ████████░░░░░░░░░░  44%         │
│                                                 │
│─────────── Recent Activity ─────────────────────│
│                                                 │
│  • 2026-03-15: Answered 12 questions (AWS SAA)  │
│  • 2026-03-14: Answered 8 questions (AWS SAA)   │
│  • 2026-03-13: Answered 15 questions (AWS SAA)  │
│                                                 │
│─────────── Quick Actions ───────────────────────│
│                                                 │
│  [Browse Certifications] [Review Wrong Answers] │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 模块详细设计

### 1. 统计概览卡片

顶部三个统计卡片，提供全局数据一览：

| 卡片 | 数据来源 | 说明 |
|------|---------|------|
| Total Answered | `COUNT(*) FROM user_attempts WHERE user_id = $1` | 用户总答题数（去重题目数） |
| Correct Rate | `COUNT(is_correct=true) / COUNT(*)` | 总体正确率百分比 |
| Wrong Answers | 最新记录中 `is_correct = false` 的题数 | 当前错题总数，点击跳转错题本 |

### 2. My Certifications

展示用户有过练习记录的认证，以及可用的新认证：

- **有记录的认证**：显示进度条、正确率、错题数
  - "Continue Practice" 按钮：跳转到上次练习位置
  - "View Wrong Answers" 按钮：跳转到该认证的错题筛选
- **未开始的认证**：显示 "Not started yet"
  - "Start Practice" 按钮：跳转到练习页面

### 3. Category Breakdown

展示当前活跃认证的各分类正确率（水平柱状图）：

- 默认展示最近练习的认证
- 如有多个认证，提供下拉切换
- 柱状图颜色按正确率变化：≥80% 绿色、50~79% 黄色、<50% 红色
- 帮助用户识别薄弱知识领域

### 4. Recent Activity

最近 7 天的练习活动时间线：

- 每天一条记录，显示日期、答题数量、所属认证
- 如某天无活动则不显示
- 最多展示 7 条

### 5. Quick Actions

快捷操作入口：

- "Browse Certifications" → `/certifications`
- "Review Wrong Answers" → `/wrong-answers`

## 数据查询

### 统计概览

```sql
-- 总答题数（去重题目）
SELECT COUNT(DISTINCT question_id) AS total_answered
FROM user_attempts
WHERE user_id = $1;

-- 总体正确率（基于最新一次答题）
SELECT
  COUNT(*) FILTER (WHERE is_correct = true) AS correct_count,
  COUNT(*) AS total_count
FROM (
  SELECT DISTINCT ON (question_id) is_correct
  FROM user_attempts
  WHERE user_id = $1
  ORDER BY question_id, attempted_at DESC
) latest;

-- 当前错题数
SELECT COUNT(*) AS wrong_count
FROM (
  SELECT DISTINCT ON (question_id) is_correct
  FROM user_attempts
  WHERE user_id = $1
  ORDER BY question_id, attempted_at DESC
) latest
WHERE is_correct = false;
```

### 认证进度

```sql
SELECT
  c.id,
  c.code,
  c.name,
  c.total_questions,
  COUNT(DISTINCT ua.question_id) AS answered_count,
  COUNT(DISTINCT ua.question_id) FILTER (
    WHERE ua.id = (
      SELECT ua2.id FROM user_attempts ua2
      WHERE ua2.user_id = $1 AND ua2.question_id = ua.question_id
      ORDER BY ua2.attempted_at DESC LIMIT 1
    ) AND ua.is_correct = true
  ) AS correct_count
FROM certifications c
LEFT JOIN questions q ON q.certification_id = c.id
LEFT JOIN user_attempts ua ON ua.question_id = q.id AND ua.user_id = $1
WHERE c.is_active = true
GROUP BY c.id
ORDER BY answered_count DESC;
```

### 分类正确率

```sql
SELECT
  cat.name AS category_name,
  COUNT(*) FILTER (WHERE latest.is_correct = true) AS correct,
  COUNT(*) AS total
FROM (
  SELECT DISTINCT ON (ua.question_id) ua.question_id, ua.is_correct
  FROM user_attempts ua
  JOIN questions q ON q.id = ua.question_id
  WHERE ua.user_id = $1 AND q.certification_id = $2
  ORDER BY ua.question_id, ua.attempted_at DESC
) latest
JOIN questions q ON q.id = latest.question_id
JOIN categories cat ON cat.id = q.category_id
GROUP BY cat.name, cat.sort_order
ORDER BY cat.sort_order;
```

### 最近活动

```sql
SELECT
  DATE(attempted_at) AS activity_date,
  COUNT(*) AS question_count,
  c.name AS cert_name
FROM user_attempts ua
JOIN questions q ON q.id = ua.question_id
JOIN certifications c ON c.id = q.certification_id
WHERE ua.user_id = $1
  AND ua.attempted_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(attempted_at), c.name
ORDER BY activity_date DESC;
```

## 技术实现要点

- 统计数据通过 Server Component 在服务端计算并渲染
- 柱状图使用 CSS 或轻量图表库（如 Recharts）实现
- 统计概览卡片使用 `CountUp` 动画效果展示数字
- Dashboard 数据使用 `revalidate` 或 `cache` 策略避免每次请求都重新计算
- 进度条使用 Tailwind CSS 实现，动画使用 Framer Motion 12

### 性能优化策略

Dashboard 涉及多个复杂聚合查询（统计概览、认证进度、分类正确率、最近活动），随着用户答题量增长性能会成为瓶颈。

| 策略 | 说明 | 适用阶段 |
|------|------|---------|
| Supabase Database Functions | 将复杂查询封装为 `rpc()` 调用，减少多次往返 | 第一阶段 |
| ISR + 缓存 | `revalidate: 300`（5 分钟），避免每次请求实时计算 | 第一阶段 |
| Materialized View | 定期刷新的物化视图，预计算统计数据 | 数据量增长后 |
| 汇总表 | 每日定时任务将统计写入 `user_daily_stats` 汇总表 | 数据量增长后 |

## 响应式设计

| 断点 | 布局调整 |
|------|---------|
| Desktop (≥1024px) | 统计卡片三列、认证卡片和分类图表并排 |
| Tablet (768-1023px) | 统计卡片三列、其余单列 |
| Mobile (<768px) | 全部单列，统计卡片缩小，柱状图水平滚动 |
