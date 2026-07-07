# PFIN-14 — Notification when spending reaches 80% of monthly budget

- **Epic:** [PFIN-3 — Notifications & Alerts](./_epic-PFIN-3.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to receive a notification when my spending reaches 80% of my monthly budget so that I can slow down spending and avoid exceeding the limit.

## Acceptance Criteria

- **AC1:** Given I have a monthly budget set, when my total expenses reach exactly 80% of the budget, then an in-app notification is triggered: "You've used 80% of your monthly budget"
- **AC2:** Given the 80% threshold is crossed, when I have email notifications enabled, then an email is sent with the subject "Personal Finance: You've used 80% of your budget"
- **AC3:** Given the 80% notification has been sent, when my spending continues and stays above 80% but below 100%, then the notification is NOT sent again (no duplicate)
- **AC4:** Given my spending drops below 80% (e.g., after deleting an expense), when I cross 80% again, then the notification fires again
- **AC5:** Given I have per-category budgets, when a category reaches 80% of its limit, then a similar category-specific alert fires
