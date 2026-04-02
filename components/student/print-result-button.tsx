"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

const EXPORT_WIDTH = 1600
const EXPORT_HEIGHT = 800

function sanitizeFileName(value: string) {
  return value
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function getSourceElement() {
  return document.getElementById("result-slip-export") as HTMLElement | null
}

function getMeta(source: HTMLElement) {
  const referenceNumber = source.getAttribute("data-reference-number") || "CET"
  const lastName = source.getAttribute("data-last-name") || "Student"
  const fileName = `${sanitizeFileName(`CET-${referenceNumber}-${lastName}`)}.png`

  return { fileName }
}

async function waitForIframeImages(doc: Document, timeoutMs = 8000) {
  const images = Array.from(doc.querySelectorAll("img"))

  if (images.length === 0) return

  await Promise.race([
    Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve()
              return
            }

            const done = () => {
              img.removeEventListener("load", done)
              img.removeEventListener("error", done)
              resolve()
            }

            img.addEventListener("load", done, { once: true })
            img.addEventListener("error", done, { once: true })

            const src = img.getAttribute("src")
            if (src) img.src = src
          })
      )
    ),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ])
}

function createIsolatedExportIframe(inner: string) {
  const iframe = document.createElement("iframe")

  iframe.style.position = "fixed"
  iframe.style.left = "-100000px"
  iframe.style.top = "0"
  iframe.style.width = `${EXPORT_WIDTH}px`
  iframe.style.height = `${EXPORT_HEIGHT}px`
  iframe.style.opacity = "1"
  iframe.style.pointerEvents = "none"
  iframe.style.border = "0"
  iframe.style.zIndex = "-1"
  iframe.setAttribute("aria-hidden", "true")

  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  if (!doc) {
    document.body.removeChild(iframe)
    throw new Error("Failed to create export iframe.")
  }

  doc.open()
  doc.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Export</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: ${EXPORT_WIDTH}px;
      height: ${EXPORT_HEIGHT}px;
      overflow: hidden;
      background: #ffffff;
      font-family: "Times New Roman", Times, serif;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    img {
      display: block;
      max-width: 100%;
    }

    #capture-root {
      width: ${EXPORT_WIDTH}px;
      height: ${EXPORT_HEIGHT}px;
      overflow: hidden;
      background: #ffffff;
    }

    #capture-root > * {
      width: 100% !important;
      height: 100% !important;
    }
  </style>
</head>
<body>
  <div id="capture-root">${inner}</div>
</body>
</html>
  `)
  doc.close()

  return iframe
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png", 1)
  })
}

async function renderExportBlobFromIframe(inner: string) {
  const html2canvas = (await import("html2canvas")).default
  const iframe = createIsolatedExportIframe(inner)

  try {
    const doc = iframe.contentDocument
    if (!doc) {
      throw new Error("Failed to access export iframe.")
    }

    await waitForIframeImages(doc)

    const captureRoot = doc.getElementById("capture-root") as HTMLElement | null
    if (!captureRoot) {
      throw new Error("Export capture root not found.")
    }

    const canvas = await html2canvas(captureRoot, {
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      scale: 2,
      width: EXPORT_WIDTH,
      height: EXPORT_HEIGHT,
      windowWidth: EXPORT_WIDTH,
      windowHeight: EXPORT_HEIGHT,
      imageTimeout: 8000,
      foreignObjectRendering: false,
    })

    const blob = await canvasToBlob(canvas)

    if (!blob) {
      throw new Error("Failed to create PNG file.")
    }

    return blob
  } finally {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe)
    }
  }
}

export function PrintResultButton() {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    const source = getSourceElement()

    if (!source) {
      toast.error("Export layout not found.")
      return
    }

    try {
      setLoading(true)

      const { fileName } = getMeta(source)
      const blob = await renderExportBlobFromIframe(source.innerHTML)
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success("Downloaded successfully.")
    } catch (error) {
      console.error(error)
      toast.error("Download failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="
          group relative inline-flex items-center justify-center gap-2 overflow-hidden
          rounded-full
          border border-red-300/70
          bg-gradient-to-b from-red-500 via-red-600 to-red-700
          px-4 py-2
          text-sm font-medium text-white
          shadow-[0_8px_24px_rgba(220,38,38,0.28)]
          transition-all duration-300
          hover:-translate-y-[1px]
          hover:from-red-400 hover:via-red-500 hover:to-red-600
          hover:shadow-[0_12px_30px_rgba(220,38,38,0.38)]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0
        "
      >
        {/* subtle glow */}
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_55%)] opacity-90" />

        {/* inner border */}
        <span className="pointer-events-none absolute inset-[1px] rounded-full border border-white/10" />

        {/* highlight shimmer */}
        <span className="pointer-events-none absolute -inset-x-8 top-0 h-[55%] bg-gradient-to-b from-white/18 to-transparent blur-md transition-opacity duration-300 group-hover:opacity-100" />

        <span className="relative z-10 inline-flex items-center">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {loading ? "Preparing PNG..." : "Download PNG"}
        </span>
      </button>
    </div>
  )
}