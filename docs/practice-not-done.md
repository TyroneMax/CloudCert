# 练习 / 答题相关：未做项与待办

> 本文档记录与 **认证练习、答题页、设置** 相关的：**计划里尚未落地**、**只做了部分**、**被其它方案替代**、以及 **代码中仍标 TODO** 的内容，便于后续迭代对齐。  
> 总纲仍以 [`Cursor.md`](../Cursor.md) 与 [`design-practice.md`](design-practice.md) 为准。

---

## 1. 历史计划文档中仍未完成或可加强的项

来源：[`plan-practice-enhancements.md`](../plan-practice-enhancements.md) 第 2.4 节「补充优化」等。

| 项 | 状态 | 说明 |
|----|------|------|
| 提交失败 **Toast** + 重试 | **未做** | 当前答题页仍为行内错误区 +「重试」按钮；未接入全局 Toast 组件。 |
| **切题过渡**（题目区动效强化） | **部分** | 有简单 `motion` 淡入与 `scrollTo`；未按 UX 文档做更完整的过渡规范。 |
| 选项反馈 **动效**（与 design-ux-standards 完全对齐） | **部分** | 已有 ✓/✗ spring；未逐项对照 UX 标准做验收。 |
| 背题 / Study 模式 **预取下一题答案** | **不再需要 / 未做** | 已改为题目包中带 `correctOptionIds`；若仍保留 `GET /api/question-answer` 仅作兼容或权限校验，预取下一题非必须。 |
| `practice_preferences` **JSONB** 统一收纳 | **未做** | 当前为 `user_preferences` 上多个 `practice_*` 布尔字段；JSONB 仍为可选重构。 |
| 答题卡题量 **>200 虚拟列表** | **未做** | 大题量时仍为可滚动网格，未做虚拟化。 |
| **键盘快捷键**（切题、提交） | **未做** | 原计划在「补充优化」中明确排除，现仍无。 |
| 独立 **`GET /api/question-content`** | **未做（已由数据层替代）** | 原计划按题拉文案；实际在 [`getQuestionsForPractice` / `getQuestionsByIds`](../src/lib/data/questions.ts) 中一次性组装 `contentByLocale`，无需单独 API。 |

来源：[`plan-quiz-ui-and-settings.md`](../plan-quiz-ui-and-settings.md)。

| 项 | 状态 | 说明 |
|----|------|------|
| 未登录仅 **localStorage**、登录后以 **DB 覆盖本地** 的严格同步策略 | **部分** | 已有 localStorage + DB；「打开设置页强制覆盖本地 practice 键」未单独做完整流程说明/自动化测试。 |
| 客户端 **纯本地判分**、省略 `submit-answer` | **未做（有意保留服务端）** | 仍为客户端展示 `correctOptionIds`，**判分与 `user_attempts` 以 `POST /api/submit-answer` 为准**。 |

---

## 2. 代码中显式 TODO

| 位置 | 内容 |
|------|------|
| [`settings-client.tsx`](../src/app/[locale]/settings/settings-client.tsx) | 保存失败时 `// TODO: toast error`，尚无错误 Toast。 |

---

## 3. 运维与依赖（非功能代码，但必须执行）

| 项 | 说明 |
|----|------|
| Supabase **迁移** | 练习偏好相关字段见 `supabase/migrations/`（含 `practice_*` 列）。**未在目标环境执行迁移时**，设置页/练习页的 `select` 会失败。部署前需执行并与生产库一致。 |

---

## 4. 产品设计 / 路线图层面（非本次迭代范围）

来源：[`design-roadmap.md`](design-roadmap.md)、[`design-profit-model.md`](design-profit-model.md) 等。

| 项 | 说明 |
|----|------|
| **模拟考试模式**（限时、成绩报告） | Roadmap 中仍为 Planned。 |
| **免费认证引导** `free_certification_id` 等 | 盈利/增长设计中有字段与流程，主站练习流未完整接。 |
| **搜索** 万级以上改用 MeiliSearch/Algolia | [`design-search.md`](design-search.md) 未来扩展。 |
| **捐赠 / 支付** 全流程 | 多处仍为「Coming soon」或与 Stripe 落地细节未接。 |

---

## 5. 安全与内容（设计文档要求、实现需持续核对）

| 项 | 说明 |
|----|------|
| **RLS / 付费题** | 设计文档要求未付费用户无法获取付费题内容；前端虽带 `correctOptionIds`，**服务端拉题与 API 权限**需与商业规则保持一致并定期审计。 |
| **`/api/question-answer`** | 若仍对外：需与练习权限一致（免费范围/订阅），避免被滥用批量拉答案。 |

---

## 6. 文档与示意图可能滞后

| 项 | 说明 |
|----|------|
| [`design-practice.md`](design-practice.md) 中 **ASCII 示意图**（顶栏按钮、图例符号） | 部分与当前 UI（Popover 内多项开关、答题卡实心色块等）不完全一致，以实机为准时可择机更新示意图。 |
| **题型分组题号** | 文档曾写「从 0 开始」；当前实现为 **组内 1-based** 显示，文档中已部分修正，若仍有旧表述以代码为准。 |

---

## 7. 建议的后续优先级（可选）

1. 接入 **Toast**（设置保存失败、提交失败统一体验）。  
2. 答题页提交失败：**Toast + 重试**，与 `plan-practice-enhancements` 一致。  
3. 题量极大时的 **答题卡虚拟化**或分页策略。  
4. 无障碍与 **快捷键**（方向键切题、Enter 提交）若产品需要再做。  

---

*最后更新：与当前仓库实现同步；若你完成其中某项，请在本文件中勾选或删除对应行，并更新 `design-practice.md` / `Cursor.md`。*
