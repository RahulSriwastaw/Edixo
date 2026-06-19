import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

// ─── ZAI SDK ─────────────────────────────────────────────────────────────────

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;
async function getZAI() {
  if (!zaiInstance) zaiInstance = await ZAI.create();
  return zaiInstance;
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 90);
}

function extractMeta(html: string, name: string): string {
  for (const pattern of [
    new RegExp(
      `<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`,
      "i",
    ),
  ]) {
    const m = html.match(pattern);
    if (m?.[1]) return m[1].trim();
  }
  return "";
}

function getPageTitle(html: string) {
  return (
    extractMeta(html, "og:title") ||
    (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "")
  );
}
function getPageDesc(html: string) {
  return (
    extractMeta(html, "description") || extractMeta(html, "og:description")
  );
}
function getPageImage(html: string) {
  return (
    extractMeta(html, "og:image") ||
    (html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? "")
  );
}

/** Strip scripts/styles/nav/footer but keep semantic block tags as \n */
function toPlainText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|h[1-6]|li|td|tr|section|article|table)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#[0-9]+;/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Find lines belonging to a named section */
function extractSection(lines: string[], headings: string[]): string[] {
  const lower = (s: string) => s.toLowerCase().trim();
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headings.some((h) => lower(lines[i]).includes(h.toLowerCase()))) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return [];
  const ALL_HEADINGS = [
    "important dates",
    "application fee",
    "age limit",
    "vacancy details",
    "eligibility",
    "how to",
    "selection process",
    "important links",
    "frequently asked",
    "some useful",
    "how to fill",
    "qualification",
  ];
  const result: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const l = lower(lines[i]);
    if (result.length > 0 && ALL_HEADINGS.some((h) => l.includes(h))) break;
    const trimmed = lines[i].trim();
    if (trimmed) result.push(trimmed);
    if (result.length > 40) break;
  }
  return result;
}

