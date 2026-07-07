# PFIN-5 — Epic: Authentication & User Management

**Description:** Secure access and profile management

As a user, I want to securely access my financial data and manage my profile so that my personal and financial information remains protected.

## Key Features

- User registration and login
- Password reset flow
- Profile management
- Multi-device session handling

## Acceptance Criteria

- Users can register with email and password (min 8 chars, 1 uppercase, 1 number)
- Users can log in with email and password
- Users can reset their password via a secure email link (expires in 1 hour)
- Users can edit their profile: display name, email, preferred currency, avatar
- Sessions are maintained securely across devices (JWT-based with refresh tokens)
- Users can log out of all sessions remotely
- Account deletion is available with data export option
- Passwords are hashed and never stored in plaintext

## Stories

| Key | Summary |
|-----|---------|
| PFIN-22 | [User registration and secure login with email/password](./PFIN-22-User-registration-login.md) |
| PFIN-23 | [Password reset via email link](./PFIN-23-Password-reset.md) |
| PFIN-24 | [Profile management (name, email, currency, avatar)](./PFIN-24-Profile-management.md) |
