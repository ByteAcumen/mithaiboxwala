import type { Metadata } from 'next';
import './globals.css';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: `${BUSINESS.brand} — Premium Mithai & Sweet Packaging`,
    template: `%s | ${BUSINESS.brand}`,
  },
  description:
    'Premium mithai boxes, dry-fruit boxes, chocolate boxes, cake boxes, wedding packaging, gift hampers, and customized corporate packaging. 40 years of manufacturing expertise by Ajay Packers, Mirzapur.',
  keywords: [
    'mithai boxes',
    'sweet packaging',
    'dry fruit boxes',
    'chocolate boxes',
    'wedding packaging',
    'gift hampers',
    'corporate gifting',
    'bulk packaging',
    'wholesale packaging',
    'Mirzapur packaging',
    'Ajay Packers',
    'Mithai Box Wala',
  ],
  authors: [{ name: BUSINESS.brand }],
  creator: BUSINESS.brand,
  publisher: BUSINESS.manufacturer,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.mithaiboxes.com',
    siteName: BUSINESS.brand,
    title: `${BUSINESS.brand} — Premium Mithai & Sweet Packaging`,
    description:
      'Premium mithai boxes and packaging solutions. 40 years of manufacturing experience. Wholesale and customized packaging available.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${BUSINESS.brand} — Premium Packaging`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BUSINESS.brand} — Premium Mithai & Sweet Packaging`,
    description: 'Premium mithai boxes and packaging. 40 years manufacturing expertise.',
    images: ['/og-image.jpg'],
  },
  verification: {},
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts: Cormorant Garamond (display serif) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD: Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: BUSINESS.brand,
              alternateName: BUSINESS.manufacturer,
              url: 'https://www.mithaiboxes.com',
              email: BUSINESS.email,
              address: {
                '@type': 'PostalAddress',
                streetAddress: BUSINESS.address.line1,
                addressLocality: BUSINESS.address.city,
                addressRegion: BUSINESS.address.state,
                postalCode: BUSINESS.address.pincode,
                addressCountry: 'IN',
              },
              description:
                'Premium mithai boxes, sweet packaging, and customized packaging manufacturer with 40 years of experience.',
              foundingDate: '1984',
              numberOfEmployees: { '@type': 'QuantitativeValue' },
              sameAs: ['https://www.mithaiboxes.com'],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