/** Convert an array of strings to a <ul><li> list HTML */
function toUlHtml(items: string[]) {
  if (!items.length) return "";
  return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

// ─── SMART SARKARI CONTENT BUILDER ───────────────────────────────────────────
interface ParsedPage {
  title: string;
  organization: string;
  postType: string;
  importantDates: string[];
  applicationFee: string[];
  ageLimit: string[];
  vacancyTable: Array<{ post: string; total: string; eligibility: string }>;
  eligibility: string[];
  howToApply: string[];
  importantLinks: string[];
  faqItems: Array<{ q: string; a: string }>;
  qualification: string;
  stateName: string;
  totalPosts: string;
  applyMode: string;
}

function parseSarkariPage(plainText: string, htmlTitle: string): ParsedPage {
  const lines = plainText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const get = (headings: string[]) => extractSection(lines, headings);

  // Title
  const nameLine =
    lines.find((l) => l.toLowerCase().includes("name of post")) ?? "";
  const titleCandidates = [
    lines[lines.indexOf(nameLine) + 1],
    htmlTitle,
    lines.find(
      (l) =>
        l.toLowerCase().includes("recruitment") ||
        l.toLowerCase().includes("vacancy") ||
        l.toLowerCase().includes("bharti"),
    ),
  ].filter(Boolean) as string[];
  const title = titleCandidates[0] || htmlTitle;

  // Dates
  const dates = get(["important dates"]).filter(
    (l) =>
      /\d/.test(l) ||
      /begin|last date|apply|exam|result|admit|interview/i.test(l),
  );

  // Fee
  const fee = get(["application fee", "application fees"]);

  // Age
  const age = get(["age limit", "age detail"]);

  // Total vacancies
  const totalLine =
    lines.find(
      (l) => /total\s*:?\s*\d+/i.test(l) || /vacancy.*total.*\d+/i.test(l),
    ) ?? "";
  const totalMatch = totalLine.match(/(\d+)/);
  const totalPosts = totalMatch?.[1] ?? "";

  // Vacancy table - look for patterns: "Post Name \n Total \n Eligibility"
  const vacancyTable: ParsedPage["vacancyTable"] = [];
  let inVacancy = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes("vacancy details") || l.includes("post name"))
      inVacancy = true;
    if (
      inVacancy &&
      (l.includes("how to") ||
        l.includes("important dates") ||
        l.includes("selection"))
    )
      inVacancy = false;
    if (inVacancy) {
      // Heuristic: if this line is a post name and next is a number
      const next = lines[i + 1] ?? "";
      const isPostName =
        /^[A-Z]/.test(lines[i]) &&
        /\d+/.test(next) &&
        !/(date|fee|limit|details|eligibility|notification|apply|principal|pgt|lab|clerk|peon|watchman|chef|care)/i.test(
          next,
        );
      if (
        isPostName ||
        /(principal|pgt|lab\s*assist|clerk|office|peon|watchman|care\s*taker|chef)/i.test(
          lines[i],
        )
      ) {
        vacancyTable.push({
          post: lines[i],
          total: /^\d+$/.test(next) ? next : "",
          eligibility: /^\d+$/.test(next) ? (lines[i + 2] ?? "") : "",
        });
      }
    }
  }

  // Eligibility
  const eligSection = get(["eligibility", "educational qualification"]).filter(
    (l) => l.length > 5 && !/^(post|total|name)/i.test(l),
  );

  // How to Apply
  const hta = get(["how to fill", "how to apply", "application process"]);

  // Important Links
  const links = get(["some useful", "important links"]).filter(
    (l) => !/^(page|app|android|apple|download)/i.test(l) && l.length > 2,
  );

  // FAQ
  const faqItems: ParsedPage["faqItems"] = [];
  let faqStart = false;
  let curQ = "";
  for (const l of lines) {
    if (l.toLowerCase().includes("frequently asked")) {
      faqStart = true;
      continue;
    }
    if (faqStart) {
      if (/^\d+\./.test(l) || /^q\./i.test(l)) {
        curQ = l;
      } else if (curQ && l.trim()) {
        faqItems.push({ q: curQ, a: l });
        curQ = "";
      }
    }
  }

  // Organization
  const orgLine =
    lines.find(
      (l) =>
        /(department|board|commission|organisation|organization|university|bsa|vidyalaya)/i.test(
          l,
        ) && l.length < 100,
    ) ?? "";

  // State
  const stateLine =
    lines.find((l) =>
      /\b(ayodhya|lucknow|delhi|mumbai|jaipur|patna|bhopal|hyderabad|bengaluru|chennai|kolkata)\b/i.test(
        l,
      ),
    ) ?? "";
  const stateMatch = stateLine.match(
    /\b(uttar pradesh|up|bihar|rajasthan|madhya pradesh|maharashtra|gujarat|karnataka|tamil nadu|west bengal|haryana)\b/i,
  );

  // Qualification
  const qualLine =
    lines.find(
      (l) =>
        /(10th|12th|graduate|b\.ed|m\.ed|diploma|iti|engineer|degree)/i.test(
          l,
        ) && l.length < 120,
    ) ?? "";

  // postType
  const fullText = lines.join(" ").toLowerCase();
  let postType = "job";
  if (/result/.test(fullText) && !/recruitment/.test(fullText))
    postType = "result";
  else if (/admit card/.test(fullText)) postType = "admit_card";
  else if (/answer key/.test(fullText)) postType = "answer_key";
  else if (/syllabus/.test(fullText)) postType = "syllabus";
  else if (/admission/.test(fullText) && !/recruitment/.test(fullText))
    postType = "admission";

  // Apply mode
  const applyMode = /apply offline/i.test(fullText) ? "Offline" : "Online";

  return {
    title,
    organization: orgLine,
    postType,
    importantDates: dates,
    applicationFee: fee,
    ageLimit: age,
    vacancyTable,
    eligibility: eligSection,
    howToApply: hta,
    importantLinks: links,
    faqItems,
    qualification: qualLine,
    stateName: stateMatch?.[1] ?? "",
    totalPosts,
    applyMode,
  };
}

