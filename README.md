# ArogyaFlow 🏥
### Adaptive OPD Queue Orchestrator

**Hackathon Track:** Track 3 — Jan Jeevan (Technology for Everyday Life & Real-World Indian Challenges)

ArogyaFlow focuses on a critical challenge in India's healthcare system: long, uncertain, and exhausting waiting times in Outpatient Departments (OPDs). The platform leverages modern web technology, real-time data sync, and AI-assisted operational duration estimation to make the OPD experience organized, predictable, and accessible for all patients.

---

## 🎯 Problem Statement

OPD departments in Indian hospitals receive thousands of patients daily. In most hospitals, patients are issued static token numbers and instructed to wait in crowded corridors until called. While this preserves queue order, it provides zero visibility into actual waiting times.

- **Uncertain Wait Times:** A patient with Token #75 cannot predict whether they will be seen in 20 minutes or 2 hours.
- **Overcrowded Waiting Areas:** Fear of missing their turn forces patients—including the elderly, mobility-impaired individuals, pregnant women, and caregivers—to remain crammed in uncomfortable waiting corridors for hours.
- **Economic & Health Burden:** Prolonged exposure in crowded waiting rooms increases cross-infection risks. For daily-wage earners and hourly workers, unpredictable wait times mean lost income and severe financial strain.
- **Lack of Dynamic Communication:** Sudden emergency cases or lengthy consultations cause unexpected queue delays, yet traditional systems fail to inform waiting patients in real time.

**Core Issue:** Traditional token systems show patients *where* they are in line, but never *when* they will actually be attended to.

---

## 💡 Proposed Solution

ArogyaFlow is an intelligent, real-time OPD queue management system designed to eliminate queue uncertainty and minimize crowding outside consultation rooms.

Instead of providing a static token, ArogyaFlow delivers dynamic, live-updating insights:
- 📊 **Current Queue Position**
- 👥 **Number of Patients Ahead**
- ⏳ **Estimated Waiting Time**
- ⏰ **Expected Consultation Time**
- ⚡ **Current Doctor Pace**
- 🚨 **Real-Time Emergency Delays**

### Intelligent Wait Estimation & 3-Zone Guidance
ArogyaFlow utilizes the patient's presenting symptoms/chief complaints to estimate expected consultation duration via Google Gemini 3.6 Flash. It combines these operational estimates with live doctor consultation pace to continuously recalculate expected wait times.

Patients are guided by 3 clear visual status zones:

| Zone | Status | Description |
| :--- | :--- | :--- |
| 🟢 | **Relax / Outside** | Sufficient wait time remains. Patients can comfortably wait in open-air courtyards, cafeterias, or resting zones instead of crowded corridors. |
| 🟡 | **Buffer Zone** | The patient's turn is approaching. The system notifies them to head toward the OPD consultation corridor. |
| 🔴 | **Inside Room Now** | The doctor has called the patient's token. They enter the consultation room immediately. |

*All queue state changes (doctor completing consultations, emergency priority overrides, or skipped tokens) update live without requiring manual page refreshes.*

---

## ♿ Accessibility First

Accessibility in ArogyaFlow is a core architectural priority designed for low-literacy, elderly, and rural users:

- 👁️ **High Contrast & Large Typography:** Clear instructions, color-coded visual indicators, recognizable icons, and enlarged touch targets.
- 🔊 **Hindi Voice Guidance (Web Speech API):** Patients can tap **“सुनें” (Listen)** to hear spoken Hindi audio updates regarding their current queue position and estimated waiting time.
- 📱 **Mobile-First Responsive Design:** Seamless experience across smartphones, tablets, and hospital kiosks.

---

## 🛠️ Technology Stack

ArogyaFlow combines modern web technologies with real-time data orchestration and operational AI:

| Technology | Purpose |
| :--- | :--- |
| **Next.js 14** | Full-stack web application framework & API endpoints |
| **React** | User interface |
| **Tailwind CSS** | Responsive, accessible, high-contrast styling |
| **Lucide Icons** | Visual icon system |
| **Supabase PostgreSQL** | Cloud database for tokens, patients, and queue state |
| **Supabase Realtime** | Real-time websocket queue sync & status updates |
| **Google Gemini 3.6 Flash** | Operational consultation duration prediction based on triage complaints |
| **Web Speech API** | Browser-native Hindi voice synthesis & guidance |
| **Vercel** | Application deployment |

> **Disclaimer:** *The AI module in ArogyaFlow is strictly designed for operational consultation-time estimation and queue prediction. It does not provide medical diagnoses, prescriptions, or clinical triage decisions.*

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm** / **yarn** / **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Anish-Valke/BnB-project.git
   cd BnB-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
