# Recharge Room — Minimalist, Mobile-First Massage Booking Web Application

> *"Your 15-minute reset."*

A production-ready, editorial-grade booking application built for **Recharge Room**, a quick-relaxation service offering 15-minute head, neck, and shoulder massages for students and employees at MU (college campus and workplace).

- **Brand Pricing**: Flat ₹249 per 15-minute session
- **Capacity**: Strictly 1 customer per 15-minute slot
- **Business Model**: Reserve online, pay physically in person (UPI / Cash) after the massage
- **Aesthetic**: Strictly monochrome editorial typography, zero AI gradients or stock spa imagery

---

## Architecture & Technology Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Custom Monochrome Design System + Google Fonts (`Newsreader` serif + `Inter` sans)
- **Authoritative Database**: Supabase PostgreSQL with atomic stored procedures (`create_booking_atomic`) and partial unique indexes (`idx_unique_active_slot`) to eliminate double bookings.
- **Local Fallback**: Embedded persistent repository with mutex locking for instant zero-configuration local development and offline testing.
- **Operational Integration**: Google Sheets API (`googleapis`) with server-side service account synchronization to a dedicated `Recharge Room Bookings` spreadsheet.
- **Calendar Support**: Downloadable RFC 5545 `.ics` event invites and direct Google Calendar deep links.
- **Administration**: Protected `/admin` dashboard with HMAC-SHA256 authenticated sessions, revenue tracking (distinguishing expected vs. collected cash), booking state management, and CSV export.

---

## Key Features

### 1. Editorial Monochrome Landing Page (`/`)
- Minimalist navigation with wordmark, "The Experience" anchor, and "Book a Session" CTA.
- Striking editorial hero with ₹249 price indicator.
- Three-part service breakdown: Head massage, Neck massage, Shoulder massage (strictly non-clinical relaxation).
- Use-case vignettes: Between classes, demanding workdays, midday pauses.
- Transparent single-tier pricing section.
- Fixed 44px+ mobile sticky CTA bar for one-tap booking from any scroll position.

### 2. Streamlined Mobile-First Booking Engine (`/book`)
1. **Date Picker**: Dynamic 7-day calendar carousel respecting operating days (Monday–Saturday).
2. **Time Slot Selector**: Real-time 15-minute slot grid grouped into Morning, Midday, and Afternoon. Automatically masks past times, sanitation breaks (1:30 PM – 2:15 PM), and occupied slots.
3. **Customer Form**: Mobile number validation (10-digit Indian mobile), student vs. employee toggle, department/affiliation, and optional logistics notes.
4. **Booking Summary**: Complete breakdown of time, venue instructions, and clear physical payment guarantee.
5. **Dedicated Confirmation Permalinks (`/booking/confirmation/[id]`)**: Reference code (e.g. `RR-20261015-8K2D`), arrival guidance, and 1-tap "Add to Google Calendar" and "Download .ics" buttons.

### 3. Concurrency Protection & Double-Booking Prevention
- **Database Level Guarantee**:
  ```sql
  CREATE UNIQUE INDEX idx_unique_active_slot
  ON bookings (booking_date, start_time)
  WHERE booking_status != 'cancelled';
  ```
- If two users submit the exact same slot concurrently, the database atomically accepts the first and rejects subsequent attempts with HTTP `409 Conflict`.
- Cancelling a booking instantly releases the slot for other customers.

### 4. Founder / Admin Management Dashboard (`/admin`)
- Accessible via secure login (`/admin/login`) with server-side HMAC session verification.
- Real-time operational metrics:
  - Today's confirmed sessions
  - Upcoming bookings
  - Sessions completed
  - Pending physical payments
  - **Collected Revenue**: Calculated strictly from bookings where `payment_status = 'paid'`. (Unpaid and cancelled bookings do NOT count toward collected revenue).
  - Google Sheets synchronization health badge.
