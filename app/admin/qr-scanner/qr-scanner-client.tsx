"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Html5Qrcode } from "html5-qrcode"
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Loader2,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react"

type ScanResult = {
  valid: boolean
  status?: string
  message: string
  data?: {
    fullName: string
    referenceNumber: string
    overallPercentage: string
    qualificationStatus: string
    schoolYear: string
    examDate: string | null
    publishedAt: string | null
    verificationCode: string
  }
}

function cleanValue(value: string) {
  return decodeURIComponent(value)
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
}

function extractVerificationValue(value: string) {
  const scannedValue = value.trim()

  try {
    const url = new URL(scannedValue)

    const queryValue =
      url.searchParams.get("token") ||
      url.searchParams.get("verification_token") ||
      url.searchParams.get("verificationToken") ||
      url.searchParams.get("verification_code") ||
      url.searchParams.get("code")

    if (queryValue) return cleanValue(queryValue)

    const knownPaths = [
      "/verify-result/",
      "/verify/",
      "/result/verify/",
      "/student/verify/",
    ]

    for (const path of knownPaths) {
      if (url.pathname.includes(path)) {
        const token = url.pathname.split(path)[1]?.split(/[?#&]/)[0]
        if (token) return cleanValue(token)
      }
    }

    const lastSegment = url.pathname.split("/").filter(Boolean).pop()
    return lastSegment ? cleanValue(lastSegment) : ""
  } catch {
    return cleanValue(scannedValue.split(/[?#&]/)[0])
  }
}

export default function QRScannerClient() {
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const [isScanning, setIsScanning] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState("")
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)

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

  async function verifyQr(scannedText: string) {
    await stopScanner()

    const verificationValue = extractVerificationValue(scannedText)

    if (!verificationValue || verificationValue.length < 4) {
      setScanResult({
        valid: false,
        status: "invalid",
        message: "This QR code does not contain a valid CET verification token.",
      })
      return
    }

    setIsChecking(true)
    setError("")

    try {
      const response = await fetch("/api/verify-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: verificationValue,
          code: verificationValue,
        }),
      })

      const result = (await response.json()) as ScanResult
      setScanResult(result)
    } catch {
      setScanResult({
        valid: false,
        status: "error",
        message: "Could not verify this QR code. Please try again.",
      })
    } finally {
      setIsChecking(false)
    }
  }

  async function startScanner() {
    setError("")
    setScanResult(null)
    setIsStarting(true)

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not supported by this browser.")
        return
      }

      scannerRef.current = new Html5Qrcode("qr-reader")

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 12,
          qrbox: (width, height) => {
            const size = Math.floor(Math.min(width, height) * 0.76)

            return {
              width: Math.max(210, Math.min(size, 310)),
              height: Math.max(210, Math.min(size, 310)),
            }
          },
          aspectRatio: 1,
        },
        verifyQr,
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

  async function scanAgain() {
    setScanResult(null)
    setError("")
    await startScanner()
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <>
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
                Scan the result QR and instantly check its authenticity.
              </p>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {!isScanning && !isStarting ? (
                <div className="flex h-[320px] max-h-[48dvh] min-h-[260px] flex-col items-center justify-center px-5 text-center">
                  {isChecking ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin text-red-700" />
                      <p className="mt-4 text-sm font-bold text-slate-900">
                        Checking QR...
                      </p>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-14 w-14 text-red-700" />
                      <p className="mt-4 text-sm font-bold text-slate-900">
                        Ready to scan
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Tap Open Camera and allow browser camera permission.
                      </p>
                    </>
                  )}
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
                  disabled={isStarting || isChecking}
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
              Camera scan only. Uploading QR images is disabled.
            </p>
          </div>
        </div>
      </main>

      {scanResult ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div
              className={
                scanResult.valid
                  ? "bg-gradient-to-br from-green-600 to-emerald-800 px-5 py-7 text-center text-white"
                  : "bg-gradient-to-br from-red-700 to-red-900 px-5 py-7 text-center text-white"
              }
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
                {scanResult.valid ? (
                  <BadgeCheck className="h-9 w-9" />
                ) : (
                  <XCircle className="h-9 w-9" />
                )}
              </div>

              <h2 className="mt-4 text-2xl font-black">
                {scanResult.valid ? "Verified Result" : "Invalid Result"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/90">
                {scanResult.message}
              </p>
            </div>

            <div className="p-5">
              {scanResult.valid && scanResult.data ? (
                <div className="space-y-3">
                  <InfoRow label="Student Name" value={scanResult.data.fullName} />
                  <InfoRow label="Reference No." value={scanResult.data.referenceNumber} />
                  <InfoRow label="Rating" value={scanResult.data.overallPercentage} />
                  <InfoRow label="Status" value={scanResult.data.qualificationStatus} strong />
                  <InfoRow label="School Year" value={scanResult.data.schoolYear} />
                  <InfoRow label="Verification Code" value={scanResult.data.verificationCode} />

                  <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">
                    <ShieldCheck className="mb-1 h-5 w-5" />
                    This QR matches the official CET verification record.
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
                  This QR is invalid, revoked, unpublished, tampered, or not
                  found in the official CET records.
                </div>
              )}

              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={scanAgain}
                  className="h-11 rounded-2xl bg-red-700 text-sm font-black text-white transition hover:bg-red-800"
                >
                  Scan Again
                </button>

                <button
                  type="button"
                  onClick={() => setScanResult(null)}
                  className="h-11 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function InfoRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={
          strong
            ? "mt-1 text-base font-black uppercase text-red-700"
            : "mt-1 break-words text-sm font-bold text-slate-900"
        }
      >
        {value}
      </p>
    </div>
  )
}