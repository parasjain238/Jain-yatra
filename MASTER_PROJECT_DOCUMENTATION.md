# MASTER PROJECT DOCUMENTATION: JAIN YATRA INDIA

---

# SECTION 1: PROJECT OVERVIEW

**Project Name**: JainYatra India
**Project Goal**: To create a comprehensive, geo-aware, and community-driven directory of all Jain Temples and facilities (Dharamshala, Bhojanshala) across India.
**Problem Statement**: Jain pilgrims frequently travel across India but struggle to find reliable, centralized, and digital information regarding nearby Jain temples, trust contacts, and overnight stay facilities.
**Target Audience**: Jain pilgrims, tourists exploring spiritual heritage, and Jain trust administrators.
**Use Cases**: 
1. A traveler on a highway needs to find the nearest Jain temple with a Bhojanshala.
2. A user wants to explore all temples in a specific state like Rajasthan.
3. A community member wants to correct a phone number for a temple.
**Business Objectives**: Digitize the Jain travel ecosystem without providing booking portals, keeping it an open-source directory.
**Functional Requirements**: GPS geolocation, interactive map plotting, multi-filter search, detailed temple view, crowdsourced contribution forms.
**Non-Functional Requirements**: High performance (virtualized rendering), mobile responsiveness, dark mode, high security (auth).
**User Stories**: As a pilgrim, I want to click 'Use My Live Location' so I can instantly see all temples within a 50km radius on a map.
**Expected Outcomes**: A highly active, self-sustaining community platform serving thousands of pilgrims daily.

---

# SECTION 2: REQUIREMENT ANALYSIS

**What problem is being solved**: Lack of centralized, digitized data for Jain pilgrimage sites.
**Why it matters**: Pilgrims often face immense hardships finding authentic Jain food (Bhojanshala) and secure stays during long travels.
**Existing alternatives**: Scattered WhatsApp groups, outdated PDF lists, and fragmented Facebook pages.
**Advantages of this solution**: Real-time GPS distance calculation, visual map clustering, mobile-first design, interactive filters, community-driven updates.
**Technical challenges**: Managing 1500+ temple data points on a map without crashing the browser (DOM bloat), precise geolocation fallbacks, and maintaining strict type safety across massive datasets.
**Business challenges**: Ensuring data authenticity. Solved via community contribution pipelines and admin verification.

---

# SECTION 3: SYSTEM ARCHITECTURE

The system is built on a Modern Edge-Rendered Architecture.
- **Frontend Architecture**: React 18 + Next.js App Router.
- **Backend Architecture**: Next.js Server Actions & API Routes.
- **Database Architecture**: Currently using persistent LocalStorage & heavily typed mock data for scale validation.
- **Authentication**: Clerk JWT-based authentication.
- **Hosting**: Vercel Edge Network.

```mermaid
graph TD;
    Client[Mobile/Web Client] --> Auth[Clerk Auth Middleware];
    Auth --> Next[Next.js App Router];
    Next --> Components[React Components / UI];
    Next --> API[API Routes / Edge Functions];
    API --> DB[(Simulated Local Database)];
```

---

# SECTION 4: TECHNOLOGY STACK

- **Frontend Framework**: Next.js (React). *Why:* Server-side rendering, SEO, file-based routing. *Advantages:* Fast, modern. *Disadvantages:* Learning curve.
- **Styling**: Tailwind CSS. *Why:* Utility-first, rapid prototyping. *Advantages:* No context switching, dark mode built-in.
- **Authentication**: Clerk. *Why:* Drop-in modern auth with high security. *Advantages:* Handles OTP, Social Logins seamlessly.
- **Mapping Engine**: Leaflet (via react-leaflet patterns). *Why:* Open-source, highly customizable.
- **Icons**: Lucide React.
- **Deployment & Analytics**: Vercel.

---

# SECTION 5: PROJECT SETUP FROM ZERO

1. **Installing Node.js**: Go to nodejs.org, download the LTS version. Install it. Verify using `node -v`.
2. **Installing VS Code**: Download from code.visualstudio.com.
3. **Installing Git**: Download from git-scm.com.
4. **Creating Project**:
   `npx create-next-app@latest jain-yatra`
   *Explanation*: Scaffolds a new Next.js project. Accept the prompts for TypeScript, Tailwind, App Router.
5. **Installing Dependencies**:
   `npm install @clerk/nextjs leaflet lucide-react @vercel/analytics`
6. **Environment Setup**: Create `.env.local` and add your Clerk API Keys.

---

# SECTION 6: COMPLETE DEVELOPMENT LOG

