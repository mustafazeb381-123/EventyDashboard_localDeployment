# Subdomain in URL – Setup Guide

This guide explains how the **company subdomain** appears in the URL and how to align with the Eventy requirement: *"Each company operates on its own sub-domain (e.g. enso.eventy.com)"*.

---

## What you have today (path-based)

Your app already puts the company in the URL as the **first path segment**:

| Environment | Example URL | Company |
|-------------|-------------|---------|
| Local | `http://localhost:5173/dfsdaf` | `dfsdaf` |
| Vercel | `https://eventy-dashboard-local-deployment.vercel.app/dfsdaf` | `dfsdaf` |

So the “subdomain” is already in the URL: it’s the `dfsdaf` (or `enso`) part of the path.  
Flow:

1. User signs in at `eventy.com/login` (or your app’s `/login`).
2. Backend returns `subdomain_name` (e.g. `dfsdaf`).
3. App stores it in `localStorage` as `company_subdomain` and redirects to `/{company}` → e.g. `/dfsdaf`.

No extra configuration is required for this. It matches the requirement in a **path-based** way:  
`company.eventy.com` → `eventy.com/company`.

---

## Option A: Keep path-based (no infra change)

- **Login**: stays on `/login` (or `eventy.com/login`).
- **After login**: redirect to `/{company}` (e.g. `/dfsdaf`).
- **All app routes**: `/{company}/home`, `/{company}/invitation`, etc.

So the “subdomain” is the first path segment. No DNS or hosting changes.

---

## Option B: Real subdomains (company.eventy.com)

To have URLs like:

- `https://dfsdaf.eventy.com/`
- `https://enso.eventy.com/dashboard`

you need:

1. **DNS**  
   Add a wildcard record for your main domain, e.g.  
   `*.eventy.com` → CNAME (or A) to your host (e.g. Vercel).

2. **Hosting (e.g. Vercel)**  
   In the project settings, add the domain `eventy.com` and ensure wildcard subdomains are supported (e.g. `*.eventy.com` or “all subdomains”).  
   Vercel: **Settings → Domains** → add `eventy.com` and `*.eventy.com` as described in their docs.

3. **App config**  
   In `.env` (and in Vercel env vars):

   ```env
   VITE_APP_ROOT_DOMAIN=eventy.com
   VITE_APP_USE_SUBDOMAIN=true
   ```

4. **Behaviour**  
   - User signs in on the main domain (e.g. `eventy.com/login`).  
   - After login, the app redirects to **`https://{company}.eventy.com`** (full page load) using `getWorkspaceRedirectUrl(company)` in `src/utils/workspaceUrl.ts`.  
   - So the “subdomain” is in the **host**: `dfsdaf.eventy.com`, `enso.eventy.com`.

---

## Env variables (reference)

| Variable | Purpose |
|----------|---------|
| `VITE_APP_ROOT_DOMAIN` | Root domain (e.g. `eventy.com`). Used for subdomain redirect and Signup preview. |
| `VITE_APP_USE_SUBDOMAIN` | Set to `true` to redirect after login to `https://{company}.eventy.com` instead of `/{company}`. |
| `VITE_APP_PUBLIC_URL` | Public base URL of the app (e.g. for emails). Can be main domain or a specific deployment URL. |

---

## Local development

- **Path-based**: use `http://localhost:5173/dfsdaf` as you do now.  
- **Subdomains**: browsers treat `localhost` as one host, so `dfsdaf.localhost:5173` may not work without extra setup (e.g. editing `/etc/hosts` and dev server config). For local dev, path-based URLs are usually enough.

---

## Summary

- **Current behaviour**: subdomain = first path segment → `.../dfsdaf`, `.../dfsdaf/home`. Already in place.  
- **Optional (real subdomains)**: set `VITE_APP_ROOT_DOMAIN` and `VITE_APP_USE_SUBDOMAIN=true`, configure DNS and hosting for `*.eventy.com`, then after login the app will open `https://company.eventy.com`.
