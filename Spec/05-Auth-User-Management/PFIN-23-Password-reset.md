# PFIN-23 — Password reset via email link

- **Epic:** [PFIN-5 — Authentication & User Management](./_epic-PFIN-5.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to reset my password via a secure email link so that I can regain access to my account if I forget my password.

## Acceptance Criteria

- **AC1:** Given I am on the Login page, when I tap "Forgot Password", then I am prompted to enter my registered email
- **AC2:** Given I enter my email and tap Send, then a password reset email is sent with a secure one-time link that expires in 1 hour
- **AC3:** Given I click the reset link within 1 hour, when I am taken to the reset page, then I can set a new password (same complexity rules as registration)
- **AC4:** Given I submit a new password, when confirmation is successful, then I am redirected to the Login page with a success message: "Password reset successful. Please log in."
- **AC5:** Given I click an expired reset link, when I land on the page, then I see "This reset link has expired. Please request a new one."
- **AC6:** Given I am logged in, when I want to change my password, then I can do so from Settings by entering my current password + new password
