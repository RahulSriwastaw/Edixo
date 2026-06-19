"use client";

import { useParams } from "next/navigation";
import { PublicPostDetail } from "@/components/sarkari-result/PublicPostDetail";

export default function SarkariPostPage() {
  const params = useParams();
  const slug = String(params?.slug || "");

  return <PublicPostDetail slug={slug} />;
}
