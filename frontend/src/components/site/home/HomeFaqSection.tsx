"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, ArrowUpLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/common/Container";
import type { Faq } from "@/lib/api/types";

function HomeFaqItem({ faq, index }: { faq: Faq; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const num = (index + 1).toString().padStart(2, "0");

  return (
    <div
      className={`group relative overflow-hidden transition-all duration-300 ${
        isOpen ? "bg-primary/5" : "hover:bg-card/40"
      }`}
    >
      {/* Subtle left border (Right border in RTL context) */}
      <div
        className={`absolute top-0 right-0 h-full w-[2px] transition-colors duration-300 ${
          isOpen ? "bg-primary" : "bg-transparent group-hover:bg-primary/20"
        }`}
      />

      <button
        className="flex w-full cursor-pointer items-start justify-between gap-4 p-5 text-right transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-6">
          <span
            className={`font-mono text-sm transition-colors duration-300 ${
              isOpen ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            {isOpen ? `[${num}]` : num}
            {faq.category ? (
              <span className="mr-3 sm:mr-4 font-sans text-[11px] uppercase tracking-wider text-muted-foreground/70">
                · {faq.category}
              </span>
            ) : null}
          </span>
          <span
            className={`font-semibold transition-colors duration-300 ${
              isOpen ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
            }`}
          >
            {faq.question}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className={`flex h-7 w-7 shrink-0 items-center justify-center transition-colors ${
            isOpen ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          }`}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 pb-6 pt-2 pr-[26px] sm:pr-[88px] text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
              
              {/* Optional call to action inside the answer */}
              <div className="mt-4">
                 <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    ابدأ مشروعاً <ArrowUpLeft className="h-3 w-3" />
                 </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Bottom subtle divider */}
      <div className="absolute bottom-0 left-5 right-5 h-[1px] bg-border/40" />
    </div>
  );
}

export function HomeFaqSection({ faqs }: { faqs: Faq[] }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-y border-border/50 bg-[#070d12]/50 py-20 tech-grid">
      {/* Subtle tech grid and glow */}
      <div className="absolute top-0 right-0 h-full w-[40%] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_left,white,transparent)] opacity-20 pointer-events-none" />
      
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[0.35fr_0.65fr] gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Intro */}
          <div className="flex flex-col gap-6 pt-4">
            <div className="font-mono text-xs font-bold tracking-widest text-primary/80">
              {"// FAQ"}
            </div>
            
            <h2 className="text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
              أسئلة قبل <br />
              <span className="text-primary">أن نبدأ.</span>
            </h2>
            
            <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
              إجابات مباشرة على أكثر الأسئلة المتعلقة بتطوير المنتجات الرقمية، منصات SaaS، والذكاء الاصطناعي.
            </p>
            
            <Link 
              href="/faqs" 
              className="group mt-4 flex w-fit items-center gap-2 text-sm font-bold text-foreground transition-colors hover:text-primary"
            >
              <span>عرض جميع الأسئلة</span>
              <ArrowUpLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 text-primary" />
            </Link>
          </div>

          {/* Right Column: Accordion */}
          <div className="relative rounded-2xl border border-border/40 bg-card/10 overflow-hidden backdrop-blur-sm">
             {/* Glow behind the accordion container */}
             <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 pointer-events-none" />
             
             <div className="flex flex-col">
               {faqs.map((faq, index) => (
                 <HomeFaqItem key={faq.id} faq={faq} index={index} />
               ))}
             </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
