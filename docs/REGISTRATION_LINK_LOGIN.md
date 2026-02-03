# Why the Registration Link Asks for Login

## What happens when someone opens the copied registration URL

1. **The URL** copied from Home Summary is correct and **public**:
   - Example: `https://yourdomain.com/register/123`
   - Route: `/register/:id` is **not** behind the dashboard login (it’s outside `ProtectedRoute`).

2. **When a guest opens that link:**
   - The **Registration** page loads (`UserRegistration`).
   - The page immediately calls APIs to load the event and form:
     - `getEventbyId(eventId)` – event details
     - `getRegistrationFieldApi(eventId)` – registration fields
     - `getRegistrationTemplateData(eventId)` – template (or default)
   - All these use the **same** `axiosInstance` as the rest of the app.

3. **Why login is required:**
   - **Global 401 handling:** In `src/apis/axiosInstance.ts`, the **response interceptor** runs on **every** API response.
   - On **any** `401 Unauthorized` it:
     - Clears the token
     - Redirects to `/login` with `window.location.href = '/login'`
   - So:
     - If the **backend** returns 401 for those registration endpoints when there’s no token (or invalid token), the interceptor runs.
     - The user is sent to the login page even though they’re on the **public** registration page.

4. **Summary**
   - The registration **route** is public.
   - The **APIs** used by that page may require auth (or the backend returns 401 for unauthenticated requests).
   - The **frontend** treats **all** 401s the same and always redirects to login.

## What to do

**Option A – Backend (recommended for real “public” registration)**

- Expose **public** endpoints for the registration page, e.g.:
  - `GET /events/:id` (or `/events/:id/public`) – event details for guests
  - `GET /events/:id/registration_fields` (or a public variant) – registration form fields
- These should return **200** for unauthenticated users when the event is published/allow public registration.
- Then guests can open the registration link without ever hitting 401 on that page.

**Option B – Frontend (already done)**

- In the axios **response interceptor**, **do not** redirect to login when the user is on the **public registration** path (e.g. pathname starts with `/register/`).
- On 401 on `/register/:id`, the promise is still rejected so the Registration page can show “Event not found” or “Registration unavailable” instead of redirecting to login.
- This way the registration **link** doesn’t force login; only **dashboard** routes keep the current “401 → login” behavior.

**Option C – Both**

- Backend: public endpoints for registration so guests get event + form without auth.
- Frontend: no redirect to login on 401 for `/register/*` (as in Option B).

After Option B (or C), the copied registration URL will only show the login page if the **backend** still returns 401 for those calls; once the backend serves them without auth (Option A/C), the registration form will load for guests without login.
