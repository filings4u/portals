screenings4u business ownership correction

Upload these files to the Enterprise site root, preserving assets/js/.

This patch does NOT remove or rename the top tabs.
Top tabs remain:
Enterprise | Testing | Training | Workforce | DOT | Finance

Enterprise navigation no longer contains:
- Organizations & Accounts
- People & Identity
- Portal Users & Access
- Customer Setup & Configuration
- Task Manager
- Service Desk

Each of Testing, Training, Workforce, and DOT now has its own Company Administration group containing:
- Organizations & Accounts
- People & Identity
- Portal Users & Access
- Customer Setup & Configuration
- Task Manager

The shared company-management pages are locked to the selected business when opened from a business tab. The Business selector is hidden/locked so an admin cannot accidentally manage another business from that workspace.

Business-specific task pages:
- admin-testing-tasks.html
- admin-training-tasks.html
- admin-workforce-tasks.html
- admin-dot-tasks.html

Email backend changes are already deployed in Supabase and are NOT files in this zip:
- training-support-actions v5
- enterprise-service-desk v8
Training email header now uses logo-learning-center2.png.
Training email text sizes were reduced.
