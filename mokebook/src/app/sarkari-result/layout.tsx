import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "MokeBook Sarkari Result | Latest Government Jobs, Results, Admit Cards",
    template: "%s | MokeBook Sarkari Result"
  },
  description: "Latest Government Jobs, Results, Admit Cards, Answer Keys, Admissions, Syllabus. Get instant updates for SSC, Railway, Banking, UPSC, Police, Teaching & all State/ Central Govt jobs.",
  keywords: ["sarkari result", "government jobs", "ssc result", "railway result", "bank jobs", "admit card", "answer key", "admission"],
  authors: [{ name: "MokeBook" }],
  openGraph: {
    title: "MokeBook Sarkari Result - Latest Government Jobs, Results, Admit Cards & Exam Updates",
    description: "Fast, modern portal for all government job updates, results, admit cards, answer keys and admissions.",
    type: "website",
    siteName: "MokeBook Sarkari Result",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "MokeBook Sarkari Result",
    description: "Latest Government Jobs, Results, Admit Cards & Exam Updates",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://mokebook.in/sarkari-result" },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MokeBook Sarkari Result",
  url: "https://mokebook.in",
  logo: "https://mokebook.in/logo.png",
  sameAs: [
    "https://telegram.org",
    "https://whatsapp.com"
  ]
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MokeBook Sarkari Result",
  url: "https://mokebook.in/sarkari-result",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://mokebook.in/sarkari-result/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function SarkariResultLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="schema-org" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, websiteSchema]) }} />
      {children}
    </>
  );
}