"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface PINEntryProps {
  label?: string;
  onComplete?: (pin: string) => void;
  isLoading?: boolean;
  error?: string;
  locked?: boolean;
  lockSeconds?: number;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  length?: number;
}

export function PINEntry({
  label,
  onComplete,
  isLoading = false,
  error,
  locked = false,
  lockSeconds = 0,
  disabled = false,
  value: controlledValue,
  onChange,
  className,
  length = 6,
}: PINEntryProps) {
  const [internalValue, setInternalValue] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const value = controlledValue ?? internalValue;
  const setValue = onChange ?? setInternalValue;

  // Handle shake animation
  useEffect(() => {
    if (error) {
      const raf = requestAnimationFrame(() => {
        setShake(true);
      });
      const timer = setTimeout(() => setShake(false), 500);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [error]);

  // Focus first input on mount
  useEffect(() => {
    if (!disabled && !locked) {
      inputRefs.current[0]?.focus();
    }
  }, [disabled, locked]);

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (disabled || locked) return;

      // Only allow numeric input
      const numericDigit = digit.replace(/\D/g, "");
      if (!numericDigit && digit !== "") return;

      const newValue = value.split("");
      newValue[index] = numericDigit.slice(-1);
      const updatedValue = newValue.join("").padEnd(length, "").slice(0, length);
      setValue(updatedValue.replace(/\s/g, ""));

      // Auto-advance to next input
      if (numericDigit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }

      // Auto-submit when all digits entered
      if (numericDigit && index === length - 1) {
        const finalValue = newValue.join("");
        if (finalValue.length === length && onComplete) {
          onComplete(finalValue);
        }
      }
    },
    [value, length, onComplete, disabled, locked, setValue]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled || locked) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        const newValue = value.split("");
        
        if (newValue[index]) {
          // Clear current box
          newValue[index] = "";
          setValue(newValue.join(""));
        } else if (index > 0) {
          // Move to previous box and clear it
          newValue[index - 1] = "";
          setValue(newValue.join(""));
          inputRefs.current[index - 1]?.focus();
          setActiveIndex(index - 1);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      } else if (e.key === "ArrowRight" && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }
    },
    [value, length, disabled, locked, setValue]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled || locked) return;
      
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      
      if (pastedText) {
        setValue(pastedText.padEnd(length, "").slice(0, length));
        
        // Focus the next empty box or the last box
        const nextIndex = Math.min(pastedText.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
        setActiveIndex(nextIndex);

        // Auto-submit if complete
        if (pastedText.length === length && onComplete) {
          onComplete(pastedText);
        }
      }
    },
    [length, onComplete, disabled, locked, setValue]
  );

  const handleFocus = useCallback((index: number) => {
    setActiveIndex(index);
    // Select the input content on focus
    inputRefs.current[index]?.select();
  }, []);

  // Format lock countdown
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      
      <div
        ref={containerRef}
        className={cn(
          "flex items-center gap-2",
          shake && "animate-shake"
        )}
        onPaste={handlePaste}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            disabled={disabled || locked}
            className={cn(
              "w-12 h-14 text-center text-xl font-bold rounded-lg border-2 transition-all duration-200",
              "focus:outline-none",
              // Default state
              !error && !locked && "border-gray-200 bg-white",
              // Focus state
              activeIndex === index && !error && !locked && "border-[#F4511E] ring-2 ring-orange-100",
              // Filled state
              value[index] && !error && !locked && "border-gray-400 bg-white",
              // Error state
              error && "border-red-400 bg-red-50",
              // Locked state
              locked && "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400",
              // Loading state
              isLoading && "opacity-50 cursor-wait"
            )}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Lock countdown */}
      {locked && lockSeconds > 0 && (
        <p className="text-sm text-amber-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Try again in {formatTime(lockSeconds)}
        </p>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Verifying...
        </div>
      )}
    </div>
  );
}

// ID Display component for showing SET/MOCK/BOOK IDs
interface IDDisplayProps {
  label: string;
  value: string;
  onCopy?: () => void;
  showCopyButton?: boolean;
  variant?: "id" | "pin";
}

export function IDDisplay({ label, value, onCopy, showCopyButton = true, variant = "id" }: IDDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="flex items-center justify-between gap-2">
        {variant === "pin" ? (
          // PIN display with spaced digits
          <div className="flex gap-1.5 font-mono text-xl tracking-widest">
            {value.split("").map((digit, i) => (
              <span key={i} className="w-6 text-center">{digit}</span>
            ))}
          </div>
        ) : (
          // ID display
          <code className="font-mono text-xl tracking-wider text-gray-900">{value}</code>
        )}
        {showCopyButton && (
          <button
            onClick={handleCopy}
            className="text-xs text-[#F4511E] hover:text-[#E64A19] font-medium flex items-center gap-1 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
