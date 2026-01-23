<p align="center">
  <img src="https://liftplannerpro.org/logo.png" alt="Lift Planner Pro Logo" width="120" />
</p>

<h1 align="center">🏗️ Lift Planner Pro</h1>

<p align="center">
  <strong>Professional Lift Planning Software for Crane Operations</strong>
</p>

<p align="center">
  <a href="https://liftplannerpro.org">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-liftplannerpro.org-blue?style=for-the-badge" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/Maintenance-Active-green?style=flat-square" alt="Maintenance" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Lift Planner Pro** is an enterprise-grade web application designed for professionals in the crane and heavy lifting industry. It provides comprehensive tools for planning, documenting, and managing crane lifting operations with a focus on safety, compliance, and efficiency.

### Why Lift Planner Pro?

- ✅ **Reduce Planning Time** - Automated calculations and AI-assisted planning
- ✅ **Improve Safety** - Comprehensive hazard analysis and safety documentation
- ✅ **Stay Compliant** - Generate industry-standard RAMS and lift plans
- ✅ **Collaborate** - Real-time team chat with video conferencing
- ✅ **Train Teams** - Built-in LMS with interactive training scenarios

---

## ✨ Features

### 🎨 CAD Design Tools

| Feature | Description |
|---------|-------------|
| **2D CAD Editor** | Professional vector drawing tools with layers, snapping, and precision measurements |
| **3D CAD Viewer** | Three.js-powered 3D visualization with crane models and load simulation |
| **Map Import** | Import real-world locations from OpenStreetMap with satellite imagery |
| **PDF Export** | Generate professional lift plan documents |

### 🗺️ Route Planner (NEW!)

| Feature | Description |
|---------|-------------|
| **Heavy Transport Planning** | Plan safe routes for oversized/heavy loads |
| **Hazard Detection** | Identify low bridges, weight restrictions, width limits |
| **Multi-Route Analysis** | Compare routes with safety scoring |
| **PDF Route Plans** | Export comprehensive route documentation |

### 🧮 Calculators & Tools

| Tool | Purpose |
|------|---------|
| **Load Calculator** | Crane capacity, radius, and safety factor calculations |
| **Tension Calculator** | Sling angle and load distribution analysis |
| **Step Plan Generator** | Create sequenced lift operation plans |

### 📚 Documentation & Safety

| Feature | Description |
|---------|-------------|
| **RAMS Generator** | AI-powered Risk Assessment & Method Statement creation |
| **Safety Library** | Comprehensive safety guidelines and regulations |
| **Training Scenarios** | Interactive simulations for operator training |
| **LMS** | Full learning management system with courses and certifications |

### 👥 Team Collaboration

| Feature | Description |
|---------|-------------|
| **Real-time Chat** | Team messaging with file sharing |
| **Video Calls** | WebRTC-powered video conferencing |
| **Screen Sharing** | Share CAD designs and plans live |
| **Project Sharing** | Collaborate on lift plans |

### 💼 Business Tools

| Feature | Description |
|---------|-------------|
| **Rigging Loft** | Equipment inventory and certification tracking |
| **Expense Tracking** | Project cost management |
| **Admin Dashboard** | User management, analytics, and billing |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| ![Next.js](https://img.shields.io/badge/Next.js_15-black?logo=next.js) | React framework with App Router |
| ![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=white) | UI library |
| ![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?logo=typescript&logoColor=white) | Type safety |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) | Utility-first styling |
| ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?logo=shadcnui&logoColor=white) | Component library |
| ![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js) | 3D graphics engine |
| ![Leaflet](https://img.shields.io/badge/Leaflet-199900?logo=leaflet&logoColor=white) | Interactive maps |

### Backend

| Technology | Purpose |
|------------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) | Runtime environment |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white) | Database ORM |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white) | Primary database |
| ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-black?logo=next.js) | Authentication |

### Integrations

