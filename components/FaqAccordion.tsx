'use client';

import { useState } from 'react';
import type { ToolFaq } from '@/lib/tools/types';

export default function FaqAccordion({ faqs }: { faqs: ToolFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div className="faq-item" key={faq.question}>
            <button
              type="button"
              className="faq-question"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
            >
              <span>{faq.question}</span>
              <svg
                className={`faq-chevron ${isOpen ? 'open' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
              <div className="faq-answer-inner">
                <p>{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
