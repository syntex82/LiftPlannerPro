export default function BusinessStructuredData() {
  const businessData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DarkSpace Software & Security',
    alternateName: 'Lift Planner Pro',
    description: 'Professional software development company specializing in CAD applications and safety solutions for the lifting and rigging industry.',
    url: 'https://liftplannerpro.org',
    logo: {
      '@type': 'ImageObject',
      url: 'https://liftplannerpro.org/company-logo.png',
      width: 300,
      height: 300
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://liftplannerpro.org/og-image.png',
      width: 1200,
      height: 630
    },
    
    // Contact Information
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+44-20-1234-5678',
        contactType: 'customer service',
        email: 'support@liftplannerpro.org',
        availableLanguage: ['English'],
        areaServed: ['GB', 'US', 'CA', 'AU', 'EU']
      },
      {
        '@type': 'ContactPoint',
        telephone: '+44-20-1234-5679',
        contactType: 'sales',
        email: 'sales@liftplannerpro.org',
        availableLanguage: ['English'],
        areaServed: ['GB', 'US', 'CA', 'AU', 'EU']
      }
    ],

    // Address (if you have a business address)
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GB',
      addressRegion: 'England',
      addressLocality: 'London',
      postalCode: 'SW1A 1AA',
      streetAddress: '123 Business Street'
    },

    // Social Media Profiles
    sameAs: [
      'https://www.linkedin.com/company/liftplannerpro',
      'https://twitter.com/liftplannerpro',
      'https://www.facebook.com/liftplannerpro',
      'https://www.youtube.com/c/liftplannerpro'
    ],

    // Business Details
    foundingDate: '2020',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: '10-50'
    },

    // Industry Classification
    naics: '541511', // Custom Computer Programming Services
    industry: 'Software Development',
    
    // Products/Services
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'SoftwareApplication',
          name: 'Lift Planner Pro',
          description: 'Professional CAD software for lift planning and rigging operations',
          applicationCategory: 'BusinessApplication'
        },
        price: '29',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock'
      }
    ],

    // Aggregate Rating for the Business
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1'
    },

    // Awards and Recognition
    award: [
      'Best CAD Software for Construction 2024',
      'Innovation in Safety Technology 2023',
      'Top Rated Business Software 2023'
    ],

    // Business Hours
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
        validFrom: '2024-01-01',
        validThrough: '2024-12-31'
      }
    ],

    // Additional Business Properties
    slogan: 'Professional CAD Software for Safe Lifting Operations',
    
    // Parent Organization (if applicable)
    parentOrganization: {
      '@type': 'Organization',
      name: 'DarkSpace Software & Security',
      url: 'https://liftplannerpro.org'
    },

    // Certifications
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'ISO 9001:2015 Quality Management',
        recognizedBy: {
          '@type': 'Organization',
          name: 'International Organization for Standardization'
        }
      }
    ],

    // Service Areas
    areaServed: [
      {
        '@type': 'Country',
        name: 'United Kingdom'
      },
      {
        '@type': 'Country',
        name: 'United States'
      },
      {
        '@type': 'Country',
        name: 'Canada'
      },
      {
        '@type': 'Country',
        name: 'Australia'
      }
    ],

    // Knowledge Graph
    knowsAbout: [
      'CAD Software Development',
      'Lift Planning',
      'Rigging Operations',
      'Construction Safety',
      'Load Calculations',
      'Project Management Software',
      'Safety Analysis',
      'Engineering Software'
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(businessData, null, 2)
      }}
    />
  )
}
