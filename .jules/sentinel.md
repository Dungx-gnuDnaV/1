## 2026-10-24 - Unauthenticated Mutation Endpoints in Next.js App Router
**Vulnerability:** Next.js API route (`POST /api/grades`) allowed unauthenticated users to modify sensitive student grades and hardcoded the `recorded_by` user ID to `'user_admin'`.
**Learning:** API route handlers in Next.js App Router do not enforce authentication automatically. Without explicit session validation via `getCurrentSession()`, any endpoint accepting POST/PUT requests can be invoked directly by unauthorized clients.
**Prevention:** Always perform session authentication (`getCurrentSession()`) and role-based authorization checks at the start of mutation handlers in Next.js API routes before processing request bodies or performing database writes.
