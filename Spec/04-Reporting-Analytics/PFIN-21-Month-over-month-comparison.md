# PFIN-21 — Month-over-month spending comparison

- **Epic:** [PFIN-4 — Reporting & Analytics](./_epic-PFIN-4.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to compare my spending across months side-by-side so that I can track my financial progress and evaluate the impact of budget changes.

## Acceptance Criteria

- **AC1:** Given I am on the Comparison page, when I select two months, then I see a side-by-side bar chart comparing category spending
- **AC2:** Given the comparison is displayed, when I view it, then I see the total difference: "You spent X more/less in [Month B] compared to [Month A]"
- **AC3:** Given there is a significant change (>20%) in a category, when I view the comparison, then that category is highlighted
- **AC4:** Given I compare two months, when a category existed in one month but not the other, then it still appears with a zero value
- **AC5:** Given the comparison view, when I tap a category, then I see a detailed breakdown of individual expenses in that category for both months
