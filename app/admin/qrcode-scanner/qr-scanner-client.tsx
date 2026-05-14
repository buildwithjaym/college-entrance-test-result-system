"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Html5QrcodeScanner } from "html5-qrcode"
import { ArrowLeft, Camera, QrCode, XCircle } from "lucide-react"

export default function QRScannerClient() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        rememberLastUsedCamera: true,
      },
      false
    )

    scannerRef.current.render(
      async (decodedText) => {
        await scannerRef.current?.clear()

        try {
          const scannedUrl = new URL(decodedText)
          const token = scannedUrl.pathname.split("/verify-result/")[1]

          if (!token) {
            setError("This QR code is not a valid CET result verification QR.")
            return
          }

          window.location.href = `/verify-result/${token}`
        } catch {
          setError("Invalid QR code. Please scan a valid CET verification QR.")
        }
      },
      () => {}
    )

    return () => {
      scannerRef.current?.clear().catch(() => {})
    }
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(185,28,28,0.16),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom_left,rgba(185,28,28,0.06),transparent,rgba(185,28,28,0.1))]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-primary/15 bg-background/95 p-5 shadow-2xl backdrop-blur sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/admin"
              className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <QrCode className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Camera className="h-10 w-10 text-primary" />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              CET Verification Scanner
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
              Scan Result QR Code
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Scan the QR code from a result document. The system will open the
              official verification page automatically.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-primary/10 bg-white p-3 shadow-sm">
            <div id="qr-reader" className="overflow-hidden rounded-2xl" />
          </div>

          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}