# PFIN-2 — Epic: Budget Management

**Description:** Set monthly limits and track spending against budgets

As a user, I want to set monthly spending limits and track my progress against them so that I can stay within my financial goals and avoid overspending.

## Key Features

- Set overall monthly budget limit
- Set per-category budget limits
- View remaining budget in real-time
- Optional rollover of unused budget

## Acceptance Criteria

- Users can set an overall monthly budget limit in their preferred currency
- Users can set individual budget limits per expense category
- The dashboard displays remaining budget (overall + per-category) updated in real-time as expenses are added
- When total expenses exceed the overall budget, the remaining amount shows negative/overage
- Users can optionally enable rollover of unused budget to the next month
- Budget limits persist month-over-month unless manually changed
- A progress bar visual shows percentage of budget used

## Stories

| Key | Summary |
|-----|---------|
| PFIN-11 | [Set overall monthly budget limit](./PFIN-11-Set-monthly-budget-limit.md) |
| PFIN-12 | [Set per-category spending limits](./PFIN-12-Set-per-category-limits.md) |
| PFIN-13 | [View remaining budget in real-time with progress indicators](./PFIN-13-View-remaining-budget-real-time.md) |
