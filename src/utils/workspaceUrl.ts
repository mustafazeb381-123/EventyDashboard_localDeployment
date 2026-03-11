/**
 * Workspace / company subdomain URL helpers.
 *
 * Two modes:
 * 1. Path-based (default): company in path → https://eventy.com/enso, https://eventy.com/dfsdaf
 * 2. Subdomain mode: company in host → https://enso.eventy.com, https://dfsdaf.eventy.com
 *
 * Set VITE_APP_ROOT_DOMAIN (e.g. eventy.com) and optionally VITE_APP_USE_SUBDOMAIN=true
 * to redirect after login to the subdomain URL. DNS/hosting must support wildcard (*.eventy.com).
 */

const getEnv = (key: string): string | undefined =>
  typeof import.meta !== "undefined" && (import.meta as any).env?.[key]
    ? String((import.meta as any).env[key])
    : undefined;

/** Root domain for subdomain redirects (e.g. eventy.com). From VITE_APP_ROOT_DOMAIN. */
export function getRootDomain(): string {
  return getEnv("VITE_APP_ROOT_DOMAIN") || "eventy.com";
}

/** Whether to use real subdomain redirect (company.eventy.com). Requires VITE_APP_USE_SUBDOMAIN=true. */
export function useSubdomainRedirect(): boolean {
  const v = getEnv("VITE_APP_USE_SUBDOMAIN");
  return v === "true" || v === "1";
}

/**
 * Parses the current hostname and returns the company subdomain if we're on a subdomain
 * of the configured root (e.g. "enso" from "enso.eventy.com").
 * Returns null if we're on the main domain or localhost.
 */
export function getCompanyFromHostname(): string | null {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") return null;
  const root = getRootDomain();
  if (!root || hostname === root) return null;
  if (hostname.endsWith("." + root)) {
    const sub = hostname.slice(0, hostname.length - root.length - 1);
    return sub || null;
  }
  return null;
}

/**
 * Returns the full URL to redirect the user to after login for the given company.
 * - If subdomain mode: https://company.eventy.com (full navigation).
 * - Otherwise: same origin with path /company (e.g. https://eventy.com/company).
 */
export function getWorkspaceRedirectUrl(company: string): string {
  if (typeof window === "undefined") {
    const root = getRootDomain();
    const protocol = "https:";
    return useSubdomainRedirect()
      ? `${protocol}//${company}.${root}`
      : `${protocol}//${root}/${company}`;
  }
  const { protocol, host, port } = window.location;
  const root = getRootDomain();
  const isLocalhost = host === "localhost" || host === "127.0.0.1";

  if (useSubdomainRedirect() && !isLocalhost && root) {
    const portSuffix = port ? `:${port}` : "";
    return `${protocol}//${company}.${root}${portSuffix}`;
  }
  const path = `/${encodeURIComponent(company)}`;
  const origin = port ? `${protocol}//${host}:${port}` : `${protocol}//${host}`;
  return `${origin}${path}`;
}
