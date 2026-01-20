export const seoConfig = {
  // Site Information
  siteName: 'Lift Planner Pro',
  siteUrl: 'https://liftplannerpro.co.uk',
  description: 'Professional lift planning software for crane operations. Advanced CAD editor, AI-powered safety analysis, load calculations, RAMS generator, and comprehensive training modules. Built for lift planning professionals.',

  // Default Meta Tags
  defaultTitle: 'Lift Planner Pro - Professional Crane & Lift Planning Software',
  titleTemplate: '%s | Lift Planner Pro',
  
  // Keywords
  keywords: [
    'lift planning software',
    'crane operations CAD',
    'rigging planning tools',
    'construction safety software',
    'load calculator',
    'RAMS generator',
    'lifting equipment planning',
    'crane chart software',
    'construction project management',
    'safety risk assessment',
    'method statement generator',
    'professional CAD software',
    'lifting operations planning',
    'crane capacity calculator',
    'rigging design software',
    'team collaboration chat',
    'real-time messaging',
    'learning management system',
    'safety training LMS',
    'AI safety analysis',
    'tension calculator',
    'chainblock calculations',
    'step plan module',
    'rigging loft management',
    'equipment certification tracking',
    'CAD collaboration tools',
    'file sharing platform',
    'project sequence planning',
    'lift planning ecosystem'
  ],
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://liftplannerpro.co.uk',
    siteName: 'Lift Planner Pro',
    title: 'Lift Planner Pro - Professional Crane & Lift Planning Software',
    description: 'Professional lift planning software for crane operations. Advanced CAD editor, AI safety analysis, load calculations, and RAMS generator.',
    images: [
      {
        url: 'https://liftplannerpro.co.uk/api/og-image',
        width: 1200,
        height: 630,
        alt: 'Lift Planner Pro - Professional Crane & Lift Planning Software',
        type: 'image/svg+xml',
      },
      {
        url: 'https://liftplannerpro.co.uk/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Lift Planner Pro - Professional Crane & Lift Planning Software',
        type: 'image/svg+xml',
      },
      {
        url: 'https://liftplannerpro.co.uk/hero-background.png',
        width: 1200,
        height: 630,
        alt: 'Lift Planner Pro Interface',
        type: 'image/png',
      }
    ],
  },
  
  // Twitter
  twitter: {
    handle: '@liftplannerpro',
    site: '@liftplannerpro',
    cardType: 'summary_large_image',
  },
  
  // Additional Meta Tags
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'robots',
      content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
    {
      name: 'author',
      content: 'DarkSpace Software & Security',
    },
    {
      name: 'publisher',
      content: 'DarkSpace Software & Security',
    },
    {
      name: 'application-name',
      content: 'Lift Planner Pro',
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'Lift Planner Pro',
    },
    {
      name: 'theme-color',
      content: '#1a1a1a',
    },
    {
      name: 'msapplication-TileColor',
      content: '#1a1a1a',
    },
    // LinkedIn specific meta tags
    {
      property: 'og:image:width',
      content: '1200',
    },
    {
      property: 'og:image:height',
      content: '630',
    },
    {
      property: 'og:image:type',
      content: 'image/svg+xml',
    },
    {
      name: 'linkedin:owner',
      content: 'liftplannerpro',
    },
  ],
  
  // Structured Data
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Lift Planner Pro',
    description: 'Professional lift planning software for crane operations with advanced CAD tools and AI-powered safety analysis.',
    url: 'https://liftplannerpro.co.uk',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '29',
      priceCurrency: 'GBP',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Organization',
      name: 'Lift Planner Pro',
      url: 'https://liftplannerpro.co.uk',
    },
  },
}

export const pageMetadata = {
  home: {
    title: 'Professional CAD Software for Lift Planning | Lift Planner Pro',
    description: 'Plan, design, and execute safe lifting operations with Lift Planner Pro. Features 2D CAD tools, load calculator, RAMS generator, and comprehensive project management.',
    keywords: 'lift planning software, crane operations, CAD software, rigging planning, construction safety',
  },
  
  features: {
    title: 'Features - Advanced Lift Planning Tools | Lift Planner Pro',
    description: 'Discover powerful features including 2D CAD drawing tools, load calculator, RAMS generator, crane charts, and safety resource library.',
    keywords: 'CAD drawing tools, load calculator, RAMS generator, crane charts, safety library',
  },
  
  pricing: {
    title: 'Simple Pricing - Professional Lift Planning Software | Lift Planner Pro',
    description: 'One comprehensive professional plan at £29/month. All features included - CAD tools, RAMS generator, calculators, and more.',
    keywords: 'lift planning pricing, CAD software pricing, professional lifting software',
  },
  
  dashboard: {
    title: 'Dashboard - Manage Your Lift Planning Projects | Lift Planner Pro',
    description: 'Access your lift planning projects, CAD drawings, RAMS documents, and project analytics from your personal dashboard.',
    keywords: 'project dashboard, lift planning projects, CAD project management',
  },
  
  cad: {
    title: 'CAD Editor - Professional 2D Drawing Tools | Lift Planner Pro',
    description: 'Create precise lift plans with professional 2D CAD tools. Features snap-to-grid, layers, dimensions, and export capabilities.',
    keywords: '2D CAD editor, lift plan drawing, construction CAD, rigging diagrams',
  },
  
  calculator: {
    title: 'Load Calculator - Crane Capacity & Safety Factors | Lift Planner Pro',
    description: 'Calculate load weights, crane capacities, and safety factors with integrated crane charts and advanced calculations.',
    keywords: 'load calculator, crane capacity, safety factors, crane charts',
  },
  
  rams: {
    title: 'RAMS Generator - Risk Assessment & Method Statements | Lift Planner Pro',
    description: 'Generate professional Risk Assessment and Method Statements for lifting operations with AI-powered assistance.',
    keywords: 'RAMS generator, risk assessment, method statements, lifting safety',
  },
  
  lms: {
    title: 'Learning Management System - Lift Planning Training | Lift Planner Pro',
    description: 'Comprehensive training modules and certification programs for lift planning professionals and teams.',
    keywords: 'lift planning training, construction safety training, crane operator training',
  },
  
  'rigging-loft': {
    title: 'Rigging Loft Management - Equipment Tracking | Lift Planner Pro',
    description: 'Track lifting equipment certifications, maintenance schedules, and in/out of service status.',
    keywords: 'rigging equipment management, lifting gear tracking, equipment certification',
  },
}
