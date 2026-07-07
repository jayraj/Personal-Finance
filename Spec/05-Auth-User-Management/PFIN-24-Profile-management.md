# PFIN-24 — Profile management (name, email, currency, avatar)

- **Epic:** [PFIN-5 — Authentication & User Management](./_epic-PFIN-5.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to manage my profile settings so that my account reflects my personal preferences and identity.

## Acceptance Criteria

- **AC1:** Given I am on the Profile Settings page, when I view my profile, then I see: Display Name, Email, Preferred Currency, and Avatar
- **AC2:** Given I edit my display name, when I save, then the new name is reflected across the app
- **AC3:** Given I change my email, when I save, then a verification email is sent to the new address and the email is marked unverified until confirmed
- **AC4:** Given I change my preferred currency, when I save, then all monetary values across the app update to the new currency (using current exchange rate)
- **AC5:** Given I tap the avatar, when I select an image from my gallery or take a photo, then the avatar updates immediately
- **AC6:** Given I want to delete my account, when I tap "Delete Account" in settings, then I am asked to confirm and warned that all data will be permanently deleted
- **AC7:** Given I confirm account deletion, when the process completes, then I am logged out and all my data is erased within 30 days
