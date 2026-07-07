# PFIN-10 — Attach receipt images to expense entries

- **Epic:** [PFIN-1 — Expense Tracking](./_epic-PFIN-1.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to upload and attach receipt images to expense entries so that I can maintain digital copies of my receipts for record-keeping and verification.

## Acceptance Criteria

- **AC1:** Given I am adding or editing an expense, when I tap "Attach Receipt", then I can select an image from my device gallery or camera
- **AC2:** Given I select an image, when the upload completes, then a thumbnail preview appears attached to the expense
- **AC3:** Given the image exceeds 5MB, when I attempt to upload, then I see an error "File size must be under 5MB"
- **AC4:** Given the file is not an image or PDF, when I attempt to upload, then I see an error "Only JPG, PNG, and PDF files are supported"
- **AC5:** Given an expense has attached receipts, when I view the expense detail, then I can tap a receipt thumbnail to view it full-screen
- **AC6:** Given I view a receipt full-screen, when I swipe or tap navigation, then I can browse through all attached receipts for that expense
