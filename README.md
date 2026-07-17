# ⚡ WZPDCL – West Zone Power Distribution Company Limited

**Sales & Distribution Division‑1, Kushtia | HQ Khulna**

A full‑stack **Production‑Ready** electricity distribution management system built with **Next.js**, **Express.js**, **TypeScript**, **MongoDB** and **Stripe**.  
Consumers can pay bills, apply for new connections, track complaints, and administrators can manage the entire workflow through role‑based dashboards.

---

## 📸 Screenshots

<!-- You can add real screenshots later -->
![Landing Page](https://i.ibb.co.com/LDYysd6h/images.jpg)
![Dashboard](https://i.ibb.co.com/21wGWQ9Q/aicontrolled-smart-grids-optimizing-energy-distribution-realtime-cities-energy-systems-using-ai-moni.avif)

---

## 🧰 Technology Stack

| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| **Frontend**   | Next.js 16 (App Router), TypeScript, Tailwind CSS (Emerald theme) |
| **Backend**    | Express.js, TypeScript, MongoDB Native Driver  |
| **Auth**       | better‑auth (JWT, social login) + cookie‑based |
| **Payments**   | Stripe (Checkout Sessions, Payment Intents)    |
| **Image Upload**| ImgBB API                                      |
| **Charts**     | Recharts                                        |
| **Icons**      | Lucide React, React Icons                       |
| **Deployment** | Vercel (frontend & backend separately)         |

---

## 🎯 Key Features

### 🔹 Public (No Login)
- **Pay Bill** – search by meter number → view unpaid bill → pay via Stripe
- **Home Page** – sliding banner, about, contact, FAQ
- **Payment Success** – auto‑confirms payment and updates status

### 🔹 Consumer Dashboard
- **My Bills** – view bills after claiming a meter
- **Claim Meter** – search & claim an unclaimed meter
- **New Connection** – apply with payment (Stripe) → XEN approval
- **My Complaints** – register complaint (meter required) → track status
- **Profile** – update info, change password, upload photo

### 🔹 XEN (Executive Engineer) Dashboard
- **All Consumers** – registered & unregistered list
- **Connection Applications** – approve / reject (with reason modal)
- **All Complaints**, **All Bills**, **All Transactions**
- **Financial Statistics** – monthly bar chart, paid vs due pie chart

### 🔹 Connection Wing Dashboard
- **Applications** – send team, complete & assign meter
- **All Meters** – add, replace, delete inactive meters
- **New Connection Stats** – last 12 months bar chart

### 🔹 Billing Wing Dashboard
- **Generate Bills** – select meter, enter reading, preview & generate
- **All Bills** – search, filter, edit unpaid bills
- **All Consumers** – grouped by meter, detail modal
- **Statistics** – monthly amount, bill count, paid vs due

### 🔹 Complaint Manager Dashboard
- **All Complaints** – send team, resolve

### 🔹 Admin Dashboard
- **User Management** – list, change role, delete (self‑protection)
- **Rate Settings** – update connection fees, security deposits, bill rates
- **Profile** – update info, change password

---

## 🗄️ Database Collections (MongoDB)

`users` (auth), `meters`, `bills`, `transactions`, `connections`, `complaints`, `reviews`, `settings`

---

## 📡 API Endpoints (Backend)

| Prefix               | Description                      |
|----------------------|----------------------------------|
| `/api/auth/*`        | Register, login, Google, profile |
| `/api/meters/*`      | Claim, list, replace, delete     |
| `/api/bills/*`       | Generate, list, edit, pay        |
| `/api/payments/*`    | Stripe checkout, transactions    |
| `/api/connections/*` | Apply, XEN review, wing action   |
| `/api/complaints/*`  | Register, list, resolve          |
| `/api/consumers/*`   | Add unregistered consumer        |
| `/api/public/*`      | Public bill search & payment     |
| `/api/admin/*`       | User & settings management       |

> Full API documentation is available in the code or can be generated with Postman.

---

## 💻 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas (or local MongoDB)
- Stripe account (test keys)

### 1. Clone the repositories

```bash
# Backend
git clone https://github.com/mehedyPUST/WZPDCL-Backend.git
cd WZPDCL-Backend
npm install

# Frontend
git clone https://github.com/mehedyPUST/WZPDCL-Frontend.git
cd WZPDCL-Frontend
npm install