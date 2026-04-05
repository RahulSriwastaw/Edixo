"use client";

import { cn } from "@/lib/utils";
import { Globe, Lock, Building2 } from "lucide-react";

interface VisibilitySelectorProps {
  value: "private" | "org_only" | "public";
  onChange: (value: "private" | "org_only" | "public") => void;
  className?: string;
}

export function VisibilitySelector({ value, onChange, className }: VisibilitySelectorProps) {
  const options = [
    {
      value: "private" as const,
      icon: Lock,
      title: "🔒 Private",
      subtitle: "PIN se access hoga",
      description: "Koi bhi — agar PIN jaanta hai"
    },
    {
      value: "org_only" as const,
      icon: Building2,
      title: "🏢 Org-Only",
      subtitle: "Logged-in members + PIN",
      description: "Tumhari org ke members bina PIN ke"
    },
    {
      value: "public" as const,
      icon: Globe,
      title: "🌐 Public Website",
      subtitle: "Listed on eduhub.in",
      description: "Koi bhi PIN daal ke access kare"
    }
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-gray-700">Visibility</label>
      <div className="space-y-2">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                "hover:border-gray-300",
                isSelected
                  ? "border-[#F4511E] bg-orange-50"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                  isSelected
                    ? "border-[#F4511E] bg-[#F4511E]"
                    : "border-gray-300"
                )}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.title}</div>
                  <div className="text-sm text-gray-600">{option.subtitle}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
