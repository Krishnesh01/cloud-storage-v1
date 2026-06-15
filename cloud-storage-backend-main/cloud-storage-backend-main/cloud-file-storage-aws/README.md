# Cloud Storage Backend

Express API for authentication and AWS S3 file operations.

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Required environment variables are listed in `.env.example`.

## API surface

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/files`
- `POST /api/files/upload`
- `GET /api/files/download/:name`
- `DELETE /api/files/:name`
- `GET /api/files/stats`
- `GET /api/files/share/:name`

Protected file routes require `Authorization: Bearer <token>`.

## Render deployment

This repository includes a root `render.yaml` blueprint for the backend service.

1. Open Render and create a new Blueprint from the GitHub repo.
2. Use `render.yaml` from the repository root.
3. Fill the secret environment variables Render asks for:

```env
JWT_SECRET=<long-random-secret>
AWS_ACCESS_KEY_ID=<aws-key>
AWS_SECRET_ACCESS_KEY=<aws-secret>
AWS_REGION=<bucket-region>
AWS_BUCKET_NAME=<bucket-name>
```

4. After Render deploys, copy the backend URL, for example:

```text
https://cloud-storage-backend.onrender.com
```

5. In Vercel, set the frontend environment variable:

```env
REACT_APP_API_BASE_URL=https://cloud-storage-backend.onrender.com
```

6. Redeploy the frontend on Vercel.

The Render blueprint mounts a persistent disk at `/var/lib/cloud-storage` so local user auth data survives restarts. For high-traffic production, replace this file store with a managed database.

## EC2 deployment

1. Copy the backend folder to the EC2 instance.
2. Install Node.js 20 or newer.
3. Create the production env file:

```bash
cp .env.example .env
```

4. Set these production values:

```env
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
JWT_SECRET=<long-random-secret>
AWS_ACCESS_KEY_ID=<aws-key>
AWS_SECRET_ACCESS_KEY=<aws-secret>
AWS_REGION=<bucket-region>
AWS_BUCKET_NAME=<bucket-name>
DATA_DIR=/var/lib/cloud-storage
```

5. Install and run with PM2:

```bash
npm install --omit=dev
sudo mkdir -p /var/lib/cloud-storage
sudo chown -R $USER:$USER /var/lib/cloud-storage
npx pm2 start ecosystem.config.js
npx pm2 save
```

6. Put Nginx in front of the API using `nginx.conf.example`, then enable HTTPS with Certbot. Use the final HTTPS API URL as `REACT_APP_API_BASE_URL` in Vercel.

For production user accounts this project now persists auth users to `DATA_DIR/users.json`. For multi-instance or high-traffic production, replace that file store with a managed database before scaling horizontally.