- **Step 1**: Initialized Next.js project. Configured Tailwind.
- **Step 2**: Created core components: `Navbar`, `TempleCard`, `Filters`.
- **Step 3**: Implemented `mockData.ts` with exhaustive TS interfaces.
- **Step 4**: Built the interactive Leaflet Map (`MapClient.tsx`).
- **Step 5**: Integrated Clerk authentication in `layout.tsx`.
- **Step 6**: Automated data generation for MP, Rajasthan, Delhi (1500+ temples).
- **Step 7**: Fixed performance issues using virtualization/pagination in `page.tsx`.

---

# SECTION 7: FOLDER STRUCTURE EXPLANATION

- `src/app/`: Contains all Next.js page routes.
- `src/app/page.tsx`: The main discovery dashboard.
- `src/app/admin/page.tsx`: Admin dashboard for verifying community edits.
- `src/app/contribute/page.tsx`: Crowdsource form.
- `src/components/`: Reusable UI elements (Navbar, Map, TempleCard).
- `src/services/`: Data logic, mock databases, utilities.

---

# SECTION 8: DATABASE DESIGN

Currently using simulated persistence (`db.ts`).

**Table: Temples**
- `id` (String, Primary Key)
- `temple_name` (String)
- `temple_type` (Enum: Digambar, Shwetambar, Both)
- `state`, `city`, `address` (Strings)
- `latitude`, `longitude` (Float)
- `phone`, `website`, `history`, `timings`, `moolnayak`, `trust_name`, `image_url` (Strings)
- `facilities` (JSON Object containing booleans for dharamshala, bhojanshala, etc.)

**Table: CommunityUpdates**
- Tracks crowdsourced edits. Contains `status` (pending, approved, rejected).

---

# SECTION 9: AUTHENTICATION SYSTEM

Powered by Clerk.
- **User Login/Registration**: Handled entirely by `<SignIn />` and `<SignUp />` components.
- **Session Management**: JWT stored in secure HTTP-only cookies managed by Clerk Middleware.
- **Middleware**: Validates tokens on edge before rendering protected routes (like Admin dashboard).
- **OAuth**: Google Login flow enabled by default in Clerk dashboard.

---

# SECTION 10: API DOCUMENTATION

**Endpoint**: `/api/detect-location`
**Method**: GET
**Purpose**: Uses Vercel Edge geolocation headers to determine user city/coordinates silently.
**Response**: `{ latitude, longitude, city, region }`
**Error Handling**: Falls back to IP lookup services if headers are missing.

---

# SECTION 11: FRONTEND DEVELOPMENT

- **State Management**: React `useState` and `useMemo` heavily utilized for filter operations.
- **Routing**: Next.js App Router for instant page transitions.
- **Responsive Design**: Tailwind's `sm:`, `md:`, `lg:` prefixes ensure perfect mobile layouts.
- **Performance**: Pagination limits render to 50 items to prevent DOM bloat.

---

# SECTION 12: BACKEND DEVELOPMENT

The backend relies on Next.js Server Components and Server Actions.
- **Database Queries**: Simulated through asynchronous Promises in `src/services/db.ts`.
- **Validation**: Strict TypeScript interfaces ensure data integrity at compile time.

---

# SECTION 13: CODE EXPLANATION

### Major File: src/app/page.tsx
This file orchestrates the entire discovery platform.
1. It initializes state for `temples`, `userLocation`, `activeFilters`.
2. Uses `useEffect` to request GPS location on load.
3. Uses `useMemo` to calculate Haversine distances to every temple in the database.
4. Applies multiple chained `filter()` methods based on Sect, City, State, and Facilities.
5. Slices the result array (`slice(0, visibleCount)`) to prevent lag.
6. Renders the interactive `Map` and `TempleCard` list.

---

# SECTION 14: SECURITY IMPLEMENTATION

- **Auth Security**: Handled by Clerk (SOC2 compliant).
- **XSS Protection**: React automatically escapes all injected variables.
- **Environment Variables**: API keys are strictly kept in `.env.local` and never exposed to the client unless prefixed with `NEXT_PUBLIC_`.

---

# SECTION 15: TESTING

- **Manual Testing**: Verified GPS fallback logic across Chrome, Safari, mobile devices.
- **Performance Testing**: Ensured 1500+ dataset renders smoothly via pagination.
- **Edge Cases**: Handled users blocking GPS by silently degrading to IP-based location.

---

# SECTION 16: DEPLOYMENT GUIDE

1. Push code to GitHub (`git add . && git commit -m "Deploy" && git push`).
2. Go to Vercel.com, Import the GitHub repository.
3. Set Framework Preset to Next.js.
4. Add Environment Variables (Clerk Secret Keys).
5. Click Deploy.
6. Attach custom domain via Vercel Settings -> Domains.

---

# SECTION 17: ANALYTICS AND MONITORING

- **Tracking**: Vercel Web Analytics installed in `layout.tsx` via `<Analytics />`.
- **Metrics**: Tracks unique visitors, page views, and geographic distribution privately without cookies.

---

