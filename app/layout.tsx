import type { Metadata, Viewport } from "next"
import { Toaster } from "sonner"
import "./globals.css"

const siteName = "College Entrance Test Result System"
const shortName = "CET Result System"

const siteDescription =
  "A secure online platform for College Entrance Test result access, student result downloads, program recommendations, and school-year-based result management."

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://basc-cet.site"

const ogImage = "/new.png"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: `${shortName} | Secure Online CET Results`,
    template: `%s | ${shortName}`,
  },

  description: siteDescription,

  applicationName: siteName,

  keywords: [
    "CET result system",
    "College Entrance Test Result System",
    "college entrance test results",
    "online CET result portal",
    "student result portal",
    "entrance exam result system",
    "CET result checker",
    "online entrance test result",
    "student result download",
    "program recommendation system",
    "school year result management",
    "secure result access",
    "exam result management system",
  ],

  authors: [{ name: "Jaymar Maruji" }],
  creator: "Jaymar Maruji",
  publisher: "Jaymar Maruji",

  category: "education",

  alternates: {
    canonical: siteUrl,
  },

  openGraph: {
    type: "website",
    locale: "en_PH",
    url: siteUrl,
    siteName,
    title: `${shortName} | Secure Online CET Results`,
    description: siteDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "College Entrance Test Result System Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${shortName} | Secure Online CET Results`,
    description: siteDescription,
    images: [ogImage],
    creator: "@jaymmaruji",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      { url: "/new.png", sizes: "32x32", type: "image/png" },
      { url: "/new.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/new.png",
    apple: "/new.png",
  },

  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: "#b91c1c",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-red-100 selection:text-red-900">
        <div className="relative min-h-screen overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.12),transparent_32%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom_right,rgba(185,28,28,0.04),transparent_45%,rgba(185,28,28,0.06))]"
          />

          {children}

          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3200}
            toastOptions={{
              classNames: {
                toast:
                  "rounded-2xl border border-border/60 bg-background/95 shadow-lg backdrop-blur",
                title: "text-sm font-semibold",
                description: "text-sm text-muted-foreground",
                actionButton:
                  "rounded-xl bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800",
                cancelButton:
                  "rounded-xl bg-muted px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/80",
              },
            }}
          />
        </div>
      </body>
    </html>
  )
}