# 🫶 AidLink
### Connecting People Who Need Help with Those Who Can Offer It

AidLink is a community-driven web platform that makes it easy to **request help**, **volunteer to assist**, and **connect through built-in chat** — all in one place.

---

## 🚀 Features
- 🧍 **User Authentication** – Secure Google sign-in with Firebase Auth  
- 🤝 **Help Requests** – Users can create, edit, and manage their own requests  
- 💬 **Real-Time Chat** – Automatically connects requesters and volunteers for coordination  
- 📊 **Dashboard** – Displays live statistics and graphs for community activity  
- 💡 **Discussion Boards** – Create or join public discussion spaces with group chat support  
- 🔍 **Search & Filter** – Easily browse all requests and find ones to volunteer for  

---

## 🛠️ Tech Stack
- **Frontend:** Next.js, React, Tailwind CSS  
- **Backend & Database:** Firebase Firestore  
- **Authentication:** Firebase Auth (Google)  
- **Hosting:** Vercel  

---



1. **Clone this repository:**
   ```bash
   git clone https://github.com/<your-username>/aidlink.git
   cd aidlink
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Add your Firebase config:**
   Create a `.env.local` file and include your Firebase keys:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:3000`

---
## 🌍 Future Plans
- 💰 Donation system (Stripe integration)  
- 📅 Event coordination calendar  
- 📍 Interactive map for local help requests  
- 📱 Mobile app version  

---

## 💬 Contact
Created by **Shree Manickaraja** for the **2025 MH Rotary Club Hackathon**.  
Feel free to reach out or contribute!  

🌐 **Live Site:** [aid-link-team.vercel.app](https://aid-link-team.vercel.app)  
📧 **Email:** shree.manickaraja@gmail.com
