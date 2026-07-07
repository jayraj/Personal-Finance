# PFIN-6 — Add expense with amount, category, date, and notes

- **Epic:** [PFIN-1 — Expense Tracking](./_epic-PFIN-1.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to add a new expense entry with amount, category, date, and optional notes so that I can record my spending accurately and in detail.

## Acceptance Criteria

- **AC1:** Given I am on the "Add Expense" screen, when I enter an amount (required, numeric, positive) and select/type a category, then the expense is saved and appears in the expense list
- **AC2:** Given I am adding an expense, when I leave the date blank, then it defaults to today's date
- **AC3:** Given I am adding an expense, when I enter optional notes, then they are saved and viewable in the expense detail
- **AC4:** Given I submit the form with a missing amount, when I click Save, then I see a validation error "Amount is required"
- **AC5:** Given I submit the form with a non-numeric amount, when I click Save, then I see a validation error "Amount must be a number"
- **AC6:** Given an expense is successfully saved, when the form resets, then the new expense is visible at the top of the expense list
