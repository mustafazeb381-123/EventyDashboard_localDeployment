## EventyDashboard: AI Coding Agent Instructions

### Architecture & Structure

- **Stack:** Vite 6, React 19, TypeScript, Tailwind CSS 4, Shadcn UI, i18next, @tanstack/react-query, Framer Motion, ESLint 9.
- **App Layout:** Main layout is composed in `src/Routes/MainRoutes.tsx` (wraps children with `Header` and `Footer`). Routing is defined in `src/Routes/Routes.tsx` using `react-router-dom`.
- **Pages:** All main pages live in `src/pages/`. Each page (e.g., Login, Signup, Home) is a functional component.
- **UI Components:** Use only Shadcn UI and Tailwind CSS for UI. Custom UI elements (e.g., `button.tsx`, `input.tsx`) are in `src/components/ui/`.

### Data & API

- **API Calls:** Use the pre-configured `axiosInstance` in `src/apis/axiosInstance.ts` for all HTTP requests. It auto-injects the auth token from `localStorage`.
- **Data Fetching:** Use `@tanstack/react-query` for all async data. Place custom hooks in `src/apis/` or `src/hooks/`.
- **Authentication:** Store user and token in `localStorage`. Use context (see `useAuth`, `AuthContext` if present) for login/logout and user state.

### Internationalization

- **i18n:** Managed via `src/utils/i18n.js` using i18next. Translation files are in `src/locales/english/` and `src/locales/arabic/`.
- **Language Toggle:** Use the `LanguageToggle` component. It switches language and sets RTL/LTR direction.
- **Adding Languages:** Add new JSON files in `src/locales/`, update `i18n.js`, and ensure UI supports RTL if needed.

### UI/UX Patterns

- **Responsiveness:** Use Tailwind's responsive classes (`sm:`, `md:`, `lg:`) for layouts.
- **Reusable Components:** Place all shared UI in `src/components/ui/`. Use only these for buttons, inputs, checkboxes, etc.
- **Assets:** Centralized in `src/utils/Assets.ts`.
- **No direct DOM manipulation**—always use React state/hooks.

### Routing

- **Routes:** All routes are defined in `src/Routes/Routes.tsx`. Main layout is handled by `MainRoutes.tsx`.
- **Route Protection:** Redirect unauthenticated users to `/login` (enforced in API and context logic).

### Development Workflow

- **Install:** `yarn install`
- **Dev Server:** `yarn start`
- **Build:** `yarn build`
- **Lint:** `yarn lint` (if configured)
- **No test setup detected**—add tests in `src/` if needed.

### Conventions & Patterns

- **Functional Components & Hooks Only.**
- **No magic numbers**—use constants.
- **Use optional chaining (`?.`) and nullish coalescing (`??`).**
- **Add comments for non-obvious logic.**
- **All new pages/components must support i18n and RTL.**

### Library Documentation Links

- [Vite 6](https://vitejs.dev/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [i18next](https://www.i18next.com/)
- [@tanstack/react-query](https://tanstack.com/query/latest)
- [Framer Motion](https://www.framer.com/motion/)
- [ESLint 9](https://eslint.org/)
