# PFIN-12 — Set per-category spending limits

- **Epic:** [PFIN-2 — Budget Management](./_epic-PFIN-2.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to set individual budget limits for each expense category so that I can manage specific areas of spending (e.g., limit Dining Out to $200/month).

## Acceptance Criteria

- **AC1:** Given I am on the Category Budget page, when I tap a category, then I can set a specific monthly limit for that category
- **AC2:** Given I set per-category limits, when the sum of all category limits exceeds the overall budget, then I see a warning "Category budgets exceed your overall monthly budget"
- **AC3:** Given a category has a limit set, when I view the dashboard, then I see the category's remaining budget
- **AC4:** Given a category has no limit set, when I add an expense to it, then it only counts toward the overall budget
