# screenings4u Enterprise — DOT Admin Parity Pass

Date: 2026-09-23

## Scope

This build expands the internal screenings4u Enterprise DOT administration area. The finished DOT customer portals were used as the reference and were not modified.

## Live DOT management backend

Supabase project: `wyezpseboxbmkedvbmyx`

Edge Function: `dot-enterprise-management`
Current version at packaging: 19

The function authenticates screenings4u internal staff through the screenings4u staff authorization service and manages the same DOT records used by the customer portals.

## Added DOT enterprise admin pages

- Testing Orders
- Results
- Plans & Features
- Billing & Subscriptions
- Users & Roles
- Locations
- Branding
- Integrations
- Consents & Acknowledgments
- Credentials
- Training Records
- Support
- Audit History
- Service Orders
- Post-Accident

## Existing DOT administration retained

C/TPAs, Employers, Owner-Operators, Drivers, Portal Access, Programs, Consortiums, Random Pools, Pool Memberships, Random Selections, agency-specific FMCSA/FAA/FRA/FTA/PHMSA/USCG configuration, Clearinghouse, New Entrant, RTD/SAP, Compliance, Service Catalog, Documents, Notifications and Reports remain in place.

## Important operating boundaries

- DOT Testing Orders may be created, cancelled and handed off from Enterprise administration.
- Official laboratory/MRO result finalization remains authoritative in screenings4u Testing. DOT Enterprise Results is an inspection/management view, not a second result-finalization system.
- Integration administration changes enablement/status only. Secrets and credentials remain in their secure integration workflow.
- Post-Accident currently exposes the authoritative determination records and linked testing activity; no parallel post-accident decision engine was created.
- Training Records here are operational DOT compliance records. Full course/content/LMS administration is handled in the next Training phase.
- Owner-Operator subscriptions are validated against Owner-Operator plans even though the subscription is attached to the linked Employer record.

## Invite routing repair

Internal DOT user invitations now use configured portal endpoints rather than the obsolete generic `dot-workforce.screenings4u.com` path:

- C/TPA users -> C/TPA DOT portal
- Employer users -> applicable agency-specific Employer DOT portal
- Owner-Operator users -> current Employer DOT fallback, because no dedicated Owner-Operator portal endpoint is configured

## Validation performed

- JavaScript syntax checks passed for DOT enterprise controllers and navigation.
- All new DOT pages and navigation href targets were verified locally.
- Rollback-only database validation passed for representative DOT locations, branding, consent forms, credentials, training records, plan-feature updates and subscription updates.
- No validation data was retained.

