# PFIN-11 — Set overall monthly budget limit

- **Epic:** [PFIN-2 — Budget Management](./_epic-PFIN-2.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to set an overall monthly budget limit so that I can cap my total spending and receive alerts when approaching the limit.

## Acceptance Criteria

- **AC1:** Given I am on the Budget Settings page, when I enter a monthly amount in my preferred currency and tap Save, then the budget is set and displayed on the dashboard
- **AC2:** Given I have an existing budget, when I edit it to a new amount and save, then the updated budget takes effect immediately
- **AC3:** Given I enter a negative or zero amount, when I tap Save, then I see a validation error "Budget must be greater than zero"
- **AC4:** Given the current month's spending exceeds the new budget, when I save a lower budget, then I see a warning: "You have already spent X which exceeds this budget"
- **AC5:** Given a new month starts, when I have a budget set, then it carries over automatically (or I'm prompted to set a new one)
