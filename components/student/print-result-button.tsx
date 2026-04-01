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

function buildPrintHtml(content: string, title: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page {
            size: landscape;
            margin: 8mm;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #ffffff;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 0;
            overflow: hidden;
            font-family: Georgia, "Times New Roman", serif;
          }

          #result-slip-export {
            width: 1400px;
            height: 815px;
            max-width: none;
            margin: 0 auto;
          }

          img {
            display: block;
            max-width: 100%;
            height: auto;
          }

          @media print {
            body {
              padding: 0;
            }

            #result-slip-export {
              width: 100%;
              height: auto;
            }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `
}

function openLandscapePrintWindow(mode: "print" | "download") {
  const exportElement = document.getElementById("result-slip-export") as HTMLElement | null

  if (!exportElement) {
    toast.error("Landscape export layout not found.")
    return
  }

  const referenceNumber =
    exportElement.getAttribute("data-reference-number") || "CET-Result"
  const lastName =
    exportElement.getAttribute("data-last-name") || "Student"

  const title = sanitizeFileName(`CET-Result-${referenceNumber}-${lastName}`)
  const html = buildPrintHtml(exportElement.outerHTML, title)

  const printWindow = window.open("", "_blank", "width=1500,height=950")

  if (!printWindow) {
    toast.error("Popup blocked. Please allow popups and try again.")
    return
  }

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()

  printWindow.onload = () => {
    try {
      printWindow.focus()
      printWindow.print()

      if (mode === "download") {
        toast.success("Landscape dialog opened. Choose 'Save as PDF' to download.")
      } else {
        toast.success("Landscape print dialog opened.")
      }
    } catch {
      toast.error("Failed to open print dialog.")
    }
  }
}

export function PrintResultButton() {
  const [loading, setLoading] = useState(false)

  const handlePrint = () => {
    openLandscapePrintWindow("print")
  }

  const handleDownload = async () => {
    try {
      setLoading(true)
      openLandscapePrintWindow("download")
    } finally {
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
        {loading ? "Opening..." : "Download PDF"}
      </button>
    </div>
  )
}