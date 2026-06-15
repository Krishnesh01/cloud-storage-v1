# Cloud Storage Frontend

React frontend for the CloudDrive file storage app.

## Local setup

```bash
npm install
cp .env.example .env.local
npm start
```

Set `REACT_APP_API_BASE_URL` to the backend URL. For local development:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

## Vercel deployment

1. Import this folder as the Vercel project root.
2. Add this production environment variable in Vercel:

```env
REACT_APP_API_BASE_URL=https://api.your-domain.com
```

3. Deploy with the existing settings:

```bash
npm run build
```

The included `vercel.json` builds Create React App into `build/` and rewrites all app routes to `index.html`, so refreshes on `/dashboard` work correctly.
