# PFIN-9 — Edit and delete existing expense entries

- **Epic:** [PFIN-1 — Expense Tracking](./_epic-PFIN-1.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to edit or delete any expense entry so that I can correct mistakes or remove outdated records from my financial history.

## Acceptance Criteria

- **AC1:** Given I view an expense detail, when I tap "Edit", then I am taken to a pre-filled edit form with all current values
- **AC2:** Given I am editing an expense, when I modify any field and tap Save, then the changes are persisted and the list reflects the update
- **AC3:** Given I am editing an expense, when I tap Cancel, then no changes are saved
- **AC4:** Given I view an expense detail, when I tap "Delete", then I see a confirmation dialog: "Are you sure you want to delete this expense?"
- **AC5:** Given I confirm the deletion, when I tap "Yes, Delete", then the expense is permanently removed and the list refreshes
- **AC6:** Given I cancel the deletion, when I tap "No", then the expense remains unchanged
