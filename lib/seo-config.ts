export const seoConfig = {
  // Site Information
  siteName: 'Lift Planner Pro',
  siteUrl: 'https://liftplannerpro.org',
  description: 'Professional lift planning software for crane operations. Advanced 2D/3D CAD editor, AI-powered safety analysis, load calculations, RAMS generator, route planner for heavy transport, and comprehensive training modules. The complete solution for lift planning professionals.',

  // Default Meta Tags
  defaultTitle: 'Lift Planner Pro - Professional Crane & Lift Planning Software | CAD, RAMS, Safety',
  titleTemplate: '%s | Lift Planner Pro',

  // Keywords (optimized for SEO)
  keywords: [
    // Primary keywords
    'lift planning software',
    'crane planning software',
    'lifting operations software',
    'crane lift plan',
    // Feature keywords
    'CAD software for crane operations',
    'crane load calculator',
    'RAMS generator',
    'risk assessment software',
    'method statement generator',
    // Industry keywords
    'construction safety software',
    'rigging planning tools',
    'heavy lift planning',
    'crane capacity calculator',
    'lifting equipment planning',
    // New features
    'heavy transport route planner',
    'oversized load route planning',
    'bridge height restrictions',
    // Training keywords
    'crane operator training',
    'lifting operations training',
    'safety training LMS',
    // Technical keywords
    '2D CAD editor',
    '3D crane visualization',
    'AI safety analysis',
    'tension calculator',
    'sling angle calculator',
    // Business keywords
    'rigging loft management',
    'equipment certification tracking',
    'lift plan documentation',
    'crane chart software',
    // Location keywords
    'UK lift planning software',
    'construction software UK'
  ],

  // Open Graph (Social Media Sharing)
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://liftplannerpro.org',
    siteName: 'Lift Planner Pro',
    title: 'Lift Planner Pro - Professional Crane & Lift Planning Software',
    description: 'Plan safer lifts with confidence. Professional CAD tools, AI safety analysis, load calculations, RAMS generator, and route planning for heavy transport.',
    images: [
      {
        url: 'https://liftplannerpro.org/api/og-image',
        width: 1200,
        height: 630,
        alt: 'Lift Planner Pro - Professional Crane & Lift Planning Software',
        type: 'image/png',
      }
    ],
  },

  // Twitter Card
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
      content: 'Lift Planner Pro',
    },
    {
      name: 'publisher',
      content: 'Lift Planner Pro',
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
      content: '#0f172a',
    },
    {
      name: 'msapplication-TileColor',
      content: '#0f172a',
    },
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
      content: 'image/png',
    },
    // Geo targeting for UK
    {
      name: 'geo.region',
      content: 'GB',
    },
    {
      name: 'geo.placename',
      content: 'United Kingdom',
    },
    {
      name: 'ICBM',
      content: '51.5074, -0.1278',
    },
  ],

  // Structured Data - Software Application
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Lift Planner Pro',
    description: 'Professional lift planning software for crane operations with advanced 2D/3D CAD tools, AI-powered safety analysis, load calculations, RAMS generator, and route planning for heavy transport.',
    url: 'https://liftplannerpro.org',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0.0',
    offers: {
      '@type': 'Offer',
      price: '29',
      priceCurrency: 'GBP',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '156',
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Organization',
      name: 'Lift Planner Pro',
      url: 'https://liftplannerpro.org',
    },
    screenshot: 'https://liftplannerpro.org/og-image.png',
    featureList: [
      '2D/3D CAD Editor',
      'AI Safety Analysis',
      'Load Calculator',
      'RAMS Generator',
      'Route Planner for Heavy Transport',
      'Team Collaboration',
      'Learning Management System',
      'Equipment Tracking'
    ],
  },

  // Organization Structured Data
  organizationData: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lift Planner Pro',
    url: 'https://liftplannerpro.org',
    logo: 'https://liftplannerpro.org/logo.png',
    description: 'Professional lift planning software for crane operations',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/liftplannerpro',
      'https://linkedin.com/company/liftplannerpro',
      'https://github.com/syntex82/LiftPlannerPro'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@liftplannerpro.org',
      availableLanguage: 'English'
    }
  },

  // WebSite Structured Data (for sitelinks search box)
  websiteData: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lift Planner Pro',
    url: 'https://liftplannerpro.org',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://liftplannerpro.org/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  },

  // FAQ Structured Data
  faqData: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Lift Planner Pro?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lift Planner Pro is professional lift planning software designed for crane operations. It includes 2D/3D CAD tools, AI-powered safety analysis, load calculators, RAMS generators, and route planning for heavy transport.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does Lift Planner Pro cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lift Planner Pro offers a comprehensive professional plan at £29/month with all features included. A free tier is also available for basic functionality.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I plan routes for heavy transport?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Lift Planner Pro includes a Route Planner feature that helps plan safe transportation routes for heavy and oversized loads, identifying hazards like low bridges, weight restrictions, and width limitations.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does Lift Planner Pro generate RAMS documents?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Lift Planner Pro includes an AI-powered RAMS (Risk Assessment and Method Statement) generator that creates professional safety documentation for lifting operations.'
        }
      }
    ]
  }
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

  'route-planner': {
    title: 'Route Planner - Heavy Transport Route Planning | Lift Planner Pro',
    description: 'Plan safe transportation routes for heavy and oversized loads. Identify low bridges, weight restrictions, width limitations, and hazards along the route.',
    keywords: 'heavy transport route planner, oversized load route, bridge height restrictions, weight restrictions, heavy haulage planning',
  },
}