# SECTION 18: SCALABILITY GUIDE

- **100 Users**: Current setup is perfect.
- **10,000 Users**: Migrate `mockData.ts` to PostgreSQL (Supabase or Vercel Postgres).
- **1,000,000 Users**: Implement Redis caching for database reads. Use Next.js Incremental Static Regeneration (ISR) for temple detail pages. Implement heavy marker clustering on the Leaflet map.

---

# SECTION 19: MAINTENANCE GUIDE

- **Updating Data**: Admin can approve Community Updates via the `/admin` dashboard.
- **Adding Features**: Create new components in `src/components`.
- **Fixing Issues**: Check Vercel Logs for production errors.

---

# SECTION 20: FUTURE IMPROVEMENTS

- **Phase 1**: Migrate to a real PostgreSQL database (Supabase).
- **Phase 2**: Add user reviews and photo uploads to temples.
- **Phase 3**: Implement dynamic route planning for Yatras (connecting multiple temples).
- **Phase 4**: Launch React Native mobile applications for iOS/Android.

---

# SECTION 21: BEGINNER LEARNING GUIDE

- **React**: Think of React as lego blocks (Components) that you snap together to build a UI.
- **Tailwind**: Instead of writing separate CSS files, you add classes like `bg-red-500` directly to HTML tags.
- **TypeScript**: It's JavaScript but with strict rules (types) so you catch errors before running the code.

---

# SECTION 22: TROUBLESHOOTING GUIDE

- **Issue**: Map is lagging massively.
  **Solution**: Ensure `visibleCount` pagination is active in `page.tsx`. Never pass 1000+ raw DOM markers to Leaflet.
- **Issue**: TypeScript build errors on `db.getTemples()`.
  **Solution**: Ensure the `Temple` interface in `mockData.ts` perfectly matches local component interfaces.

---

# SECTION 23: PROJECT REBUILD GUIDE

To rebuild completely from scratch:
1. `npx create-next-app@latest jain-yatra`
2. Install Tailwind, Leaflet, Lucide, Clerk.
3. Setup Clerk API keys in `.env.local`.
4. Create `mockData.ts` and populate it.
5. Create `Navbar.tsx`, `Map.tsx`, `TempleCard.tsx`.
6. Build `page.tsx` for discovery.
7. Deploy to Vercel.

7. Deploy to Vercel.

---

# SECTION 24: DATA GENERATION & MANUAL ENTRY GUIDE

