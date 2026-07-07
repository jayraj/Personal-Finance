# PFIN-16 — Weekly spending summary notification

- **Epic:** [PFIN-3 — Notifications & Alerts](./_epic-PFIN-3.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to receive a weekly summary of my spending so that I can stay informed about my financial habits without manually checking the app.

## Acceptance Criteria

- **AC1:** Given I have expenses recorded, when it's Monday 9:00 AM local time, then a weekly summary is delivered (in-app and/or email based on preferences)
- **AC2:** Given the weekly summary is delivered, when I open it, then it contains: total spent this week, top spending category, comparison to previous week, and remaining budget
- **AC3:** Given I have no expenses in a given week, when the summary is generated, then it shows "No expenses recorded this week"
- **AC4:** Given I have email notifications enabled, when the weekly summary email arrives, then it includes a "View Full Report" link that opens the dashboard
- **AC5:** Given I have muted notifications, when the weekly summary is ready, then it is NOT sent
