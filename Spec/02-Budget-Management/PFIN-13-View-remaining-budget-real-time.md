# PFIN-13 — View remaining budget in real-time with progress indicators

- **Epic:** [PFIN-2 — Budget Management](./_epic-PFIN-2.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to see my remaining budget updated in real-time so that I always know how much I have left to spend this month.

## Acceptance Criteria

- **AC1:** Given I have a budget set, when I view the dashboard, then I see a progress bar showing percentage of budget used (green < 60%, yellow 60-80%, red > 80%)
- **AC2:** Given I add a new expense, when the dashboard refreshes, then the remaining budget updates immediately (within seconds)
- **AC3:** Given I have per-category budgets, when I view a category, then I see its individual progress bar and remaining amount
- **AC4:** Given my spending reaches 100% of the budget, when I view the progress bar, then it shows as fully red with "X over budget" text
- **AC5:** Given I have multiple months of data, when I view the dashboard, then I can select a past month to see its budget and spending