| Service | Purpose |
|---------|---------|
| ![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4-412991?logo=openai&logoColor=white) | AI-powered features |
| ![Stripe](https://img.shields.io/badge/Stripe-008CDD?logo=stripe&logoColor=white) | Payment processing |
| ![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?logo=openstreetmap&logoColor=white) | Map data |
| ![OSRM](https://img.shields.io/badge/OSRM-blue) | Route calculation |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App Router │ React 19 │ Tailwind CSS │ shadcn/ui      │
│  Three.js (3D)      │ Leaflet (Maps) │ WebRTC (Video)          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  API Routes (/api/*) │ Server Actions │ Middleware              │
│  NextAuth.js │ Rate Limiting │ Input Validation                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Prisma ORM │ PostgreSQL │ File Storage                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│  OpenAI API │ Stripe │ OpenStreetMap │ OSRM │ Nominatim         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/syntex82/LiftPlannerPro.git
cd LiftPlannerPro

# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:migrate` | Push schema changes |
| `npm run db:seed` | Seed database |

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/liftplannerpro"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# OpenAI (for AI features)
OPENAI_API_KEY="sk-..."

# Stripe (for payments)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."

# Optional: OpenRouteService (for advanced routing)
OPENROUTESERVICE_API_KEY="your-ors-key"

# Optional: Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
```

---

## 📁 Project Structure

```
LiftPlannerPro/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── ai/              # AI-powered endpoints
│   │   ├── chat/            # Team chat API
│   │   ├── projects/        # Project management
│   │   └── ...
│   ├── cad/                 # 2D CAD Editor
│   ├── cad-3d/              # 3D CAD Viewer
│   ├── route-planner/       # Route Planning Tool
│   ├── dashboard/           # Main dashboard
│   ├── training/            # Training scenarios
│   ├── lms/                 # Learning Management System
│   └── ...
├── components/               # React components
│   ├── ui/                  # shadcn/ui components
│   ├── cad/                 # CAD-specific components
│   ├── route-planner/       # Route planner components
│   └── ...
├── lib/                      # Utility functions & services
│   ├── route-planner-service.ts
│   ├── route-planner-types.ts
│   ├── route-plan-pdf.ts
│   └── ...
├── prisma/                   # Database schema & migrations
│   └── schema.prisma
├── public/                   # Static assets
└── styles/                   # Global styles
```

---

## 📡 API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signin` | POST | Sign in user |
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/signout` | POST | Sign out user |

### Projects

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List all projects |
| `/api/projects` | POST | Create project |
| `/api/projects/[id]` | GET | Get project details |
| `/api/projects/[id]` | PUT | Update project |
| `/api/projects/[id]` | DELETE | Delete project |

### AI Features

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/hazard-analysis` | POST | Analyze lift hazards |
| `/api/ai/rams-generator` | POST | Generate RAMS document |

### Chat

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/messages` | GET | Get messages |
| `/api/chat/messages` | POST | Send message |

---

## 🌐 Deployment

### Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### PM2 Deployment (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start npm --name "liftplannerpro" -- start

# Save PM2 config
pm2 save
pm2 startup
```

### Environment Configuration

For production, ensure you:

1. ✅ Set `NEXTAUTH_URL` to your production domain
2. ✅ Use production Stripe keys (not test keys)
3. ✅ Configure secure PostgreSQL connection
4. ✅ Set a strong `NEXTAUTH_SECRET`
5. ✅ Enable SSL/TLS

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features

---

## 📄 License

**Proprietary Software** - All rights reserved.

This software is the exclusive property of Lift Planner Pro. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

For licensing inquiries, contact: [info@liftplannerpro.org](mailto:info@liftplannerpro.org)

---

<p align="center">
  <strong>Built with ❤️ for the Lifting Industry</strong>
</p>

<p align="center">
  <a href="https://liftplannerpro.org">Website</a> •
  <a href="https://liftplannerpro.org/documentation">Documentation</a> •
  <a href="https://liftplannerpro.org/contact">Contact</a>
</p>
