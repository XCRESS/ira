import Script from 'next/script'

interface StructuredDataProps {
  data: Record<string, unknown>
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IRA - IPO Readiness Assessment',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://irascore.com',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://irascore.com'}/ira_logo.png`,
    description: 'Professional IPO readiness assessment for BSE, NSE, NYSE & NASDAQ. Expert financial analysis for companies planning to go public.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'send@irascore.com',
    },
    sameAs: [
      'https://twitter.com/irascore',
      'https://www.linkedin.com/company/irascore',
    ],
  }

  return <StructuredData data={schema} />
}

export function WebApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'IRA - IPO Readiness Assessment',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://irascore.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
  }

  return <StructuredData data={schema} />
}

export function ServiceSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'IPO Readiness Assessment',
    provider: {
      '@type': 'Organization',
      name: 'IRA',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://irascore.com',
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'IPO Assessment Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'BSE Listing Assessment',
            description: 'Comprehensive IPO readiness assessment for BSE listing',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'NSE Listing Assessment',
            description: 'Comprehensive IPO readiness assessment for NSE listing',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'NYSE Listing Assessment',
            description: 'Comprehensive IPO readiness assessment for NYSE listing',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'NASDAQ Listing Assessment',
            description: 'Comprehensive IPO readiness assessment for NASDAQ listing',
          },
        },
      ],
    },
  }

  return <StructuredData data={schema} />
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <StructuredData data={schema} />
}

export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return <StructuredData data={schema} />
}
