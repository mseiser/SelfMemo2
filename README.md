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
WIP

Basic steps:
- Fork this repository
- Create Vercel account
- Connect your Vercel to your GitHub account
- Create PostgreSQL Vercel storage
- Set env variables in Vercel
- Deploy
- Setup cronjob.org
