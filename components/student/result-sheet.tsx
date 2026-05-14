import Image from "next/image"
import type { CSSProperties } from "react"

type ResultSheetProps = {
  referenceNumber: string
  fullName: string
  lastName: string
  schoolYearLabel?: string | null
  overallPercentage: string
  formattedExamDate: string
  remarks?: string | null
  formattedPublishedAt?: string
  formattedGeneratedAt: string
  verificationUrl?: string
  verificationCode?: string
  mode?: "preview" | "export"
}

function getQrUrl(value?: string) {
  if (!value) return ""

  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(
    value,
  )}`
}

function ExportImg({
  src,
  alt,
  width,
  height,
  style,
}: {
  src: string
  alt: string
  width: number
  height: number
  style?: CSSProperties
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{
        display: "block",
        maxWidth: "100%",
        ...style,
      }}
    />
  )
}

export function ResultSheet({
  referenceNumber,
  fullName,
  lastName,
  schoolYearLabel,
  overallPercentage,
  formattedExamDate,
  remarks,
  formattedPublishedAt,
  formattedGeneratedAt,
  verificationUrl,
  mode = "preview",
}: ResultSheetProps) {
  const qrUrl = getQrUrl(verificationUrl)

  if (mode === "export") {
    return (
      <div
        id="result-slip-export"
        data-reference-number={referenceNumber}
        data-full-name={fullName}
        data-last-name={lastName}
        style={{
          width: "1600px",
          height: "800px",
          background: "#ffffff",
          padding: "20px",
          boxSizing: "border-box",
          fontFamily: '"Times New Roman", Times, serif',
          color: "#0f172a",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "4px solid #1d4ed8",
            padding: "12px",
            boxSizing: "border-box",
            background: "#ffffff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              border: "2px solid #93c5fd",
              padding: "34px 42px 18px",
              boxSizing: "border-box",
              overflow: "hidden",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.04,
                pointerEvents: "none",
              }}
            >
              <ExportImg
                src="/logo.jpg"
                alt="Basilan State College watermark"
                width={360}
                height={360}
                style={{
                  width: "360px",
                  height: "360px",
                  objectFit: "contain",
                }}
              />
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 100px",
                  gap: "18px",
                  alignItems: "start",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <ExportImg
                    src="/logo.jpg"
                    alt="Basilan State College logo"
                    width={78}
                    height={78}
                    style={{
                      width: "78px",
                      height: "78px",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "15px", lineHeight: "19px" }}>
                    Republic of the Philippines
                  </p>
                  <p style={{ margin: 0, fontSize: "15px", lineHeight: "19px" }}>
                    Basilan State College
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "19px",
                      lineHeight: "22px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Testing and Evaluation Center
                  </p>
                  <p style={{ margin: 0, fontSize: "15px", lineHeight: "19px" }}>
                    Isabela City, Basilan
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <ExportImg
                    src="/testing.png"
                    alt="Testing and Evaluation Center seal"
                    width={78}
                    height={78}
                    style={{
                      width: "78px",
                      height: "78px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <h1
                  style={{
                    margin: "42px 0 0",
                    fontSize: "52px",
                    lineHeight: 1.08,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  College Entrance Test Result
                </h1>

                <p style={{ margin: "8px 0 0", fontSize: "19px" }}>
                  School Year {schoolYearLabel ?? "Not available"}
                </p>

                <p
                  style={{
                    margin: "34px 0 0",
                    fontSize: "42px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    textDecoration: "underline",
                    textUnderlineOffset: "5px",
                    lineHeight: 1.15,
                  }}
                >
                  {fullName}
                </p>

                <p style={{ margin: "8px 0 0", fontSize: "16px" }}>
                  Examinee&apos;s Name
                </p>

                <p
                  style={{
                    margin: "28px 0 0",
                    fontSize: "30px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    lineHeight: 1,
                  }}
                >
                  Overall Ability Rating
                </p>

                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: "78px",
                    fontWeight: 700,
                    color: "#dc2626",
                    lineHeight: 1,
                  }}
                >
                  {overallPercentage}%
                </p>
              </div>

              <div
                style={{
                  marginTop: "28px",
                  borderTop: "1px solid #bfdbfe",
                  paddingTop: "14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "28px",
                  alignItems: "end",
                }}
              >
                <div style={{ fontSize: "16px", lineHeight: 1.55 }}>
                  <p style={{ margin: 0 }}>
                    <strong>Valid until:</strong>{" "}
                    {schoolYearLabel ? `${schoolYearLabel} only` : "Not available"}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Date of Examination:</strong> {formattedExamDate}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Reference Number:</strong> {referenceNumber}
                  </p>

                  {remarks ? (
                    <p style={{ margin: 0 }}>
                      <strong>Remarks:</strong> {remarks}
                    </p>
                  ) : null}

                  <p style={{ margin: "8px 0 0", fontSize: "13px", lineHeight: 1.45 }}>
                    This CET result is subject to official verification by the
                    Testing and Evaluation Center.
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "22px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      lineHeight: 1.15,
                    }}
                  >
                    AL-BASSER S. SAPPAYANI, ED. D, RGC
                  </p>
                  <p style={{ margin: 0, fontSize: "15px" }}>Director, TEC</p>
                  <p style={{ margin: 0, fontSize: "15px" }}>
                    R.A. 9258, PRC License # 0000876
                  </p>

                  {formattedPublishedAt ? (
                    <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#475569" }}>
                      Published: {formattedPublishedAt}
                    </p>
                  ) : null}
                </div>
              </div>

              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "6px",
                  minHeight: "92px",
                  borderTop: "1px dashed #cbd5e1",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                <div>
                  <p style={{ margin: 0 }}>Generated by BASC-CET-Result-System</p>
                  <p style={{ margin: 0 }}>Generated on {formattedGeneratedAt}</p>
                </div>

                {qrUrl ? (
                  <a
                    href={verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      padding: "4px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      background: "#ffffff",
                    }}
                  >
                    <ExportImg
                      src={qrUrl}
                      alt="Verification QR"
                      width={84}
                      height={84}
                      style={{
                        width: "84px",
                        height: "84px",
                      }}
                    />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      id="result-slip-preview"
      data-reference-number={referenceNumber}
      data-full-name={fullName}
      data-last-name={lastName}
      className="mx-auto w-full max-w-[1180px] font-['Times_New_Roman']"
    >
      <div className="rounded-[24px] bg-white p-2 sm:p-3 md:p-4">
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-[24px] border-[3px] border-blue-700 bg-white p-2 shadow-sm md:max-w-none md:rounded-none md:border-[4px] md:p-3 md:shadow-none">
          <div className="relative overflow-hidden rounded-[18px] border-2 border-blue-300 bg-white p-3 md:min-h-[760px] md:rounded-none md:p-8">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
              <Image
                src="/logo.jpg"
                alt="Basilan State College watermark"
                width={360}
                height={360}
                unoptimized
                className="h-[180px] w-[180px] object-contain md:h-[320px] md:w-[320px]"
              />
            </div>

            <div className="relative z-10 flex min-h-full flex-col">
              <div className="grid grid-cols-[60px_1fr_60px] items-start gap-2 md:grid-cols-[100px_1fr_100px] md:gap-5">
                <div className="flex justify-start pt-1">
                  <div className="flex h-12 w-12 items-center justify-center md:h-[78px] md:w-[78px]">
                    <Image
                      src="/logo.jpg"
                      alt="Basilan State College logo"
                      width={78}
                      height={78}
                      priority
                      loading="eager"
                      unoptimized
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] leading-4 text-slate-700 md:text-[15px] md:leading-5">
                    Republic of the Philippines
                  </p>
                  <p className="text-[10px] leading-4 text-slate-700 md:text-[15px] md:leading-5">
                    Basilan State College
                  </p>
                  <p className="text-[11px] font-semibold uppercase leading-4 text-slate-900 md:text-[19px] md:leading-6">
                    Testing and Evaluation Center
                  </p>
                  <p className="text-[10px] leading-4 text-slate-700 md:text-[15px] md:leading-5">
                    Isabela City, Basilan
                  </p>

                  <h1 className="mt-3 text-[18px] font-bold uppercase leading-tight tracking-wide text-slate-900 md:mt-6 md:text-[46px] md:tracking-normal">
                    College Entrance Test Result
                  </h1>

                  <p className="mt-1 text-[11px] text-slate-700 md:mt-2 md:text-[18px]">
                    School Year {schoolYearLabel ?? "Not available"}
                  </p>

                  <p className="mt-4 text-[22px] font-bold uppercase leading-tight underline decoration-[1px] underline-offset-4 text-slate-900 md:mt-8 md:text-[38px]">
                    {fullName}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-700 md:text-[15px]">
                    Examinee&apos;s Name
                  </p>

                  <p className="mt-5 text-[18px] font-bold uppercase leading-tight text-slate-900 md:mt-10 md:text-[28px]">
                    Overall Ability Rating
                  </p>

                  <p className="mt-2 text-[42px] font-extrabold leading-none tracking-tight text-red-600 md:mt-3 md:text-[76px]">
                    {overallPercentage}%
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <div className="flex h-12 w-12 items-center justify-center md:h-[78px] md:w-[78px]">
                    <Image
                      src="/testing.png"
                      alt="Testing and Evaluation Center seal"
                      width={78}
                      height={78}
                      priority
                      loading="eager"
                      unoptimized
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-14 border-t border-blue-200 pt-5 md:mt-16 md:grid md:grid-cols-2 md:gap-8 md:pt-6">
                <div className="space-y-1.5 text-[11px] leading-5 text-slate-800 md:space-y-0 md:text-[15px] md:leading-7">
                  <p>
                    <span className="font-semibold">Valid until:</span>{" "}
                    {schoolYearLabel ? `${schoolYearLabel} only` : "Not available"}
                  </p>
                  <p>
                    <span className="font-semibold">Date of Examination:</span>{" "}
                    {formattedExamDate}
                  </p>
                  <p>
                    <span className="font-semibold">Reference Number:</span>{" "}
                    {referenceNumber}
                  </p>

                  {remarks ? (
                    <p>
                      <span className="font-semibold">Remarks:</span> {remarks}
                    </p>
                  ) : null}

                  <p className="pt-1 text-[10px] leading-5 text-slate-700 md:mt-3 md:text-[13px] md:leading-6">
                    This CET result is subject to official verification by the
                    Testing and Evaluation Center.
                  </p>
                </div>

                <div className="mt-5 flex justify-end border-t border-blue-200 pt-4 md:mt-0 md:items-end md:border-t-0 md:pt-0">
                  <div className="max-w-[280px] text-right md:max-w-[340px]">
                    <p className="text-[12px] font-semibold uppercase leading-tight text-slate-900 md:text-[21px]">
                      AL-BASSER S. SAPPAYANI, ED. D, RGC
                    </p>
                    <p className="text-[10px] text-slate-800 md:text-[15px]">
                      Director, TEC
                    </p>
                    <p className="text-[10px] text-slate-800 md:text-[15px]">
                      R.A. 9258, PRC License # 0000876
                    </p>

                    {formattedPublishedAt ? (
                      <p className="mt-1 text-[9px] text-slate-600 md:mt-2 md:text-[12px]">
                        Published: {formattedPublishedAt}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-4 min-h-[104px] border-t border-dashed border-slate-200 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] text-slate-500 md:text-[12px]">
                    <p>
                      Generated by{" "}
                      <span className="font-semibold text-slate-700">
                        BASC-CET-Result-System
                      </span>
                    </p>
                    <p>
                      Generated on{" "}
                      <span className="font-medium text-slate-700">
                        {formattedGeneratedAt}
                      </span>
                    </p>
                  </div>

                  {qrUrl ? (
                    <a
                      href={verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-slate-200 bg-white p-1 shadow-sm transition hover:scale-105"
                    >
                      <img
                        src={qrUrl}
                        alt="Verification QR"
                        width={88}
                        height={88}
                        className="h-[88px] w-[88px]"
                      />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 hidden text-center text-xs text-slate-500 md:block">
          Desktop preview uses landscape sheet layout. Mobile stays portrait.
        </div>
      </div>
    </div>
  )
}