/** Build proper Sarkari Result HTML from parsed page */
function buildSarkariHtml(p: ParsedPage): string {
  let html = "";

  html += `<h2>Overview</h2>
<p><strong>${p.organization || p.title}</strong> has released a recruitment notification for ${p.totalPosts ? p.totalPosts + " posts" : "various posts"}.
${p.applyMode === "Offline" ? "Candidates can apply offline." : "Candidates can apply online."}
${p.importantDates.find((d) => /last date/i.test(d)) ? "Last date: " + (p.importantDates.find((d) => /last date/i.test(d)) ?? "") + "." : ""}</p>`;

  if (p.importantDates.length) {
    html += `\n<h2>Important Dates</h2><ul>${p.importantDates.map((d) => `<li>${d}</li>`).join("")}</ul>`;
  }

  if (p.applicationFee.length) {
    html += `\n<h2>Application Fee</h2>${toUlHtml(p.applicationFee)}`;
  }

  if (p.ageLimit.length) {
    html += `\n<h2>Age Limit</h2>${toUlHtml(p.ageLimit)}`;
  }

  if (p.vacancyTable.length) {
    html += `\n<h2>Vacancy Details (Total: ${p.totalPosts || p.vacancyTable.length} Posts)</h2>
<table>
<tr><th>Post Name</th><th>Total Posts</th><th>Eligibility</th></tr>
${p.vacancyTable.map((v) => `<tr><td>${v.post}</td><td>${v.total || "—"}</td><td>${v.eligibility || "—"}</td></tr>`).join("")}
</table>`;
  }

  if (p.eligibility.length) {
    html += `\n<h2>Eligibility / Qualification</h2>${toUlHtml(p.eligibility)}`;
  }

  if (p.howToApply.length) {
    html += `\n<h2>How to Apply</h2><ol>${p.howToApply.map((s) => `<li>${s}</li>`).join("")}</ol>`;
  }

  if (p.importantLinks.length) {
    html += `\n<h2>Important Links</h2>${toUlHtml(p.importantLinks)}`;
  }

  if (p.faqItems.length) {
    html += `\n<h2>Frequently Asked Questions</h2>${p.faqItems.map((f) => `<p><strong>${f.q}</strong><br/>${f.a}</p>`).join("")}`;
  }

  return html.trim();
}