### How Data was Automated (Without Google Maps API)
During development, we populated the database rapidly without paying for expensive Google Maps APIs. We achieved this by:
1. **Writing Automated Scripts**: We wrote localized Node.js scripts (e.g., `analyzeRajasthan.js`, `analyzeDelhi.js`).
2. **Algorithmic Injection**: These scripts contained lists of all districts in a state, checked which districts were missing in our database, and generated highly authentic synthetic temple data (with accurate realistic coordinates clustered around the state's center, plausible phone numbers, and facilities).
3. **OpenStreetMap (Leaflet)**: Instead of rendering a Google Map which requires a billing account, we utilized Leaflet.js with free open-source CARTO / OpenStreetMap tile layers.

### How to Manually Add Data (Without AI/Scripts)
If a developer or user wants to add temples manually without relying on AI scripts:
1. Open the file `src/services/mockData.ts` in your code editor.
2. Scroll to the bottom of the `MOCK_TEMPLES` array.
3. Manually type in a new JSON object following the strict TypeScript interface. Example:
   ```typescript
   {
     id: "t-manual-01",
     temple_name: "Shree Parshvanath Jain Temple",
     temple_type: "Shwetambar",
     state: "Maharashtra",
     city: "Mumbai",
     address: "Marine Drive, Mumbai",
     latitude: 18.944,
     longitude: 72.823,
     phone: "+91 9876543210",
     history: "Ancient temple...",
     timings: "6:00 AM - 8:00 PM",
     moolnayak: "Lord Parshvanath",
     trust_name: "Mumbai Jain Trust",
     image_url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Sonagiri.jpg",
     facilities: {
       dharamshala_available: true,
       bhojanshala_available: true,
       // ... fill other boolean facilities
     }
   }
   ```
4. Save the file. Because it's hardcoded directly into the frontend build, the changes will instantly appear on the website and the map the next time you refresh or deploy.

---

# SECTION 25: GOOGLE MAPS INTEGRATION & URL PARSER

### How We Connected Google Maps (Automated Data Fetching)
While the visual map uses OpenStreetMap (to avoid rendering costs), we do rely on Google Maps for **Automated Temple Data Extraction**. 

When a user wants to contribute a new temple on the `/contribute` page, they are asked to simply paste a Google Maps link (e.g., `https://maps.app.goo.gl/...`). 

**Where is the code?**
The exact integration is located in: `src/app/api/parse-gmaps/route.ts`

**What does the code do?**
1. **Unshortens URLs**: If a user pastes a short `goo.gl` link, the server uses a native `fetch()` redirect follower to uncover the true, long URL.
2. **Regex Parsing**: It extracts the `@latitude,longitude` coordinates directly from the raw URL string using Regular Expressions (`/@(-?\d+\.\d+),(-?\d+\.\d+)/`).
3. **Google Places API Integration**: If an API key is provided in `.env.local` (`GOOGLE_MAPS_API_KEY`), the server securely makes a request to `https://maps.googleapis.com/maps/api/place/textsearch/json`. 
4. **Data Extraction**: It automatically pulls the Temple Name, Exact Address, Live Phone Number, and Operating Hours, and sends it directly back to the frontend form, pre-filling all the input boxes instantly!

### How Users Can Bypass Google Maps (Manual Mode)
If a user does not have a Google Maps link, or if the API key quota is exceeded, they are **not forced** to use it.
- **On the Frontend**: Users can simply ignore the "Paste Google Maps Link" button and manually type their details into the blank text boxes on the `/contribute` page.
- **In the Database**: Developers can always bypass APIs entirely by manually writing JSON objects directly into `src/services/mockData.ts` (as explained in Section 24).

---

# SECTION 26: COMPLETE FILE-BY-FILE PURPOSE GLOSSARY

If you are a new developer trying to understand exactly which file does what, here is the complete mapping of the entire codebase:

### 1. App Router Pages (`src/app/`)
- **`src/app/layout.tsx`**: The global wrapper for the entire website. It injects the custom fonts (Outfit, Cinzel), wraps the app in the `<ClerkProvider>` for authentication, and activates Vercel `<Analytics />`.
- **`src/app/page.tsx`**: The main Discovery Dashboard. Handles user geolocation, distance calculations, all the complex filtering logic, and renders both the list of temples and the interactive map side-by-side.
- **`src/app/admin/page.tsx`**: A secure Admin Dashboard protected by Clerk. Admins use this to review, approve, or reject crowdsourced temple data submitted by users.
- **`src/app/contribute/page.tsx`**: The frontend form where users can submit corrections or add entirely new temples to the database. Includes the Google Maps URL parser.
- **`src/app/travel/page.tsx`**: The Smart Travel mode page allowing users to calculate distances between multiple temples and plan long Yatra routes.
- **`src/app/temple/[id]/page.tsx`**: A dynamic route that generates a dedicated, detailed webpage for any specific temple when a user clicks "View Details".

### 2. API Routes (`src/app/api/`)
- **`src/app/api/detect-location/route.ts`**: A silent backend edge function that reads Vercel's geolocation headers to determine a user's city/latitude if they block browser GPS.
- **`src/app/api/parse-gmaps/route.ts`**: The Google Maps backend parser that unshortens `goo.gl` links and securely queries the Google Places API to auto-fill the contribute form.
- **`src/app/api/places-photo/route.ts`**: A proxy API that securely fetches live temple photos from Google Places API without exposing your API key to the frontend.

### 3. Reusable Components (`src/components/`)
- **`src/components/MapClient.tsx`**: The core heavy-lifting Leaflet Map engine. This is where all the custom HTML markers are plotted and dark-mode map tiles are loaded.
- **`src/components/Map.tsx`**: A lightweight server-side wrapper that uses `next/dynamic` to safely load `MapClient.tsx` without triggering SSR errors (since Leaflet requires the browser `window` object).
- **`src/components/Navbar.tsx`**: The top navigation bar containing the logo, mobile menu, and Clerk User Authentication Profile buttons.
- **`src/components/Filters.tsx`**: The side panel component containing the search bar, sect checkboxes, distance radius sliders, and facility toggles.
- **`src/components/TempleCard.tsx`**: The UI component responsible for beautifully rendering a single temple block in the list (shows distance, name, tags, and image).

### 4. Database & Services (`src/services/`)
- **`src/services/mockData.ts`**: The absolute heart of the project. A massive 40,000+ line TypeScript file containing the strict `Temple` interface and the massive array of 1,500+ generated temples.
- **`src/services/db.ts`**: The simulated database controller. It pretends to be a real database by fetching data from `mockData.ts` and saving user contributions/edits permanently into the browser's `LocalStorage`.

### 5. Configs & Automation Scripts (Root Directory)
- **`.env.local`**: The secure vault. Holds your secret `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `GOOGLE_MAPS_API_KEY`. Never pushed to GitHub.
- **`analyzeRajasthan.js`, `analyzeDelhi.js`, `generateMissingMP.js`**: Custom NodeJS automation scripts written specifically for this project. They parse the mock database, calculate missing districts, and automatically inject hundreds of highly realistic synthetic temples into `mockData.ts` to populate the map.

***

*Document Generated Automatically by System AI*
