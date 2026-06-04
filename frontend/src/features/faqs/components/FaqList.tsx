"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Faq } from "@/lib/api/types";

function FaqItem({ faq }: { faq: Faq }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-lg border bg-card transition-all duration-200 overflow-hidden ${
        isOpen ? "border-primary/30 shadow-[0_4px_16px_-8px_rgba(55,211,153,0.1)]" : "border-border"
      }`}
    >
      <button
        className="flex w-full cursor-pointer items-center justify-between p-5 font-semibold text-foreground transition hover:text-primary focus:outline-none select-none text-right"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{faq.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-t border-border/40 p-5 pt-4 text-sm leading-8 text-muted-foreground bg-muted/5">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <FaqItem key={faq.id || faq.question} faq={faq} />
      ))}
    </div>
  );
}
