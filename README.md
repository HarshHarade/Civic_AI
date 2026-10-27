# CivicAI – Smart Civic Complaint & AI-Powered Prioritization System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%203.8%20Flash-orange.svg)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Maps-OpenStreetMap%20%2F%20Leaflet-brightgreen.svg)](https://leafletjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)

**CivicAI** is an advanced, production-grade, AI-powered civic grievance and prioritization platform built for urban governance and smart cities (specifically tailored with full territorial and departmental routing for Pune, Maharashtra).

The platform allows citizens to capture and report civic problems in real time using their device camera, reverse-geocoded GPS telemetry, and computer vision AI. CivicAI automatically classifies the issue, calculates a 0–100 urgency score, flags safety hazards, intercepts duplicate complaints, and routes the ticket to the correct municipal or state authority (PMC, PCMC, PMRDA, MSEDCL, Traffic Police, PWD, or Cantonment boards).

---

## 🚀 Key Features

### 1. 📷 Real-Time Camera & Evidence Capture
- **Live Device Camera Viewfinder:** Built using `navigator.mediaDevices.getUserMedia` with video stream, alignment reticle, camera switcher (environment/user), and shutter trigger.
- **Gallery & File Upload:** Multi-photo attachment support (up to 4 high-resolution images) with thumbnail preview, delete, and retake controls.
- **Curated Civic Presets:** One-click sample test photos for potholes, overflowing garbage bins, broken streetlights, water pipeline bursts, and underpass flooding.

### 2. 🤖 AI-Powered Problem Detection & Severity Scoring
- **Server-Side Gemini 3.8 Flash:** Powered by `@google/genai` on Node.js/Express, ensuring API keys are never exposed to the client.
- **Hazard & Severity Assessment:** Automatically estimates severity (`Low`, `Medium`, `High`, `Critical`) and calculates an urgency score (0–100).
- **Public Danger Flagging:** Instantly detects hazards like open manholes, live dangling electrical wires, and submerged subway underpasses.
- **Nearby Duplicate Detection:** Uses geospatial distance checks (within 200m) to identify existing grievances, allowing citizens to **Upvote / Support** existing tickets instead of creating duplicate backlogs.

### 3. 📍 GPS Telemetry & Geocoding
- **Browser Geolocation:** Accurate real-time GPS coordinates (latitude/longitude) with explicit user permission.
- **Reverse Geocoding:** Translates coordinates into readable street addresses, landmarks, localities, and municipal wards.
- **Pune Locality Fast-Selectors:** Direct presets for prominent areas including FC Road, Kothrud, Baner, Hinjawadi Infotech Park, Viman Nagar, Hadapsar, Swargate, MG Road Camp, Khadki, Wakad, and Pimpri.

### 4. 🏛️ Pune-Specific Government Authority Routing
Automated jurisdiction engine that resolves responsible entities based on location coordinates, road ownership, and category:
- **PMC (Pune Municipal Corporation):** Municipal roads, solid waste, drainage, streetlights, and health in Pune urban wards.
- **PCMC (Pimpri Chinchwad Municipal Corporation):** Pimpri, Chinchwad, Wakad, Bhosari, and Nigdi civic services.
- **PMRDA:** Hinjawadi Infotech Park special planning area, peripheral ring roads, and metropolitan corridors.
- **MSEDCL (Mahavitaran):** Overhead high-voltage power lines, electrical distribution poles, feeder pillars, and transformers.
- **Pune City Traffic Police:** Traffic signal sequencing, intersection safety, and transit obstruction.
- **MSRDC & PWD Maharashtra:** Expressways, bypass corridors, and state highway links.
- **Pune & Khadki Cantonment Boards:** Military and civil cantonment areas.

### 5. 🗺️ Interactive Live Map (Leaflet & OpenStreetMap)
- Centered on Pune (`18.5204° N, 73.8567° E`) with custom colored SVG priority markers (Critical = Red, High = Amber, Medium = Blue, Resolved = Emerald Green).
- Multi-facet filters by Category, Priority, Authority, and Status.
- Interactive popups with thumbnail previews, authority details, and direct Google Maps navigation links.

### 6. 🔎 Complaint Tracking & Citizen Quality Audit
- Search by unique tracking number (e.g., `CIV-PUNE-2026-0001`).
- **6-Stage Visual Pipeline:** `Submitted` → `AI Analysis Completed` → `Authority Verification` → `Assigned to Department` → `Work in Progress` → `Resolved`.
- **Before & After Photos:** Side-by-side inspection proof showing ground repairs.
- **Citizen Feedback:** 1–5 star rating and review submission.
- **Reopen Mechanism:** Citizens can reopen unresolved or resurfaced complaints with justification.
- **Downloadable Official Digital Receipt:** Complete with QR code verification hash, SLA targets, and WhatsApp sharing.

