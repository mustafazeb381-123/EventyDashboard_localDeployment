import { useNavigate, useParams } from "react-router-dom";

/**
 * Returns a function that navigates within the current company workspace.
 * Use for all in-app routes; use navigate() directly for global routes (e.g. /login).
 */
export function useWorkspaceNavigate() {
  const navigate = useNavigate();
  const { company } = useParams<{ company?: string }>();

  return (path: string, options?: { state?: unknown; replace?: boolean }) => {
    const p = path.startsWith("/") ? path.slice(1) : path;
    const target = company ? `/${company}${p ? `/${p}` : ""}` : `/${p}`;
    navigate(target, options);
  };
}