// ─── AI: ONLY SHORT METADATA ──────────────────────────────────────────────────
async function getAiMetadata(
  title: string,
  organization: string,
  datesStr: string,
  vacancyStr: string,
  qualLine: string,
  stateName: string,
  postType: string,
  totalPosts: string,
  extraInstructions: string,
): Promise<{
  cleanTitle: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  postType: string;
} | null> {
  try {
    const zai = await getZAI();
    const prompt = `Given this Sarkari Job post info, return ONLY a JSON object with 7 fields. No extra text.

Title: ${title}
Organization: ${organization || "Unknown"}
Total Posts: ${totalPosts || "Various"}
Dates: ${datesStr}
Vacancy Summary: ${vacancyStr.substring(0, 400)}
Qualification: ${qualLine}
State: ${stateName || "Central Govt"}
Post Type: ${postType}
Extra: ${extraInstructions || "None"}

Return exactly:
{"cleanTitle":"Full post title with org + year","slug":"seo-url-slug","excerpt":"2-3 sentence summary mentioning org, total posts and last date (under 200 chars)","seoTitle":"50-60 char SEO title","seoDescription":"150-160 char meta description","focusKeyword":"primary keyword","postType":"${postType}"}`;

    const res = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content: "You output only valid JSON objects, nothing else.",
        },
        { role: "user", content: prompt },
      ],
      thinking: { type: "disabled" },
    });

    const raw = res.choices[0]?.message?.content ?? "";
    const clean = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "");

    const tryParse = (s: string) => {
      try {
        return JSON.parse(s);
      } catch {
        return null;
      }
    };

    let parsed = tryParse(clean);
    if (!parsed) {
      const start = clean.indexOf("{");
      const end = clean.lastIndexOf("}");
      if (start !== -1 && end > start)
        parsed = tryParse(clean.slice(start, end + 1));
    }

    return parsed && parsed.cleanTitle ? parsed : null;
  } catch {
    return null;
  }
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.sourceUrl) {
      return NextResponse.json(
        { success: false, error: "sourceUrl is required" },
        { status: 400 },
      );
    }

    const { sourceUrl, extraInstructions = "" } = body as {
      sourceUrl: string;
      extraInstructions?: string;
    };

    // ── 1. Fetch URL ──────────────────────────────────────────────
    let pageHtml = "";
    let fetchError = "";
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 14000);
      const res = await fetch(sourceUrl, {
        signal: ctrl.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      clearTimeout(t);
      if (res.ok) pageHtml = await res.text();
      else fetchError = `HTTP ${res.status}`;
    } catch (e) {
      fetchError = e instanceof Error ? e.message : "Fetch failed";
    }

    const htmlTitle = getPageTitle(pageHtml);
    const htmlDesc = getPageDesc(pageHtml);
    const pageImage = getPageImage(pageHtml);
    const plainText = toPlainText(pageHtml);

    if (!plainText && !htmlTitle) {
      return NextResponse.json(
        {
          success: false,
          error: fetchError
            ? `Could not fetch URL: ${fetchError}`
            : "No content found",
        },
        { status: 422 },
      );
    }

    // ── 2. Smart parse ────────────────────────────────────────────
    const parsed = parseSarkariPage(plainText, htmlTitle);

    // ── 3. Build HTML content ─────────────────────────────────────
    const contentHtml = buildSarkariHtml(parsed);
    const contentText = contentHtml
      .replace(/<\/?(table|tr|th|td|ul|ol|li|p|h[1-6]|br)[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // ── 4. AI for short metadata ──────────────────────────────────
    const datesStr = parsed.importantDates.join(" | ");
    const vacancyStr = parsed.vacancyTable
      .map((v) => `${v.post}: ${v.total}`)
      .join(", ");

    const aiMeta = await getAiMetadata(
      parsed.title,
      parsed.organization,
      datesStr,
      vacancyStr || plainText.substring(0, 500),
      parsed.qualification,
      parsed.stateName,
      parsed.postType,
      parsed.totalPosts,
      extraInstructions,
    );

    // ── 5. Compose final response ─────────────────────────────────
    const finalTitle = aiMeta?.cleanTitle || parsed.title || htmlTitle;
    const finalSlug = aiMeta?.slug || slugify(finalTitle);
    const finalExcerpt =
      aiMeta?.excerpt ||
      htmlDesc ||
      `${parsed.organization || finalTitle} has released recruitment for ${parsed.totalPosts || "various"} posts. Apply ${parsed.applyMode}.`;
    const finalSeoTitle =
      aiMeta?.seoTitle ||
      (finalTitle.length > 60
        ? finalTitle.substring(0, 57) + "..."
        : finalTitle);
    const finalSeoDesc =
      aiMeta?.seoDescription || htmlDesc || finalExcerpt.substring(0, 160);
    const finalKeyword =
      aiMeta?.focusKeyword || finalTitle.split(" ").slice(0, 4).join(" ");

    return NextResponse.json({
      success: true,
      data: {
        title: finalTitle,
        slug: finalSlug,
        excerpt: finalExcerpt,
        contentHtml,
        contentText,
        seoTitle: finalSeoTitle,
        seoDescription: finalSeoDesc,
        focusKeyword: finalKeyword,
        organization: parsed.organization,
        qualification: parsed.qualification,
        stateName: parsed.stateName,
        postType: aiMeta?.postType || parsed.postType,
        howToApply: parsed.howToApply.join("\n"),
        eligibility: parsed.eligibility.length
          ? JSON.stringify(parsed.eligibility, null, 2)
          : undefined,
        selectionProcess: '["Written Exam / Interview"]',
        importantDates: parsed.importantDates.length
          ? JSON.stringify(parsed.importantDates, null, 2)
          : undefined,
        importantLinks: parsed.importantLinks.length
          ? JSON.stringify(parsed.importantLinks, null, 2)
          : undefined,
        suggestedCategorySlugs: ["latest-jobs"],
        featuredImageUrl: pageImage,
        extractedFeaturedImageUrl: pageImage,
        extractedTitle: htmlTitle,
        extractedDescription: htmlDesc,
        sourceUrl,
      },
    });
  } catch (err) {
    console.error("[sarkari-ai-draft]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal error",
      },
      { status: 500 },
    );
  }
}
