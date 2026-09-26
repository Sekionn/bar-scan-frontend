# Bar Scan Frontend

React + TypeScript frontend built with Vite.

## Local development

```powershell
npm install
npm run dev
```

### `npm install`

Installs dependencies.

### `npm run dev`

Runs the app in development mode.

### `npm start`

Alias for `npm run dev`.

### `npm run build`

Type-checks the app and builds production assets to `dist`.

### `npm run lint`

Runs ESLint.

### `npm run preview`

Serves the production build locally for preview.

## Environment

Vite exposes client-side variables prefixed with `VITE_`.

```env
VITE_BACKEND_URL=http://127.0.0.1:8080
```

## Pages

- `/signup` sends a contact/setup request for company signup.
- `/signup-submitted` confirms that the contact request was received.
- `/super/users/password` lets a super admin set the first admin password after manual contact/payment.
- `/payment-pending/:signupId` opens payment and polls onboarding status in local development only.
- `/login` signs in admins and scanner users.
- `/shops` lets managers and super admins create company shops.
- `/users` lets admins, managers, and super admins create allowed user roles.
- `/products` shows collected barcode/product counts with quarter filters and CSV/TXT export.
- `/scan-session` shows a live-refresh scanner feed from backend product data.

## Backend Contract

See `backend-contact-signup-context.md` for the backend changes needed by the contact-based signup flow.

## Docker

The Docker image builds the Vite app and serves the generated `dist` directory with nginx.

```sh
docker compose up --build
```
