import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'PropNXT — Chennai Property Intelligence | OMR & ECR Price Truth',
    template: '%s | PropNXT Chennai',
  },
  description:
    'Check real registered property prices vs broker quotes for OMR and ECR corridors in Chennai. Flood risk scores, price trends, and investment intelligence for 25+ localities.',
  keywords: [
    'Chennai property price',
    'OMR property price per sqft 2024',
    'ECR property price Chennai',
    'registered property price Chennai',
    'Sholinganallur property rate',
    'Kelambakkam property price',
    'Chennai flood risk property',
    'property investment OMR Chennai',
    'broker vs registered price Chennai',
    'PropNXT',
  ],
  authors: [{ name: 'PropNXT' }],
  creator: 'PropNXT',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://propxla.com',
    siteName: 'PropNXT',
    title: 'PropNXT — Chennai Property Intelligence',
    description:
      'Real registered prices vs broker quotes. Flood risk. Investment scores. 25+ OMR & ECR localities.',
    images: [
      {
        url: 'https://propxla.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PropNXT Chennai Property Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PropNXT — Chennai Property Intelligence',
    description: 'Real registered prices vs broker quotes for OMR & ECR Chennai.',
    images: ['https://propxla.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '-I-_0WtVodYX-biJczrij1lVLoS2YbkNTlWN6ML-Qrw',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-85NYW7J1VF"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-85NYW7J1VF');
          `}
        </Script>
        <div className="glow-orb-1" aria-hidden="true" />
        <div className="glow-orb-2" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
