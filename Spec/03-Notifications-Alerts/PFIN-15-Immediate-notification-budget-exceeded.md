# PFIN-15 — Immediate notification when budget limit is exceeded

- **Epic:** [PFIN-3 — Notifications & Alerts](./_epic-PFIN-3.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to receive an immediate notification when I exceed my monthly budget so that I am immediately aware I have overspent.

## Acceptance Criteria

- **AC1:** Given I have a budget set, when a new expense causes total spending to exceed 100% of the budget, then an urgent in-app notification fires: "Budget Exceeded! You've spent X of your Y budget"
- **AC2:** Given the budget is exceeded, when push notifications are enabled, then a push notification is sent immediately
- **AC3:** Given the budget is exceeded, when email notifications are enabled, then an email is sent with the subject "Personal Finance: Budget exceeded!" within 5 minutes
- **AC4:** Given the budget was already exceeded and I add another expense, when the new expense is added, then the notification fires again with the updated overage amount
- **AC5:** Given I delete an expense and total spending drops below the budget, when I later exceed it again, then the alert fires again