### 7. 🛡️ Official & Admin Control Desk
- Secure authentication portal for government officers and administrators.
- **Super Administrator (`Harsh17`):**
  - Universal oversight across all departments and authorities.
  - Ability to reassign misrouted complaints with official audit notes.
  - Status management (Assigned, In Progress, Resolved, Rejected).
  - City-wide emergency citizen broadcast announcements.
  - Fraudulent / spam complaint deletion.
  - Master CSV audit report export.

---

## 📋 15 Civic Categories Monitored

1. **Roads and potholes** (48h SLA)
2. **Garbage collection and overflowing bins** (12h SLA)
3. **Water leakage and water supply** (24h SLA)
4. **Drainage and sewage overflow** (18h SLA)
5. **Broken streetlights** (24h SLA)
6. **Damaged footpaths and pavements** (72h SLA)
7. **Traffic signals and road signs** (12h SLA)
8. **Illegal dumping and public cleanliness** (36h SLA)
9. **Flooding and waterlogging** (6h SLA)
10. **Public toilets and sanitation** (12h SLA)
11. **Tree hazards and fallen branches** (12h SLA)
12. **Public parks and garden maintenance** (96h SLA)
13. **Stray animal-related civic issues** (24h SLA)
14. **Noise or public nuisance** (4h SLA)
15. **Other civic problems** (48h SLA)

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion, Leaflet
- **Backend:** Node.js, Express, `tsx`
- **AI Vision Engine:** Google Gemini API (`@google/genai` model `gemini-3.8-flash`)
- **Maps:** Leaflet & OpenStreetMap
- **Data Store:** In-memory with JSON file persistence (`.data/complaints.json`)

---

## 💻 Local Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or bun

### 1. Clone the repository
```bash
git clone https://github.com/HarshHarade/Civic_AI.git
cd Civic_AI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Optional: Required for live Gemini Vision AI calls.
# If omitted, CivicAI runs in local intelligent heuristic simulation mode.
GEMINI_API_KEY="your_gemini_api_key_here"

# Server Port
PORT=3000
```

### 4. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🔐 Administrative Access Credentials

To access the official government portal:
- Click **"Admin Login"** in the top navigation bar or the **"Authority Portal"** tab.
- Enter the administrator credentials:
  - **Username:** `Harsh17`
  - **Password:** `12345`

---

## 📁 Project Structure

```
├── index.html                   # HTML entry point with Leaflet & Google Fonts
├── metadata.json                # Application metadata
├── package.json                 # Project dependencies & scripts
├── server.ts                    # Express full-stack server & Gemini API integration
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS v4
└── src/
    ├── main.tsx                 # React DOM root entry
    ├── App.tsx                  # Main application orchestrator & routing
    ├── index.css                # Global Tailwind CSS imports
    ├── types/
    │   └── index.ts             # TypeScript domain interfaces
    ├── data/
    │   └── puneData.ts          # Authorities, 15 civic categories & seed data
    ├── services/
    │   └── api.ts               # Frontend REST client & auth helpers
    └── components/
        ├── Navbar.tsx           # Responsive header navigation & user status
        ├── CameraCapture.tsx    # Device camera stream & photo upload
        ├── LocationPicker.tsx   # GPS detection & reverse geocoding
        ├── CategoryIcon.tsx     # Dynamic Lucide icon mapper
        ├── ReportComplaint.tsx  # Multi-step complaint submission wizard
        ├── PuneLiveMap.tsx      # Leaflet interactive map with custom pins
        ├── TrackComplaint.tsx   # Tracking pipeline & citizen audit ratings
        ├── AnalyticsDashboard.tsx # City-wide KPI charts & statistics
        ├── AuthorityPortal.tsx  # Departmental & Super Admin management
        ├── OfficialLoginModal.tsx # Secure login form
        ├── ComplaintReceiptModal.tsx # Downloadable & printable receipt
        ├── NotificationModal.tsx# SMS / WhatsApp dispatch notifications
        ├── HelplineModal.tsx    # Pune emergency contact directory
        └── AboutPuneSystem.tsx  # Civic jurisdiction charter & guide
```

---

## 📜 License
This project is open-source and available under the [Apache-2.0 License](LICENSE).
