interface SchemaMarkupProps {
  type: 'Organization' | 'SoftwareApplication' | 'Product' | 'Article' | 'FAQ' | 'BreadcrumbList'
  data: any
}

export default function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    }

    switch (type) {
      case 'Organization':
        return {
          ...baseSchema,
          name: 'DarkSpace Software & Security',
          url: 'https://liftplannerpro.org',
          logo: 'https://liftplannerpro.org/company-logo.png',
          sameAs: [
            'https://twitter.com/liftplannerpro',
            'https://linkedin.com/company/liftplannerpro',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-555-123-4567',
            contactType: 'customer service',
            email: 'support@liftplannerpro.com',
          },
          ...data
        }

      case 'SoftwareApplication':
        return {
          ...baseSchema,
          name: 'Lift Planner Pro',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '29',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '127',
          },
          ...data
        }

      case 'FAQ':
        return {
          ...baseSchema,
          mainEntity: data.questions?.map((q: any) => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: q.answer,
            },
          })) || [],
        }

      case 'BreadcrumbList':
        return {
          ...baseSchema,
          itemListElement: data.items?.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })) || [],
        }

      default:
        return baseSchema
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateSchema())
      }}
    />
  )
}

// Example usage:
// <SchemaMarkup 
//   type="SoftwareApplication" 
//   data={{
//     name: "Lift Planner Pro",
//     description: "Professional CAD software for lift planning",
//     url: "https://liftplannerpro.org"
//   }} 
// />
