# PFIN-22 — User registration and secure login with email/password

- **Epic:** [PFIN-5 — Authentication & User Management](./_epic-PFIN-5.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a new user, I want to register and log in securely so that my financial data is protected and accessible only to me.

## Acceptance Criteria

- **AC1:** Given I am a new user, when I navigate to the Sign Up page, then I can register with email and password (min 8 chars, 1 uppercase, 1 number)
- **AC2:** Given I submit the registration form with valid data, when the account is created, then I am logged in automatically and redirected to the onboarding flow
- **AC3:** Given I enter an email that is already registered, when I tap Sign Up, then I see "An account with this email already exists"
- **AC4:** Given I am a returning user, when I enter my email and password on the Login page, then I am authenticated and redirected to the dashboard
- **AC5:** Given I enter incorrect credentials 5 times, when I attempt another login, then my account is temporarily locked for 15 minutes with a message: "Too many attempts. Please try again in 15 minutes."
- **AC6:** Given I am logged in, when I close and reopen the app, then my session persists (JWT refresh token with 30-day expiry)
