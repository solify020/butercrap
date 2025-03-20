# Deployment Instructions for BUTERASCP Portal

This document provides instructions for deploying the BUTERASCP Portal to Vercel without triggering Prisma detection.

## Prerequisites

- A Vercel account
- A Firebase project with Firestore, Authentication, and Storage enabled
- Firebase Admin SDK service account key

## Environment Variables

Set up the following environment variables in your Vercel project:

### Firebase Client
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (make sure to include the entire key with newlines)
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_CLIENT_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_ADMIN_SDK_SERVICE_ACCOUNT_KEY` (optional - full JSON as string)

### Authentication
- `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Application Settings
- `OWNER_EMAIL` (comma-separated list of owner emails)
- `STAFF_EMAIL` (comma-separated list of staff emails)
- `NEXT_PUBLIC_OWNER_EMAIL` (same as OWNER_EMAIL)
- `NEXT_PUBLIC_STAFF_EMAIL` (same as STAFF_EMAIL)
- `ENABLE_FORCE_LOGOUT` (set to "true" to enable)
- `SKIP_AUTH` (set to "true" for development only)

### Prisma Override (Important)
- `PRISMA_SKIP_POSTINSTALL=true`

## Deployment Steps

1. **Prepare Your Code**
   - Use the clean files provided in this repository
   - Make sure package.json doesn't include Prisma dependencies
   - Ensure next.config.js includes the Prisma override

2. **Deploy to Vercel**
   - Use the Vercel CLI: `vercel --prod`
   - Or connect your GitHub repository to Vercel
   - Or upload your project directly through the Vercel dashboard

3. **Verify Deployment**
   - Check the deployment logs for any errors
   - Test the application functionality
   - Verify Firebase connections are working

## Troubleshooting

If you encounter the "v0 does not currently support @prisma/client" error:

1. Make sure you've added `PRISMA_SKIP_POSTINSTALL=true` to your environment variables
2. Check your package.json for any Prisma dependencies
3. Look for any imports of @prisma/client in your code
4. Try deploying directly to Vercel instead of through v0

## Maintenance

- Keep your Firebase dependencies updated
- Regularly check for security updates
- Monitor your Firebase usage and quotas

