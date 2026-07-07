# PFIN-8 — View all expenses in a sortable, filterable list

- **Epic:** [PFIN-1 — Expense Tracking](./_epic-PFIN-1.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to view all my expenses in a chronological, sortable, and filterable list so that I can review and analyze my spending history efficiently.

## Acceptance Criteria

- **AC1:** Given I have expenses recorded, when I open the expense list, then I see entries sorted by date (newest first) with infinite scroll
- **AC2:** Given I want to find specific expenses, when I use the search bar, then results filter in real-time by category, amount range, or date range
- **AC3:** Given I view the list, when I tap an expense row, then I see the full expense detail including amount, category, date, notes, and attached receipts
- **AC4:** Given the list is displayed, when I tap a column header (Date, Amount, Category), then the list re-sorts by that field ascending/descending
- **AC5:** Given I have many expenses, when I scroll, then older entries load automatically (pagination or infinite scroll)
