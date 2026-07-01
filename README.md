# Hemby Point Sanctuary

Hemby Point Sanctuary is a visually pristine, grounding, multi-user SaaS personal life dashboard designed for self-alignment, focus, and daily presence. It is built as a native **Next.js App Router** application with complete serverless API handlers for direct deployment on Vercel.

---

## Key Features

1. **Secure Multi-User Auth**: Email & Password registration (hashed via bcrypt) and Google OAuth login powered by NextAuth.js.
2. **Focus Area Selection Onboarding**: Pick specific life focus areas (e.g. *Faith / Spirituality*, *Fitness & Health*, *Pets*, *Business*, *Finances*, *Relationships*, *Mental Health*, *Sleep*).
3. **Dynamic Dashboard Tabs**: Tabs and interactive widgets generate dynamically based on your onboarding selections, centered by a core, permanent **Daily** dashboard.
4. **Google Calendar Sync**: Pull schedule data seamlessly with direct client-side Google Identity Services popups and persistent secure server-side token storage.
5. **AI Morning Briefing**: Gemini-powered customized daily briefings summarizing active focus goals, habits, and schedule details via a personal endpoint.

---

## Setup & Environment Variables

Create a `.env` file in the root directory. You can copy these from `.env.example`:

```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-random-key"

# Google Client (OAuth for Login & Calendar Integration)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gemini AI Key (Briefing creation)
GEMINI_API_KEY="your-gemini-api-key"
```

---

## Service Configuration Guides

### 1. Neon PostgreSQL Database
1. Go to [Neon.tech](https://neon.tech) and create a free serverless Postgres database.
2. Retrieve your connection string (`DATABASE_URL`) from the Neon console and paste it into `.env`.
3. Create the necessary tables using the query editor or raw client:
   ```sql
   CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     name VARCHAR(255),
     phone VARCHAR(50),
     briefing_opt_in BOOLEAN DEFAULT FALSE,
     briefing_time VARCHAR(10) DEFAULT '07:00',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS user_dashboards (
     id SERIAL PRIMARY KEY,
     user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
     selected_areas JSONB DEFAULT '[]'::jsonb,
     data JSONB DEFAULT '{}'::jsonb,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 2. Google Cloud Platform OAuth & Calendar
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project and configure the OAuth consent screen.
3. Under **Credentials**, create an **OAuth 2.0 Client ID** with Application Type set to **Web Application**.
4. Set Authorized JavaScript Origins:
   - `http://localhost:3000`
   - Your hosted domain URL (e.g. Vercel deployment link)
5. Set Authorized Redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for Auth login)
6. Copy the **Client ID** and **Client Secret** into your `.env` variables.

### 3. Setting Up Your Morning Briefing (Free)

Each user can set up a completely free automated Morning Briefing on their own mobile device (using Apple iOS Shortcuts on iPhone, Tasker on Android, or a standard cron webhook trigger) to call their personalized endpoint and message the response directly to themselves. This avoids any Twilio usage or SMS costs.

#### Personalized Endpoint URL Format:
`https://<your-app-domain>/api/briefing/<user-id>`

#### Example iOS Shortcut Setup:
1. Open the **Shortcuts** app on your iPhone or iPad and create a new Shortcut.
2. Add the **Get Contents of URL** action and set the URL to your personalized briefing endpoint: `https://your-sanctuary-app.com/api/briefing/123` (replace `123` with your user ID, and `your-sanctuary-app.com` with your deployed URL).
3. Set the method to `GET` and choose **Get Text from Input** or parse the JSON response.
4. Add the **Send Message** action and set the recipient to yourself (or standard iMessage / SMS number), passing the response text as the message body.
5. Set an automation trigger in the **Automation** tab of the Shortcuts app to run this Shortcut automatically every morning at your preferred hour (e.g., 7:00 AM).

---

## Development & Execution

Install dependencies and start the sanctuary:
```bash
npm install
npm run dev
```

The application will launch on port `3000`. You can preview the landing page, sign up, undergo onboarding alignment, and step into your personalized sanctuary.
