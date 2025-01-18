# SelfMemo 2.0

This repository contains the work for VU Information and Web-Architecture 24/25.

It is the enhancement of the previous project: https://github.com/Self-Memo/SelfMemo

## Getting Started

### Locally
- Clone this repository
- npm install

Set the following env variables:
ADMIN_EMAIL=
ADMIN_NAME=
ADMIN_PASSWORD=

- npx prisma migrate dev
- npm run dev
- hit GET http://localhost:3000/api/seed to set a admin user

### Deploy the application
Prerequisites:
- GitHub Account
- Vercel Account
- SMTP Account
- cronjob.org Accout
- Supabase Account

Steps:
- Fork this repository
- Connect your Vercel to your GitHub account
  - Create a new project in your Vercel account
  - Select "Import Git Repository" (you may need to install the GitHub application)
  - Select this repository fork and click on "Import"
  - Set the following Environment Variables in the PopUp
    - NEXTAUTH_URL -> http://localhost:3000
    - DATABASE_URL -> retrieve your connection string from supabase
    - AUTH_SECRET -> generate on https://generate-secret.vercel.app/32
    - SMTP_USER
    - SMTP_PASS
    - SMTP_MAIL
    - SMTP_HOST
    - ADMIN_EMAIL
    - ADMIN_NAME
    - ADMIN_PASSWORD
  - Click "Deploy"

- Send a request to create admin user: GET https://your-vercel-url.com/api/seed
- Setup cronjob.org and point a cronjob running every minute to:
https://your-vercel-url.com/api/reminders/trigger

References:
https://vercel.com/docs/deployments/git/vercel-for-github
https://vercel.com/docs/deployments/git#deploying-a-git-repository
https://www.prisma.io/docs/orm/overview/databases/supabase
