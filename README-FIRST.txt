SCREENINGS4U TRAINING BUSINESS ADMIN FIX — 2026-09-27

This is a cumulative patch and includes the prior Course Creator / Training Overview routing correction.

CURRENT FIXES
1. Business-scoped People -> Person routes preserve ?business=training/testing/workforce/dot.
2. admin-person.html remains inside the selected business workspace. Training hides enterprise-only staff/global relationship/source controls and shows Training portal access + Training learning data.
3. People and Person Refresh actions now update data in place instead of navigating/reloading.
4. admin-customer-setup.html is business-scoped from each business tab, including Training. Other business cards/catalog tabs are hidden for a fixed business.
5. Customer Setup Clear Form no longer navigates/reloads the page.
6. Task Manager modal no longer uses aria-hidden while a descendant has focus. It uses the hidden state, proper dialog semantics, focus return, Escape close, and no page refresh.
7. Task Manager expanded with Active / My Tasks / Due Today / Overdue / Completed filters plus Start / Block / Complete / Reopen / Remind / Edit / Delete actions.
8. Task Manager CSS moved to a shared business task stylesheet with consistent rem-based sizing and portal colors.
9. enterprise-task-management Edge Function was deployed separately to production Supabase v4: business-specific task links + branded compact email template.
10. assets/js/ui.js is included to resolve the reported local 404/MIME error.
11. Training home remains admin-lms-dashboard.html and Course Creator / Builder routing fixes from the prior patch remain included.

UPLOAD
Upload the contents of this folder to the portal root, preserving assets/js and assets/css.
Do not upload README-FIRST.txt to production if you do not want it there.


2026-09-27 — NEXT NUMBERED FIXES
- Enrollment Management: the former “Enroll Learner” action now opens Create Training Order. Enrollment access is created through the Training order workflow instead of bypassing orders.
- Training Orders: added Create Training Order action and included the existing Training order creator files in this cumulative package.
- Learner Documents: included documents/list/upload files. Supabase lms-admin-documents is now v2. A missing lms_learner_documents.document_id -> documents.id relationship was added, and the function now returns all Training enrollments/learners so recovered documents can be assigned to learners.
- Existing document records were not deleted or moved.


2026-09-27 — ITEM #5 + LMS URL RULE
- All Training/LMS navigation entries in the included enterprise shell now use admin-lms-*.html URLs.
- Added LMS URL copies for Training Storefront, Organizations, People, Person, Access, Customer Setup, Tasks, Settings, Support, Billing, Invoices and Notifications.
- admin-lms-courses.html is included in this cumulative patch.
- Every course row now has Edit Course -> admin-lms-course-builder.html?course=<EXACT_COURSE_ID>.
- The builder validates the requested course ID. If an explicit ID is invalid, it no longer silently opens another course.
- The builder edits the selected existing lms_courses record in place; it does not create a replacement course for Edit Course.
- Browser cache-busters were updated for the course list, course builder and enterprise LMS navigation.


2026-09-27 — ITEM #6 + CERTIFICATE 400 FOLLOW-UP
- Delete Course is now a true admin soft-delete: it disappears immediately from admin-lms-courses.html without a page refresh.
- The lms_courses row remains in Supabase with admin_deleted_at/admin_deleted_by audit fields and status archived.
- Enrollments, progress, lessons, orders, certificates and historical data are not physically deleted.
- screenings4u-training-reporting v4 filters soft-deleted courses from course_directory and provides the authenticated soft_delete_course action.
- Fixed the reported certificate 400 for the selected .docx file: lms-admin-certificates v5 accepts PDF, JPG, PNG, DOC and DOCX; the admin file picker now matches.
- Certificate client now surfaces the Edge Function's actual error message instead of only “Edge Function returned a non-2xx status code.”
