# PFIN-18 — Monthly spending dashboard with category breakdown (pie/bar charts)

- **Epic:** [PFIN-4 — Reporting & Analytics](./_epic-PFIN-4.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to see a visual dashboard showing my monthly spending broken down by category so that I can quickly understand where my money is going.

## Acceptance Criteria

- **AC1:** Given I have expenses in the current month, when I open the Dashboard, then I see a pie chart displaying the proportion of spending per category
- **AC2:** Given I tap a category slice in the pie chart, then I see the exact amount and percentage for that category
- **AC3:** Given I have no expenses in the current month, when I open the Dashboard, then I see "No expenses recorded this month. Start adding expenses to see your dashboard."
- **AC4:** Given I want to see a different month, when I use the month selector, then the dashboard refreshes with that month's data
- **AC5:** Given the dashboard is displayed, when I view it on mobile, then charts are responsive and fit the screen width
