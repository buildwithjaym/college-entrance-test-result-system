"use client"

import { useState } from "react"
import { Download, Loader2, Printer } from "lucide-react"
import { toast } from "sonner"

function sanitizeFileName(value: string) {
  return value
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

const SAFE_PROPS = [
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "box-sizing",
  "overflow",
  "overflow-x",
  "overflow-y",
  "flex-direction",
  "justify-content",
  "align-items",
  "align-self",
  "gap",
  "grid-template-columns",
  "grid-template-rows",
  "grid-column",
  "grid-row",
  "text-align",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-transform",
  "text-decoration-line",
  "text-decoration-thickness",
  "text-underline-offset",
  "white-space",
  "word-break",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-radius",
  "opacity",
  "object-fit",
  "visibility",
]

function isUnsafeColor(value: string) {
  const v = value.toLowerCase()
  return (
    v.includes("lab(") ||
    v.includes("lch(") ||
    v.includes("oklab(") ||
    v.includes("oklch(") ||
    v.includes("color-mix(") ||
    v.includes("light-dark(") ||
    v.includes("var(")
  )
}

function safeColor(value: string, fallback: string) {
  if (!value || isUnsafeColor(value)) return fallback
  return value
}

function copySafeComputedStyles(source: HTMLElement, target: HTMLElement) {
  const computed = window.getComputedStyle(source)

  for (const prop of SAFE_PROPS) {
    const value = computed.getPropertyValue(prop)
    if (!value) continue
    try {
      target.style.setProperty(prop, value)
    } catch {}
  }

  target.style.color = safeColor(computed.color, "#0f172a")
  target.style.backgroundColor = safeColor(computed.backgroundColor, "transparent")
  target.style.borderTopColor = safeColor(computed.borderTopColor, "#cbd5e1")
  target.style.borderRightColor = safeColor(computed.borderRightColor, "#cbd5e1")
  target.style.borderBottomColor = safeColor(computed.borderBottomColor, "#cbd5e1")
  target.style.borderLeftColor = safeColor(computed.borderLeftColor, "#cbd5e1")

  target.style.boxShadow = "none"
  target.style.filter = "none"
  ;(target.style as CSSStyleDeclaration).backdropFilter = "none"

  target.removeAttribute("class")
}

function copyTree(source: HTMLElement, target: HTMLElement) {
  copySafeComputedStyles(source, target)

  const sourceChildren = Array.from(source.children) as HTMLElement[]
  const targetChildren = Array.from(target.children) as HTMLElement[]

  for (let i = 0; i < sourceChildren.length; i += 1) {
    const sourceChild = sourceChildren[i]
    const targetChild = targetChildren[i]

    if (sourceChild && targetChild) {
      copyTree(sourceChild, targetChild)
    }
  }
}

function prepareClone(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement
  copyTree(element, clone)

  clone.style.width = `${element.offsetWidth}px`
  clone.style.maxWidth = `${element.offsetWidth}px`
  clone.style.margin = "0"
  clone.style.background = "#ffffff"

  return clone
}

function createIsolatedIframe(width: number) {
  const iframe = document.createElement("iframe")
  iframe.setAttribute("aria-hidden", "true")
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = `${width}px`
  iframe.style.height = "10px"
  iframe.style.opacity = "0"
  iframe.style.pointerEvents = "none"
  iframe.style.border = "0"
  document.body.appendChild(iframe)
  return iframe
}

async function waitForImages(container: ParentNode) {
  const images = Array.from(container.querySelectorAll("img"))
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        })
    )
  )
}

export function PrintResultButton() {
  const [loading, setLoading] = useState(false)

  const handlePrint = () => {
    try {
      window.print()
      toast.success("Print dialog opened.")
    } catch {
      toast.error("Failed to open print.")
    }
  }

  const handleDownload = async () => {
    const element = document.getElementById("result-slip") as HTMLElement | null

    if (!element) {
      toast.error("Result slip not found.")
      return
    }

    let iframe: HTMLIFrameElement | null = null

    try {
      setLoading(true)

      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      const referenceNumber =
        element.getAttribute("data-reference-number") || "CET-Result"
      const lastName =
        element.getAttribute("data-last-name") || "Student"

      const fileName = sanitizeFileName(
        `CET-Result-${referenceNumber}-${lastName}.pdf`
      )

      const clone = prepareClone(element)

      iframe = createIsolatedIframe(element.offsetWidth)
      const doc = iframe.contentDocument
      const win = iframe.contentWindow

      if (!doc || !win) {
        throw new Error("Unable to create isolated render frame.")
      }

      doc.open()
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Slip Export</title>
            <style>
              html, body {
                margin: 0;
                padding: 0;
                background: #ffffff;
              }

              body {
                width: ${element.offsetWidth}px;
                overflow: hidden;
              }

              * {
                box-sizing: border-box;
              }

              img {
                display: block;
              }
            </style>
          </head>
          <body></body>
        </html>
      `)
      doc.close()

      doc.body.appendChild(clone)
      await waitForImages(doc.body)

      const canvas = await html2canvas(clone, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        logging: false,
        windowWidth: element.offsetWidth,
        windowHeight: clone.scrollHeight,
      })

      const imgData = canvas.toDataURL("image/png")

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [122, 210],
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 4
      const usableWidth = pageWidth - margin * 2
      const usableHeight = pageHeight - margin * 2

      let imgWidth = usableWidth
      let imgHeight = (canvas.height * imgWidth) / canvas.width

      if (imgHeight > usableHeight) {
        imgHeight = usableHeight
        imgWidth = (canvas.width * imgHeight) / canvas.height
      }

      const x = (pageWidth - imgWidth) / 2
      const y = (pageHeight - imgHeight) / 2

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight, undefined, "FAST")
      pdf.save(fileName)

      toast.success(`PDF downloaded successfully: ${fileName}`)
    } catch (error) {
      console.error(error)
      toast.error("Failed to download PDF.")
    } finally {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-red-700"
      >
        <Printer className="mr-2 h-4 w-4" />
        Print Result
      </button>

      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {loading ? "Downloading..." : "Download PDF"}
      </button>
    </div>
  )
}