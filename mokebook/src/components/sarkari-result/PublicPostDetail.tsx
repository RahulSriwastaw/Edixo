"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  postType: string;
  featuredImageUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
  category?: { name: string; slug?: string };
  organization?: string;
  stateName?: string;
  qualification?: string;
  applicationStartDate?: string;
  applicationEndDate?: string;
  examDate?: string;
  resultDate?: string;
  applicationFee?: unknown;
  ageLimit?: unknown;
  vacancyDetails?: unknown;
  eligibility?: unknown;
  selectionProcess?: unknown;
  howToApply?: string;
  importantLinks?: unknown;
  faqData?: unknown;
  importantDates?: unknown;
  viewCount?: number;
  seoTitle?: string;
  seoDescription?: string;
}

function parseField(val: unknown): unknown[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val.trim() ? [val] : [];
    }
  }
  if (typeof val === "object") return [val];
  return [];
}

function fmtDate(d?: string | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function fmtDateLong(d?: string | null) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function typeLabel(type: string) {
  const m: Record<string, string> = {
    job: "Recruitment / Job",
    result: "Result",
    admit_card: "Admit Card",
    answer_key: "Answer Key",
    syllabus: "Syllabus",
    admission: "Admission",
  };
  return m[type] ?? type;
}

const TH_RED =
  "border border-gray-400 bg-[#cc0000] text-white text-xs font-bold px-2 py-2 text-center";
const TH_BLUE =
  "border border-gray-400 bg-[#1a1a5e] text-white text-xs font-bold px-2 py-2 text-center";
const TD_C = "border border-gray-300 text-xs px-2 py-1.5 text-center";
const TD_L = "border border-gray-300 text-xs px-2 py-1.5 text-left";

export function PublicPostDetail({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/sarkari/posts/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPost(d.post);
        else setError("Post not found");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#cc0000]" />
      </div>
    );

  if (error || !post)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-red-600 font-medium">{error || "Post not found"}</p>
        <Link
          href="/sarkari-result"
          className="text-blue-600 underline text-sm"
        >
          ← Back to Home
        </Link>
      </div>
    );

  // Parse all data fields
  const importantDates = parseField(post.importantDates);
  const applicationFee = parseField(post.applicationFee);
  const ageLimit = parseField(post.ageLimit);
  const vacancyDetails = parseField(post.vacancyDetails) as Array<
    Record<string, string>
  >;
  const eligibility = parseField(post.eligibility);
  const selectionProc = parseField(post.selectionProcess);
  const importantLinks = parseField(post.importantLinks);
  const faqData = parseField(post.faqData);

  // Dates rows
  const datesRows: { event: string; date: string }[] = [];
  if (post.applicationStartDate)
    datesRows.push({
      event: "Application Begin",
      date: fmtDate(post.applicationStartDate),
    });
  if (post.applicationEndDate)
    datesRows.push({
      event: "Last Date for Apply",
      date: fmtDate(post.applicationEndDate),
    });
  if (post.examDate)
    datesRows.push({ event: "Exam Date", date: fmtDate(post.examDate) });
  if (post.resultDate)
    datesRows.push({ event: "Result Date", date: fmtDate(post.resultDate) });
  importantDates.forEach((d) => {
    if (typeof d === "string") {
      const parts = d.split(/:\s*(.*)/s);
      datesRows.push({
        event: parts[0]?.trim() ?? d,
        date: parts[1]?.trim() ?? "",
      });
    } else if (d && typeof d === "object") {
      const o = d as Record<string, string>;
      datesRows.push({
        event: o.event ?? o.title ?? "Event",
        date: o.date ?? "",
      });
    }
  });

  // Fee rows
  const feeRows = applicationFee
    .map((f) => {
      if (typeof f === "string") return f;
      if (f && typeof f === "object") {
        const o = f as Record<string, string>;
        return o.category
          ? `${o.category}: ₹${o.amount ?? "0"}`
          : JSON.stringify(o);
      }
      return "";
    })
    .filter(Boolean) as string[];

  // Age rows
  const ageRows = ageLimit
    .map((a) =>
      typeof a === "string"
        ? a
        : typeof a === "object"
          ? JSON.stringify(a)
          : "",
    )
    .filter(Boolean) as string[];

  // Vacancy cols (dynamic)
  const vacCols =
    vacancyDetails.length > 0
      ? Array.from(
          new Set(vacancyDetails.flatMap((v) => Object.keys(v))),
        ).filter((k) => k !== "id")
      : [];

  // FAQ
  const faqItems = faqData
    .map((f) => {
      if (typeof f === "string") {
        const parts = f.split(/\n(.+)/s);
        return { q: parts[0], a: parts[1] ?? "" };
      }
      const o = f as Record<string, string>;
      return { q: o.question ?? o.q ?? "", a: o.answer ?? o.a ?? "" };
    })
    .filter((f) => f.q);

  // Links
  const linkItems = importantLinks.map((l) => {
    if (typeof l === "string") return { label: l, url: "" };
    const o = l as Record<string, string>;
    return {
      label: o.title ?? o.label ?? o.name ?? "Link",
      url: o.url ?? o.link ?? "",
    };
  });

  // Selection process
  const selItems = selectionProc.map((s) =>
    typeof s === "string" ? s : JSON.stringify(s),
  ) as string[];

  // Eligibility list
  const eligItems = eligibility.map((e) => {
    if (typeof e === "string") return { post: e, detail: "" };
    const o = e as Record<string, string>;
    return {
      post: o.post ?? o.name ?? o.title ?? "",
      detail: o.eligibility ?? o.details ?? o.qualification ?? "",
    };
  });

  const postDate = post.publishedAt
    ? fmtDateLong(post.publishedAt)
    : fmtDateLong(post.updatedAt);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* ── TOP BRAND BAR ── */}
      <div className="bg-[#cc0000] text-white text-center py-2">
        <p className="text-[11px] font-semibold tracking-wider uppercase">
          SARKARI RESULT® — WWW.SARKARIRESULT.COM SINCE 2012
        </p>
      </div>

      {/* ── BREADCRUMB ── */}
      <div className="max-w-4xl mx-auto px-3 py-2 text-[11px] text-gray-500 flex flex-wrap gap-1 items-center border-b border-gray-200">
        <Link href="/sarkari-result" className="hover:text-[#cc0000]">
          Home
        </Link>
        <span>›</span>
        {post.category && (
          <>
            <Link
              href={`/sarkari-result/category/${post.category.slug ?? post.category.name}`}
              className="hover:text-[#cc0000]"
            >
              {post.category.name}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-gray-700">{post.title}</span>
      </div>

      {/* ── MAIN ── */}
      <div className="max-w-4xl mx-auto px-3 py-4 pb-12">
        <div className="border border-gray-300 rounded overflow-hidden shadow-sm">
          {/* POST TITLE HEADER */}
          <div className="bg-[#1a1a5e] text-white px-4 py-3 text-center">
            <span className="block text-[11px] uppercase tracking-widest font-medium opacity-80 mb-1">
              {typeLabel(post.postType)}
            </span>
            <h1 className="text-sm md:text-base font-bold leading-snug">
              {post.title}
            </h1>
            {post.organization && (
              <p className="text-[11px] mt-1 opacity-80">{post.organization}</p>
            )}
          </div>

          {/* META */}
          <div className="bg-[#f7f7f7] border-b border-gray-300 px-4 py-2 text-[11px] text-gray-600 flex flex-wrap gap-x-4 gap-y-0.5">
            <span>
              <strong className="text-gray-800">Name Of Post:</strong>{" "}
              {post.title}
            </span>
            {postDate && (
              <span>
                <strong className="text-gray-800">Post Date / Update:</strong>{" "}
                {postDate}
              </span>
            )}
            {post.stateName && (
              <span>
                <strong className="text-gray-800">State:</strong>{" "}
                {post.stateName}
              </span>
            )}
          </div>

          {/* SHORT INFO */}
          {post.excerpt && (
            <div className="bg-[#fffbe6] border-b border-gray-300 px-4 py-2.5">
              <p className="text-[11px] text-gray-800 leading-relaxed">
                <strong>Short Information: </strong>
                {post.excerpt}
              </p>
            </div>
          )}

          {/* SHARE BUTTONS */}
          <div className="bg-white border-b border-gray-300 px-4 py-2 flex flex-wrap gap-2">
            <button
              onClick={() =>
                navigator.share
                  ? navigator.share({
                      title: post.title,
                      url: window.location.href,
                    })
                  : navigator.clipboard.writeText(window.location.href)
              }
              className="flex items-center gap-1.5 bg-[#0088cc] hover:bg-[#0077b5] text-white text-[11px] px-3 py-1.5 rounded font-semibold transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Telegram
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(post.title + " " + window.location.href)}`,
                )
              }
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20b858] text-white text-[11px] px-3 py-1.5 rounded font-semibold transition-colors"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              WhatsApp
            </button>
            <button
              onClick={() => window.open(`https://www.instagram.com/`)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-[11px] px-3 py-1.5 rounded font-semibold"
            >
              📸 Instagram
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white text-[11px] px-3 py-1.5 rounded font-semibold transition-colors"
            >
              🖨️ Print
            </button>
          </div>

          {/* COLORED TITLE BARS */}
          <div className="bg-[#1a1a5e] text-white text-center py-2">
            <p className="text-[11px] font-bold uppercase tracking-wide">
              {post.organization ?? post.title}
            </p>
          </div>
          <div className="bg-[#cc0000] text-white text-center py-1.5">
            <p className="text-[11px] font-bold">{post.title}</p>
          </div>
          <div className="bg-[#1a1a5e] text-white text-center py-1">
            <p className="text-[10px] opacity-90">
              KGBV Ayodhya 2026 : Short Details of Notification
            </p>
          </div>
          <div className="bg-[#cc0000] text-white text-center py-1">
            <p className="text-[10px] font-medium">
              Sarkari Result® WWW.SARKARIRESULT.COM Since 2012
            </p>
          </div>

          {/* ── DATES + FEE GRID ── */}
          {(datesRows.length > 0 || feeRows.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-300">
              {datesRows.length > 0 && (
                <div
                  className={
                    feeRows.length > 0
                      ? "border-b md:border-b-0 md:border-r border-gray-300"
                      : ""
                  }
                >
                  <div className="bg-[#cc0000] text-white text-center py-1.5">
                    <p className="text-[11px] font-bold">Important Dates</p>
                  </div>
                  <table className="w-full border-collapse">
                    <tbody>
                      {datesRows.map((row, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"}
                        >
                          <td className="border border-gray-200 px-3 py-1.5 text-[11px] text-gray-800">
                            {row.event}
                          </td>
                          <td className="border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-[#cc0000] text-right">
                            {row.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {feeRows.length > 0 && (
                <div>
                  <div className="bg-[#cc0000] text-white text-center py-1.5">
                    <p className="text-[11px] font-bold">Application Fees</p>
                  </div>
                  <table className="w-full border-collapse">
                    <tbody>
                      {feeRows.map((f, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"}
                        >
                          <td className="border border-gray-200 px-3 py-1.5 text-[11px] text-gray-700">
                            {f}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── AGE LIMIT ── */}
          {ageRows.length > 0 && (
            <div className="border-b border-gray-300">
              <div className="bg-[#1a1a5e] text-white text-center py-1.5">
                <p className="text-[11px] font-bold">
                  {post.title} Notification {new Date().getFullYear()} : Age
                  Limit Details
                </p>
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  {ageRows.map((a, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"}
                    >
                      <td className="border border-gray-200 px-3 py-1.5 text-[11px] text-gray-700">
                        ● {a}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── VACANCY / ELIGIBILITY TABLE ── */}
          {(vacancyDetails.length > 0 || eligItems.length > 0) && (
            <div className="border-b border-gray-300">
              <div className="bg-[#cc0000] text-white text-center py-1.5">
                <p className="text-[11px] font-bold uppercase">
                  {post.title} Various Post Recruitment{" "}
                  {new Date().getFullYear()} : Vacancy Details Total :{" "}
                  {post.qualification ?? ""}
                </p>
              </div>
              <div className="overflow-x-auto">
                {vacancyDetails.length > 0 && vacCols.length > 0 ? (
                  <table className="w-full border-collapse min-w-[400px]">
                    <thead>
                      <tr>
                        {vacCols.map((c) => (
                          <th key={c} className={TH_RED}>
                            {c.replace(/_/g, " ").toUpperCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vacancyDetails.map((row, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}
                        >
                          {vacCols.map((c) => (
                            <td key={c} className={TD_C}>
                              {String(row[c] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : eligItems.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className={TH_RED}>Post Name</th>
                        <th className={TH_RED}>Total Post</th>
                        <th className={TH_BLUE}>
                          {post.title} Eligibility Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {eligItems.map((item, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}
                        >
                          <td className={TD_L + " font-medium"}>
                            {item.post || "—"}
                          </td>
                          <td className={TD_C}>—</td>
                          <td className={TD_L}>{item.detail || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
              </div>
            </div>
          )}

          {/* ── FULL CONTENT (AI-rewritten HTML) ── */}
          {post.content && (
            <div className="border-b border-gray-300">
              <div
                className="px-4 py-3 text-[11px] text-gray-800 leading-relaxed
                  [&_h2]:text-[11px] [&_h2]:font-bold [&_h2]:bg-[#1a1a5e] [&_h2]:text-white [&_h2]:px-3 [&_h2]:py-1.5 [&_h2]:-mx-4 [&_h2]:my-2
                  [&_h3]:text-[11px] [&_h3]:font-bold [&_h3]:text-[#cc0000] [&_h3]:mt-3 [&_h3]:mb-1
                  [&_table]:w-full [&_table]:border-collapse [&_table]:my-2
                  [&_th]:border [&_th]:border-gray-400 [&_th]:bg-[#1a1a5e] [&_th]:text-white [&_th]:text-[11px] [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-center
                  [&_td]:border [&_td]:border-gray-300 [&_td]:text-[11px] [&_td]:px-2 [&_td]:py-1.5 [&_td]:text-center
                  [&_ul]:list-none [&_ul]:pl-0 [&_ul]:space-y-0.5
                  [&_ul>li]:before:content-['●_'] [&_ul>li]:before:text-[#cc0000]
                  [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                  [&_li]:text-[11px] [&_li]:text-gray-700
                  [&_p]:text-[11px] [&_p]:text-gray-800 [&_p]:leading-relaxed [&_p]:mb-1
                  [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          )}

          {/* ── HOW TO FILL ── */}
          {post.howToApply && (
            <div className="border-b border-gray-300">
              <div className="bg-[#1a1a5e] text-white text-center py-1.5">
                <p className="text-[11px] font-bold">
                  How to Fill {post.title} Recruitment{" "}
                  {new Date().getFullYear()}
                </p>
              </div>
              <div className="px-4 py-3">
                {post.howToApply.includes("<") ? (
                  <div
                    className="text-[11px] text-gray-700 leading-relaxed [&_li]:mb-1 [&_li]:text-[11px]"
                    dangerouslySetInnerHTML={{ __html: post.howToApply }}
                  />
                ) : (
                  <ul className="space-y-1">
                    {post.howToApply
                      .split("\n")
                      .filter(Boolean)
                      .map((s, i) => (
                        <li
                          key={i}
                          className="text-[11px] text-gray-700 flex gap-1.5"
                        >
                          <span className="text-[#cc0000] mt-0.5">●</span>
                          {s}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ── SELECTION PROCESS ── */}
          {selItems.length > 0 && (
            <div className="border-b border-gray-300">
              <div className="bg-[#1a1a5e] text-white text-center py-1.5">
                <p className="text-[11px] font-bold">Selection Process</p>
              </div>
              <ul className="px-6 py-3 space-y-1">
                {selItems.map((s, i) => (
                  <li
                    key={i}
                    className="text-[11px] text-gray-700 flex gap-1.5"
                  >
                    <span className="text-[#cc0000] mt-0.5">●</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* NOTICE */}
          <div className="bg-[#fffbe6] border-b border-gray-300 px-4 py-2">
            <p className="text-[11px] text-gray-700">
              Interested Candidates Can Read the Full Notification Before Apply
              Offline
            </p>
          </div>

          {/* ── IMPORTANT LINKS TABLE ── */}
          {linkItems.length > 0 && (
            <div className="border-b border-gray-300">
              <div className="bg-[#cc0000] text-white text-center py-1.5">
                <p className="text-[11px] font-bold">
                  Some Useful Important Links
                </p>
              </div>
              <table className="w-full border-collapse">
                <tbody>
                  {linkItems.map((lnk, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"}
                    >
                      <td className="border border-gray-200 px-3 py-2 text-[11px] font-medium text-gray-800 w-2/3">
                        {lnk.label}
                      </td>
                      <td className="border border-gray-200 px-3 py-2 text-center w-1/3">
                        {lnk.url ? (
                          <a
                            href={lnk.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block bg-[#1a1a5e] hover:bg-[#cc0000] text-white text-[10px] font-bold px-4 py-1 rounded transition-colors"
                          >
                            Click Here
                          </a>
                        ) : (
                          <span className="inline-block bg-gray-300 text-gray-500 text-[10px] px-4 py-1 rounded">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#f0f0f0]">
                    <td className="border border-gray-200 px-3 py-2 text-[11px] font-medium text-gray-800">
                      Join Sarkari Result Channel
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-center">
                      <span className="text-[11px] text-blue-600 font-medium">
                        Telegram | WhatsApp
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ── FAQ ── */}
          {faqItems.length > 0 && (
            <div className="border-b border-gray-300">
              <div className="bg-[#1a1a5e] text-white text-center py-1.5">
                <p className="text-[11px] font-bold">
                  Frequently Asked Questions
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {faqItems.map((f, i) => (
                  <div key={i} className="bg-white">
                    <button
                      className="w-full text-left px-4 py-2.5 flex items-start gap-2"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="text-[#cc0000] font-bold text-[11px] shrink-0">
                        {i + 1}.
                      </span>
                      <span className="text-[11px] font-semibold text-gray-800 flex-1">
                        {f.q}
                      </span>
                      <span className="text-gray-400 text-xs shrink-0">
                        {openFaq === i ? "▲" : "▼"}
                      </span>
                    </button>
                    {openFaq === i && f.a && (
                      <div className="px-4 pb-2.5 pl-8">
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          {f.a}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FEATURED IMAGE ── */}
          {post.featuredImageUrl && (
            <div className="border-b border-gray-300 p-3 bg-[#f9f9f9] text-center">
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="max-w-full mx-auto rounded"
              />
            </div>
          )}

          {/* ── FOOTER ── */}
          <div className="bg-[#1a1a5e] text-white px-4 py-3 text-center">
            <p className="text-[10px] opacity-90">
              {post.organization ?? post.title} Sarkari Result
            </p>
          </div>
        </div>
        {/* end card */}

        {/* BACK LINK */}
        <div className="mt-4 text-center">
          <Link
            href="/sarkari-result"
            className="inline-block bg-[#cc0000] hover:bg-[#aa0000] text-white text-xs font-semibold px-6 py-2 rounded transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
      {/* end container */}

      {/* PAGE FOOTER */}
      <div className="bg-gray-900 text-gray-400 text-center py-4 border-t border-gray-800">
        <p className="text-[10px]">
          © 2012–{new Date().getFullYear()} Sarkari Result | Powered by MokeBook
        </p>
      </div>
    </div>
  );
}
