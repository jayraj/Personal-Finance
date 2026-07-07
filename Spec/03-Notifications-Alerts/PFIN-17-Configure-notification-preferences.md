# PFIN-17 — Configure notification preferences (in-app, email, push)

- **Epic:** [PFIN-3 — Notifications & Alerts](./_epic-PFIN-3.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to configure how and when I receive notifications so that I can manage alerts in my preferred channels without being overwhelmed.

## Acceptance Criteria

- **AC1:** Given I am on the Settings > Notifications page, when I view my options, then I see toggles for: In-App, Email, and Push notifications
- **AC2:** Given I toggle a notification channel off, when an alert event occurs, then no notification is sent via that channel
- **AC3:** Given I am on the notification settings page, when I configure threshold alerts, then I can set custom percentage thresholds (e.g., 75%, 90%) instead of the default 80%
- **AC4:** Given I toggle the weekly summary on/off, when the next Monday arrives, then the summary respects my preference
- **AC5:** Given an account is created, when the user logs in for the first time, then all notification channels are enabled by default
