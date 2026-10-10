# Unified DOT Pilot — CTPA Test Plan

Status: Manual testing pending. Pilot is not deployed.

Before testing: approve an HTTPS staging origin, validate Supabase authentication allowlists, use dedicated test accounts, and keep credentials out of GitHub issues.

Scenarios:
1. Signed-out: login only, no employer data.
2. Wrong credentials: no session.
3. No DOT membership: no workspaces.
4. Single eligible CTPA: authorized overview only.
5. Multi-organization CTPA: explicit organization selection required.
6. CTPA A employer request: only A employer records.
7. Switch from A to B while A request is pending: ignore A response.
8. No employer-management entitlement: employer list inaccessible; backend rejects request.
9. Expired subscription: access denied.
10. Sign out mid-request: no late employer data rendered.
11. Employer/driver account: cannot access CTPA employer endpoint.
12. Tampered membership, subscription, CTPA IDs: backend rejects cross-account access.
13. Parallel sessions: no cross-user cache leakage.
14. Mobile: accessible organization selector, readable employer list.
15. Handoff to old CTPA portal: independent authentication and security are preserved.

Security review: The existing workforce-ctpa-employers endpoint returns more fields than the pilot displays. A production implementation should minimize its response on the server, not merely hide fields in the UI. Verify actual organization, membership, subscription, and entitlement checks for every request.

Do not merge, deploy, change DNS, redirect portals, or alter database permissions until tests are recorded and approved.
