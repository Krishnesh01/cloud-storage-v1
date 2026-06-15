# CloudDrive Cloud Storage

CloudDrive is a full-stack cloud file storage application. It supports user authentication, AWS S3 uploads, grouped file management, storage statistics, previews, downloads, share links, and a responsive dashboard with dark/light themes.

## Live Application

- Frontend: https://cloud-storage-frontend1-master.vercel.app
- Backend API: https://cloud-storage-backend-nv0d.onrender.com
- Health check: https://cloud-storage-backend-nv0d.onrender.com/health

## Current Status

- Frontend is deployed on Vercel.
- Backend is deployed on Render.
- AWS S3 is used for file storage.
- Render persistent disk is used for backend user data.
- Vercel is configured with the Render backend API URL.

## Features

- Register and login users.
- JWT authentication with HTTP-only cookie support.
- Dashboard welcome message includes the logged-in username.
- Dark and light theme toggle with smooth transitions.
- Theme preference is saved in local storage.
- Drag-and-drop file upload.
- Browse-file upload fallback.
- Upload progress state, success message, and inline error handling.
- Files are grouped by type:
  - Images
  - Documents
  - Spreadsheets
  - Presentations
  - Videos
  - Audio
  - Archives
  - Code
  - Other Files
- Files are sorted by latest upload date.
- File rows show:
  - Clean filename
  - File type
  - Upload date/time
  - File size
- File actions:
  - Download
  - Preview
  - Share signed link
  - Delete
- Storage stats show total files and storage used.
- Frontend route refreshes work on Vercel.
- Backend CORS supports the Vercel production domain and Vercel deployment aliases.

## Tech Stack

### Frontend

- React
- Create React App
- React Router
- Axios
- React Dropzone
- React Icons
- Vercel

### Backend

- Node.js
- Express
- JWT
- HTTP-only cookies
- Multer
- AWS SDK v3
- Render

### Storage

- AWS S3 for uploaded files
- Render persistent disk for local backend user data

## Repository Structure

```text
.
├── README.md
├── render.yaml
├── cloud-storage-frontend1-master/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
└── cloud-storage-backend-main/
    └── cloud-storage-backend-main/
        └── cloud-file-storage-aws/
            ├── server.js
            ├── routes/
            ├── middleware/
            ├── package.json
            ├── ecosystem.config.js
            ├── nginx.conf.example
            └── .env.example
```

## API Overview

Base URL:

```text
https://cloud-storage-backend-nv0d.onrender.com
```

Routes:

```text
GET    /health
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/files
POST   /api/files/upload
GET    /api/files/download/:name
GET    /api/files/share/:name
GET    /api/files/stats
DELETE /api/files/:name
```

Protected file routes require either:

```text
Authorization: Bearer <token>
```

or the auth cookie set by login/register.

## Frontend Local Setup

```bash
cd cloud-storage-frontend1-master
npm install
cp .env.example .env.local
npm start
```

Frontend environment:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

For production:

```env
REACT_APP_API_BASE_URL=https://cloud-storage-backend-nv0d.onrender.com
```

Build:

```bash
npm run build
```

## Backend Local Setup

```bash
cd cloud-storage-backend-main/cloud-storage-backend-main/cloud-file-storage-aws
npm install
cp .env.example .env
npm run dev
```

Backend environment:

```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
ALLOW_VERCEL_ORIGINS=true
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
AWS_ACCESS_KEY_ID=<aws-access-key>
AWS_SECRET_ACCESS_KEY=<aws-secret-key>
AWS_REGION=<aws-region>
AWS_BUCKET_NAME=<s3-bucket-name>
MAX_FILE_SIZE_BYTES=26214400
SIGNED_URL_EXPIRES_SECONDS=3600
DATA_DIR=./data
```

Syntax check:

```bash
npm test
```

## Vercel Deployment

Frontend project root:

```text
cloud-storage-frontend1-master
```

Required Vercel environment variable:

```env
REACT_APP_API_BASE_URL=https://cloud-storage-backend-nv0d.onrender.com
```

Build settings are defined in:

```text
cloud-storage-frontend1-master/vercel.json
```

## Render Deployment

The backend is deployed using the root `render.yaml` Blueprint.

Render service root:

```text
cloud-storage-backend-main/cloud-storage-backend-main/cloud-file-storage-aws
```

Render build command:

```bash
npm install --omit=dev
```

Render start command:

```bash
npm start
```

Required Render secret environment variables:

```env
JWT_SECRET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_BUCKET_NAME
```

Render sets `PORT` automatically. Do not hardcode `PORT` in Render.

The Blueprint also mounts a persistent disk:

```text
/var/lib/cloud-storage
```

This stores backend user auth data in `users.json`.

## AWS S3 Requirements

The S3 bucket must allow the backend IAM user to:

- Put objects
- Get objects
- List bucket contents
- Delete objects

The app uses signed URLs for preview and share links.

## Verification

Recent checks completed:

- Frontend production build passed.
- Backend syntax test passed.
- Vercel production deployment is ready.
- Render health check returned `200`.
- Register/login flow works.
- S3 upload works.
- File delete works.
- Dashboard file grouping renders from S3 metadata.

## Security Notes

- Do not commit `.env` files.
- Do not commit `.pem` files.
- Do not commit AWS keys.
- Do not commit JWT secrets.
- Rotate any AWS key that was pasted into chat, logs, screenshots, or public tools.
- Use a stronger `JWT_SECRET` than `secret123` in production.

## Production Notes

The current backend stores user accounts in a JSON file on Render persistent disk. This is acceptable for a small demo or class project. For larger production usage, replace it with a managed database such as PostgreSQL, MongoDB, or DynamoDB.
