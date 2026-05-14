"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

const EXPORT_WIDTH = 1600
const EXPORT_HEIGHT = 800
const EXPORT_SCALE = 2

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

  return {
    fileName: `${sanitizeFileName(`CET-${referenceNumber}-${lastName}`)}.png`,
  }
}

async function waitForImages(doc: Document, timeoutMs = 15000) {
  const images = Array.from(doc.images)

  if (!images.length) return

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
            if (src) {
              img.removeAttribute("src")
              img.setAttribute("src", src)
            }
          }),
      ),
    ),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ])
}

function createExportIframe(html: string) {
  const iframe = document.createElement("iframe")

  iframe.style.position = "fixed"
  iframe.style.left = "-100000px"
  iframe.style.top = "0"
  iframe.style.width = `${EXPORT_WIDTH}px`
  iframe.style.height = `${EXPORT_HEIGHT}px`
  iframe.style.opacity = "0"
  iframe.style.pointerEvents = "none"
  iframe.style.border = "0"
  iframe.style.zIndex = "-1"
  iframe.setAttribute("aria-hidden", "true")

  document.body.appendChild(iframe)

  const doc = iframe.contentDocument

  if (!doc) {
    iframe.remove()
    throw new Error("Could not prepare export layout.")
  }

  doc.open()
  doc.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html,
    body {
      width: ${EXPORT_WIDTH}px;
      height: ${EXPORT_HEIGHT}px;
      margin: 0;
      padding: 0;
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
      max-width: none;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    #capture-root {
      width: ${EXPORT_WIDTH}px;
      height: ${EXPORT_HEIGHT}px;
      overflow: hidden;
      background: #ffffff;
    }

    #result-slip-export {
      width: ${EXPORT_WIDTH}px !important;
      height: ${EXPORT_HEIGHT}px !important;
      min-width: ${EXPORT_WIDTH}px !important;
      min-height: ${EXPORT_HEIGHT}px !important;
      overflow: hidden !important;
      transform: none !important;
    }
  </style>
</head>
<body>
  <div id="capture-root">${html}</div>
</body>
</html>
  `)
  doc.close()

  return iframe
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create PNG file."))
        return
      }

      resolve(blob)
    }, "image/png", 1)
  })
}

async function createPngBlob(source: HTMLElement) {
  const html2canvas = (await import("html2canvas")).default
  const iframe = createExportIframe(source.outerHTML)

  try {
    const doc = iframe.contentDocument

    if (!doc) {
      throw new Error("Could not access export layout.")
    }

    await waitForImages(doc)

    const resultSlip = doc.getElementById("result-slip-export") as HTMLElement | null

    if (!resultSlip) {
      throw new Error("Export sheet was not found.")
    }

    const canvas = await html2canvas(resultSlip, {
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: EXPORT_SCALE,
      width: EXPORT_WIDTH,
      height: EXPORT_HEIGHT,
      windowWidth: EXPORT_WIDTH,
      windowHeight: EXPORT_HEIGHT,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 15000,
      foreignObjectRendering: false,
      removeContainer: true,
      onclone: (clonedDoc) => {
        const sheet = clonedDoc.getElementById("result-slip-export")

        if (sheet) {
          sheet.style.width = `${EXPORT_WIDTH}px`
          sheet.style.height = `${EXPORT_HEIGHT}px`
          sheet.style.overflow = "hidden"
        }
      },
    })

    return await canvasToBlob(canvas)
  } finally {
    iframe.remove()
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function PrintResultButton() {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (loading) return

    const source = getSourceElement()

    if (!source) {
      toast.error("Result sheet is not ready yet.")
      return
    }

    try {
      setLoading(true)

      toast.loading("Preparing PNG...", {
        id: "download-result",
      })

      const { fileName } = getMeta(source)
      const blob = await createPngBlob(source)

      downloadBlob(blob, fileName)

      toast.success("Downloaded successfully.", {
        id: "download-result",
      })
    } catch (error) {
      console.error(error)

      toast.error("Download failed. Please try again.", {
        id: "download-result",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="
        inline-flex items-center justify-center gap-2 rounded-full
        bg-red-600 px-5 py-2.5 text-sm font-semibold text-white
        shadow-sm transition
        hover:bg-red-700
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-70
      "
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}

      {loading ? "Preparing..." : "Download PNG"}
    </button>
  )
}