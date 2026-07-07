# PFIN-3 — Epic: Notifications & Alerts

**Description:** Real-time alerts when limits are crossed

As a user, I want to receive timely notifications about my spending so that I can take corrective action before exceeding my budget.

## Key Features

- Alert at 80% of monthly limit
- Alert when limit is crossed
- Weekly spending summary
- Configurable notification channels

## Acceptance Criteria

- A notification is triggered when spending reaches 80% of the overall monthly budget
- An immediate notification is sent when spending exceeds 100% of the budget (breach alert)
- A weekly summary notification shows total spent, top categories, and remaining budget
- Users can configure notification channels: in-app, email, and push notifications
- Users can mute or snooze notifications for a configurable period
- Notifications include actionable links (e.g., "View Expenses", "Adjust Budget")

## Stories

| Key | Summary |
|-----|---------|
| PFIN-14 | [Notification when spending reaches 80% of monthly budget](./PFIN-14-Notification-80-percent-budget.md) |
| PFIN-15 | [Immediate notification when budget limit is exceeded](./PFIN-15-Immediate-notification-budget-exceeded.md) |
| PFIN-16 | [Weekly spending summary notification](./PFIN-16-Weekly-spending-summary.md) |
| PFIN-17 | [Configure notification preferences (in-app, email, push)](./PFIN-17-Configure-notification-preferences.md) |
