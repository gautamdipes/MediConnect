# MediConnect

A full-stack healthcare platform that connects **patients, hospitals, and administrators** through a centralized digital healthcare system. MediConnect enables users to discover hospitals, book appointments, manage medical records, access emergency services, and receive AI-powered healthcare assistance through a modern and intuitive web application.

---

# 🚀 Tech Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Axios
- Lucide React
- React Hot Toast

---

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- JWT Authentication
- Google OAuth
- Bcryptjs
- Multer
- Cloudinary
- Google Gemini AI
- Nodemailer
- Zod
- Helmet
- CORS
- Morgan
- Dotenv

---

# 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- npm

---

# 🔧 Installation

## Clone Repository

```bash
git clone https://github.com/your-username/MediConnect.git
cd MediConnect
```

---

## Backend Setup

```bash
cd BACKEND
npm install
```

Create a `.env` file inside the BACKEND folder.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

GEMINI_API_KEY=your_gemini_api_key
```

---

## Frontend Setup

```bash
cd Frontend
npm install
```

---

# ▶️ Running the Project

## Backend

```bash
cd BACKEND
npm run dev
```

Runs on:

```
http://localhost:5000
```

---

## Frontend

```bash
cd Frontend
npm run dev
```

Runs on:

```
http://localhost:3000
```

---

# 📁 Project Structure

```
MediConnect
│
├── BACKEND
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── validations
│   │   ├── utils
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
│
├── Frontend
│   ├── app
│   │   ├── (auth)
│   │   ├── admin
│   │   ├── dashboard
│   │   ├── hospital
│   │   ├── components
│   │   ├── hooks
│   │   ├── lib
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── package.json
│
└── README.md
```

---

# ✨ Features

## 👤 Patient Portal

- User Registration & Login
- Google Sign-In
- Hospital Search
- Appointment Booking
- Appointment History
- Medical Records
- Profile Management
- AI Health Assistant
- Emergency Hospital Finder

---

## 🏥 Hospital Portal

- Hospital Login
- Dashboard
- Patient Management
- Appointment Management
- Settings
- Secure Logout

---

## ⚙️ Admin Portal

- Admin Dashboard
- User Management
- Hospital Management
- Doctor Management
- Appointment Management
- Analytics
- System Administration

---

# 🔐 Authentication

- JWT Authentication
- Google OAuth Login
- Role-Based Authorization

Supported Roles

- Patient
- Admin
- Hospital

---

# 🤖 AI Features

Powered by **Google Gemini AI**

- AI Health Assistant
- General Health Guidance
- Intelligent User Support

---

# ☁️ File Uploads

Supports uploading:

- Profile Images
- Medical Reports
- Hospital Images

Storage:

- Cloudinary

---

# 🌐 REST API

The backend provides REST APIs for:

- Authentication
- Users
- Hospitals
- Doctors
- Appointments
- Medical Records
- Emergency Services
- AI Assistant

---

# 🛠️ Scripts

## Backend

```bash
npm run dev
```

Development Server

```bash
npm run build
```

Compile TypeScript

```bash
npm start
```

Production Server

---

## Frontend

```bash
npm run dev
```

Development Server

```bash
npm run build
```

Production Build

```bash
npm start
```

Production Server

---

# 🚀 Future Enhancements

- Doctor Portal
- Video Consultation
- Online Payments
- Live Notifications
- Ambulance Tracking
- Multi-language Support

---

# 👨‍💻 Contributors

- Dipesh Gautam

---

# 📄 License

This project was developed for educational and academic purposes.
