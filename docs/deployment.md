# Production deployment

## Continuous deployment

1. Import `ByteAcumen/mithaiboxwala` in the Vercel dashboard and set `main` as the Production Branch.
2. Add the production variables from `.env.example` in Vercel. Never upload `.env.local`.
3. In GitHub, protect `main` and require the `CI / quality` and `CodeQL / Analyze JavaScript and TypeScript` checks before merging.
4. In Vercel Project Settings → Git, enable **Require Verified Commits** and keep automatic deployments enabled.

Vercel creates a preview deployment for pull requests and deploys `main` to production automatically. This is its free Git-based continuous-deployment flow.

## Required production variables

- `MONGODB_URI`
- `NEXT_PUBLIC_APP_URL`
- `EMAIL_PROVIDER`, `EMAIL_FROM`, and the matching provider credentials
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_WEBHOOK_SECRET`
- `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` when Sentry is enabled
- `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` only for the initial bootstrap, then remove them

Generate a long random value for `SESSION_SECRET`, even though customer/admin sessions use opaque server-side IDs today; it is reserved for future signed features.

## Safety controls

GitHub Actions runs linting, a TypeScript syntax check, tests, a high-severity dependency audit, and a production build. CodeQL runs on pull requests, pushes to `main`, and weekly. Dependabot opens weekly dependency and workflow updates; dependency review blocks high-severity or restricted-license changes in pull requests.