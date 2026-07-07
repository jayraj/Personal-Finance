# PFIN-20 — Export expense data as CSV and PDF

- **Epic:** [PFIN-4 — Reporting & Analytics](./_epic-PFIN-4.md)
- **Status:** To Do
- **Priority:** Medium

## Description

As a user, I want to export my expense data as CSV and PDF so that I can share, archive, or analyze my financial records in external tools.

## Acceptance Criteria

- **AC1:** Given I am on the Reports page, when I tap "Export CSV", then a CSV file is downloaded containing all expenses with columns: Date, Category, Amount, Notes, Receipt URLs
- **AC2:** Given I tap "Export PDF", then a formatted PDF report is generated including the summary dashboard and expense list for the selected period
- **AC3:** Given I export data, when the file is ready, then it is downloaded to my device
- **AC4:** Given I want a specific date range, when I set a date filter before exporting, then only expenses within that range are included
- **AC5:** Given the CSV is downloaded, when I open it in Excel/Google Sheets, then columns are properly delimited and formatted
