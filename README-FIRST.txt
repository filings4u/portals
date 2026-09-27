screenings4u — Ecosystem Realtime + Support Email Completion Patch
Date: 2026-09-27

UPLOAD LOCATIONS
1. Upload all files/folders in this package EXCEPT the "training" folder to the Enterprise site root.
2. Upload the CONTENTS of the "training" folder to the Training site root (training.screenings4u.com).
3. Preserve all assets/js and assets/css paths.

WHAT THIS PATCH COMPLETES
- Business ownership architecture stays: Enterprise | Testing | Training | Workforce | DOT | Finance.
- Enterprise remains global control; business Support stays inside each business tab.
- Finance remains the separate consolidated finance workspace.
- Training learner Support supports private attachments.
- Training Support ticket creation, learner ticket replies, live support creation, and live support replies create admin in-app notifications.
- Training learner replies/live-chat replies now also create admin email notifications.
- Training support email templates use Learning Center branding.
- Shared Service Desk outbound email uses business branding (Testing / Training / Workforce / DOT).
- Admin Training Notifications updates from Supabase Realtime without a browser refresh.
- Business Support queues/details update from Supabase Realtime when tickets/messages change.
- Learner Training Support updates from Supabase Realtime when staff/messages change.
- Save/submit/reply/status/upload actions in the patched workflows update data/UI in place.
- Explicit browser location.reload() calls found in the supplied Enterprise + Training sources were removed/replaced in this patch.
- Finance Refresh buttons re-fetch/render data instead of refreshing the browser.
- Testing action workflows re-render their current workspace instead of browser reloads.
- Admin Checkout create/payment re-fetches and renders the order in place.
- LMS course builder/lesson/enrollment mutations re-render in place instead of reload.

BACKEND ALREADY DEPLOYED
- training-support-actions: ACTIVE v3
- enterprise-service-desk: ACTIVE v7
- lms-branded-onboarding-pdf: ACTIVE v2

EMAIL BEHAVIOR
Training support:
- New ticket -> learner confirmation email + admin email + admin in-app notification.
- Learner ticket reply -> admin email + admin in-app notification.
- New live support message -> admin email + admin in-app notification.
- Learner live support reply -> admin email + admin in-app notification.
- Staff reply email -> business-branded Service Desk email.

BRAND ASSETS
- Testing: enterprise_branding/logo-screenings4u.png
- Training: enterprise_branding/logo-learning-center.png
- Workforce: enterprise_branding/logo-non-dot.png
- DOT: enterprise_branding/logo-dot.png

VERIFICATION PERFORMED
- JavaScript syntax check passed for every JS file in this patch.
- Patch contains zero location.reload()/window.location.reload() calls.
- Every Enterprise source file found with an explicit browser reload has a corresponding overlay in this patch.

TEST ORDER
1. Training learner opens lms-support.html and replies to an existing ticket.
2. Keep Training admin Notifications open in a second browser window; the notification should appear without pressing Refresh.
3. Confirm an Email Log entry appears for the admin recipient.
4. Confirm the received email uses the screenings4u Learning Center branded header/logo/colors.
5. Open Training Support in Enterprise; the learner reply should appear without reloading the page.
6. Reply from the admin with "Send this reply" checked; learner receives the branded Training email and the learner support view updates without a browser reload.
