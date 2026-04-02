import type { Metadata } from "next"
import { Toaster } from "sonner"
import "./globals.css"

const siteName = "Basilan State College CET Result System"
const siteDescription =
  "Official College Entrance Test result access, program recommendations, and school-year-based result distribution for Basilan State College."

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "Basilan State College",
    "CET result",
    "college entrance test",
    "student result portal",
    "program recommendations",
    "school year result system",
  ],
  authors: [{ name: "Basilan State College" }],
  creator: "Basilan State College",
  publisher: "Basilan State College",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "/",
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Basilan State College CET Result System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.10),transparent_30%)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom_right,rgba(185,28,28,0.03),transparent_45%,rgba(185,28,28,0.05))]" />

          {children}

          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3200}
            toastOptions={{
              classNames: {
                toast: "rounded-2xl",
                title: "text-sm font-semibold",
                description: "text-sm",
              },
            }}
          />
        </div>
      </body>
    </html>
  )
}