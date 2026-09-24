# DOT Enterprise Management Launch Audit

Date: 2026-09-23

## Scope reviewed

- All 40 `admin-dot*.html` management pages supplied in `admin-dot.zip`.
- Shared Enterprise authentication and navigation runtime.
- DOT management, extended-management, and agency-management JavaScript.
- Live Workforce/DOT Supabase project customer, subscription, membership, and portal-access schema.
- Live customer-facing DOT routing rules in `workforce-session-context`, `portal_endpoints`, `portal_login_endpoints`, and C/TPA-sponsored Employer configuration.
- DOT marketing/account-creation customer paths that create direct DOT Employer and C/TPA accounts.

## Customer management model

The admin pages and customer-facing signup flows now use the same canonical customer records:

- `tenants`
- `organizations`
- `employers` with `workforce_classification = DOT`
- `ctpas`
- `owner_operators`
- `subscriptions`
- `organization_portal_access`
- `organization_memberships`

No duplicate DOT customer-management table was introduced.

## Customer pages

### DOT C/TPAs

`admin-dot-ctpas.html` can now:

- Add a DOT C/TPA with a real DOT C/TPA plan.
- View the complete customer record.
- Edit organization/contact/status fields.
- Manage `ctpa_dot` portal access.
- Manage testing pricing.
- Send a C/TPA inbox message.

### DOT Employers

`admin-dot-employers.html` can now:

- Add a direct DOT Employer with an agency-specific DOT plan.
- Add a C/TPA-sponsored DOT Employer using the same sponsored subscription/access model used by customer-facing C/TPA tools.
- View the complete customer record.
- Edit organization, regulatory, contact, address, C/TPA, USDOT and MC fields.
- Preserve `workforce_classification = DOT`.

Direct Employer portal routing uses agency-specific management portals such as `fmcsa_dot`, `faa_dot`, `fra_dot`, `fta_dot`, `phmsa_dot`, and `uscg_dot`.

C/TPA-sponsored Employer routing uses `employer_dot` for FMCSA and the corresponding agency-specific `*_employer_dot` portal for other agencies.

### Owner-Operators

`admin-dot-owner-operators.html` can now:

- Add an Owner-Operator with a real Owner-Operator plan.
- View the complete customer record.
- Edit Owner-Operator and mirrored Employer-compatible DOT information.
- Manage consortium enrollment and document-packet workflows.

Owner-Operator records remain tied to their canonical Employer-compatible DOT record and subscription.

## Access and authorization

- Every supplied DOT admin page loads `portal-auth-guard.js` and `admin-auth-guard.js`.
- DOT Enterprise management uses the main screenings4u staff authorization service.
- Staff authorized for `dot.manage` are now given company-wide DOT management scope, so they can manage customers regardless of whether the customer:
  - signed up directly on dot.screenings4u.com,
  - was created by a C/TPA,
  - was created by Enterprise admin,
  - or already existed in the canonical DOT customer data.
- View-only / assignment-scoped staff remain scoped unless they have DOT manage authority.
- Portal invitations now verify an active subscription and canonical portal access before sending an Employer or C/TPA invite.
- Direct and C/TPA-sponsored Employer invitations resolve to different customer-facing portal codes instead of being mixed.

## Portal access page

`admin-dot-portal-access.html` now receives canonical `organization_portal_access` rows for visible DOT Employers, C/TPAs and Owner-Operators, alongside user memberships. It can view the matching customer and manage membership state; C/TPA DOT portal access remains explicitly manageable.

## Site-wide navigation

All 40 DOT admin pages now include a `DOT Customers` shortcut to the Employer management page while retaining the full DOT sidebar navigation.

The DOT dashboard now loads its customer directory from `dot-enterprise-management` rather than the generic internal gateway, so dashboard counts and customer lists use the same source as the management pages.

## Styling

The shared Enterprise business CSS now includes:

- Primary styling for add/create management buttons.
- Consistent compact row-action buttons.
- Wrapped action groups for narrow tables.
- Hover, focus-visible, disabled, and mobile states.
- Improved customer-detail modal line formatting.
- Responsive action alignment.

All 40 supplied DOT pages reference the updated shared stylesheet.

## Validation

- 40 DOT admin pages inspected.
- 40/40 include admin authentication guard.
- 40/40 include portal authentication guard.
- 40/40 include Enterprise portal navigation.
- 40/40 include the shared updated Enterprise business stylesheet.
- 0 bare/unclassed HTML buttons in the supplied DOT admin pages.
- 0 missing local script/style/image references in the launch package.
- JavaScript syntax validation passed for all shared DOT management/auth/navigation runtime files checked.

## Known configuration gap

The current live DOT URL configuration does not define a standalone Owner-Operator portal/login endpoint, although the backend `workforce-owner-portal` and Owner-Operator roles exist. Employer and C/TPA customer-facing routing is fully represented in `portal_endpoints`; Owner-Operator routing should not be invented until its intended portal domain/package is established.