- Search and filter by customer name, phone, email, booking reference, date, booking status, or payment status.
- Quick action controls: **Mark Done**, **Mark Paid**, **Cancel**.
- One-click CSV export (`/api/export/csv`).

---

## Getting Started Locally

### 1. Prerequisites
- Node.js 18.18+ or 20+ (Node 24 tested)
- npm 9+

### 2. Installation
```bash
git clone <your-repo-url>
cd "Recharge Room"
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default development values are already pre-configured in `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_PASSWORD=admin249
ADMIN_SESSION_SECRET=recharge_room_secure_jwt_session_secret_key_2026_dev
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the customer landing page.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) to log into the founder console (Password: `admin249`).

### 5. Run Automated Tests
```bash
npm test
```
Runs the full suite of concurrency and double-booking prevention tests.

---

## Database Setup (Supabase / PostgreSQL)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Paste the contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.
4. Retrieve your API credentials from **Project Settings > API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret key` → `SUPABASE_SERVICE_ROLE_KEY`
5. Add these keys to your `.env.local` or Vercel environment settings.

---

## Google Sheets Integration Setup

Recharge Room uses a server-side Google Service Account to sync bookings with the founders' operational spreadsheet.

### 1. Create Google Cloud Service Account
1. Go to the [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project (e.g. `Recharge Room Ops`).
3. Enable the **Google Sheets API**.
4. Navigate to **APIs & Services > Credentials > Create Credentials > Service Account**.
5. Name it `recharge-room-sync` and click **Create**.
6. In the **Keys** tab, click **Add Key > Create new key > JSON**.
7. Download the key file. It contains `client_email` and `private_key`.

### 2. Share Target Spreadsheet
1. Create a Google Sheet named **Recharge Room Bookings**.
2. Click **Share** in the top right.
3. Paste your Service Account email (e.g. `recharge-room-sync@your-project.iam.gserviceaccount.com`).
4. Set permission to **Editor** and click **Share**.
5. Copy the Spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`<GOOGLE_SHEET_ID>`**`/edit`

### 3. Configure Environment Variables
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL="recharge-room-sync@your-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID="your_spreadsheet_id_here"
```

The system will automatically initialize the 16 standard columns and sync new bookings and status updates idempotently.

---

## Deployment to Vercel with Custom Domain

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Recharge Room production platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/recharge-room.git
   git push -u origin main
   ```

2. Deploy on [Vercel](https://vercel.com):
   - Click **Add New > Project** and import your GitHub repository.
   - Framework Preset: **Next.js**.
   - In **Environment Variables**, add:
     - `NEXT_PUBLIC_SITE_URL`: `https://rechargeroom.co.in` (or your registered custom domain)
     - `ADMIN_PASSWORD`: Strong production password
     - `ADMIN_SESSION_SECRET`: Long random 32+ character string
     - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
     - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role secret
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email
     - `GOOGLE_PRIVATE_KEY`: Service account private key (with escaped `\n`)
     - `GOOGLE_SHEET_ID`: Target Google Spreadsheet ID
   - Click **Deploy**.

3. Attach Custom Domain:
   - Go to **Project Settings > Domains** in Vercel.
   - Enter `rechargeroom.co.in` (and `www.rechargeroom.co.in`).
     - Set DNS records: A record pointing @ to 76.76.21.21 and CNAME www to cname.vercel-dns.com.
   - Configure the DNS records (A / CNAME) at your domain registrar as instructed by Vercel.

---

## Pre-Launch Operations Checklist

- [ ] Confirm operating hours and breaks in `src/config/business.ts`.
- [ ] Confirm pricing (default: ₹249 for 15 minutes).
- [ ] Run Supabase migration `supabase/migrations/001_initial_schema.sql`.
- [ ] Share Google Sheet with the Service Account email.
- [ ] Set `ADMIN_PASSWORD` in Vercel.
- [ ] Test a live test reservation from a mobile device and verify Google Calendar export.
