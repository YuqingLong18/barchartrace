## Authentication

`barchartrace` is a teacher-only sibling app in the THIS Nexus workspace.

- Microsoft SSO starts at `thisnexus.cn`
- The shared cookie is `thisnexus_session`
- Existing legacy users can still sign in through the centralized legacy route
- Student-tagged SSO sessions are rejected
- The app expects these environment variables:

```env
AUTH_BASE_URL=https://thisnexus.cn
AUTH_SERVICE_BASE_URL=https://thisnexus.cn
AUTH_COOKIE_NAME=thisnexus_session
AUTH_SESSION_SECRET=...
BARCHARTRACE_BASE_URL=https://barchartrace.thisnexus.cn
```

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
