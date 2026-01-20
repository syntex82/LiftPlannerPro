# Lift Planner Pro

Professional lift planning software for crane operations. Plan safer lifts with confidence.

**Website:** [liftplannerpro.co.uk](https://liftplannerpro.co.uk)

## Features

- **2D/3D CAD Editor** - Professional drawing tools for lift planning
- **AI Safety Analysis** - Automated hazard detection and recommendations
- **Load Calculator** - Crane capacity and safety factor calculations
- **RAMS Generator** - Risk Assessment and Method Statement creation
- **Training (LMS)** - Comprehensive learning management system
- **Equipment Tracking** - Rigging loft and certification management

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## Tech Stack

- Next.js 15 with App Router
- React 18 with TypeScript
- Tailwind CSS
- Prisma with PostgreSQL
- NextAuth.js
- Stripe Payments
- OpenAI GPT-4

## Deployment

Deploy to Vercel, Railway, or any Node.js hosting platform.

For production, update environment variables:
- Set `NEXTAUTH_URL` to your production domain
- Use production Stripe keys
- Configure production database

## License

Proprietary software. All rights reserved.
