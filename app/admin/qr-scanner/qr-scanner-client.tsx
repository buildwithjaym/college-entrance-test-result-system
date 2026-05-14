"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Html5Qrcode } from "html5-qrcode"
import {
  ArrowLeft,
  Camera,
  Loader2,
  QrCode,
  RefreshCcw,
  XCircle,
} from "lucide-react"

export default function QRScannerClient() {
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const [isScanning, setIsScanning] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState("")

  async function startScanner() {
    setError("")
    setIsStarting(true)

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not supported by this browser.")
        setIsStarting(false)
        return
      }

      scannerRef.current = new Html5Qrcode("qr-reader")

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.floor(Math.min(width, height) * 0.72)
            return {
              width: Math.max(190, Math.min(size, 280)),
              height: Math.max(190, Math.min(size, 280)),
            }
          },
          aspectRatio: 1,
        },
        async (decodedText) => {
          await stopScanner()

          try {
            const url = new URL(decodedText)
            const token = url.pathname.split("/verify-result/")[1]

            if (!token) {
              setError("This is not a valid CET verification QR code.")
              return
            }

            window.location.href = `/verify-result/${token}`
          } catch {
            setError("Invalid QR code. Please scan a valid CET verification QR.")
          }
        },
        () => {}
      )

      setIsScanning(true)
    } catch {
      setError(
        "Camera permission was denied or unavailable. Please allow camera access in your browser."
      )
    } finally {
      setIsStarting(false)
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop()
      }

      scannerRef.current?.clear()
      scannerRef.current = null
    } catch {
      scannerRef.current = null
    } finally {
      setIsScanning(false)
      setIsStarting(false)
    }
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <main className="flex min-h-[calc(100dvh-3rem)] items-center justify-center px-3 py-4 sm:px-5">
      <div className="w-full max-w-[430px] overflow-hidden rounded-[1.75rem] border border-red-100 bg-white shadow-xl">
        <div className="bg-gradient-to-br from-red-700 to-red-900 px-4 py-4 text-white sm:px-5">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="inline-flex h-9 items-center gap-2 rounded-full bg-white/10 px-3 text-sm font-bold hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
              <QrCode className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <Camera className="h-6 w-6" />
            </div>

            <h1 className="mt-3 text-xl font-black sm:text-2xl">
              Scan Result QR
            </h1>

            <p className="mt-1 text-xs leading-5 text-red-50 sm:text-sm">
              Open camera, allow permission, then scan the result QR.
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {!isScanning && !isStarting ? (
              <div className="flex h-[320px] max-h-[48dvh] min-h-[260px] flex-col items-center justify-center px-5 text-center">
                <QrCode className="h-14 w-14 text-red-700" />
                <p className="mt-4 text-sm font-bold text-slate-900">
                  Camera is closed
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Browser permission will appear after opening the camera.
                </p>
              </div>
            ) : null}

            <div
              id="qr-reader"
              className={
                isScanning || isStarting
                  ? "h-[320px] max-h-[48dvh] min-h-[260px] overflow-hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
                  : "hidden"
              }
            />
          </div>

          {error ? (
            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-red-800">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : null}

          <div className="mt-3">
            {!isScanning ? (
              <button
                type="button"
                onClick={startScanner}
                disabled={isStarting}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-red-700 px-5 text-sm font-black text-white shadow-lg transition hover:bg-red-800 disabled:opacity-60"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening Camera...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Open Camera
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={stopScanner}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 text-sm font-black text-red-700 transition hover:bg-red-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Stop Scanning
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">
            Camera scan only. QR image upload is disabled.
          </p>
        </div>
      </div>
    </main>
  )
}