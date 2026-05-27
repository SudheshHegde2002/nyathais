import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypewriterText from '../Common/TypewriterText';

export default function FAQAccordion({ faqs }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-accordion fade-up delay-2">
      {faqs.map((faq, index) => {
        const isActive = activeIndex === index;
        return (
          <div key={index} className={`faq-item ${isActive ? 'active' : ''}`}>
            <button className="faq-question" onClick={() => toggleAccordion(index)}>
              <span style={{ flex: 1, paddingRight: '16px' }}>{faq.question}</span>
              <span className="faq-icon">+</span>
            </button>
            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  className="faq-answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="faq-answer-inner">
                    <div style={{ position: 'relative' }}>
                      {/* Invisible spacer prevents layout jumping while typing */}
                      <span style={{ visibility: 'hidden', whiteSpace: 'pre-wrap' }}>{faq.answer}</span>
                      <span style={{ position: 'absolute', top: 0, left: 0, width: '100%', whiteSpace: 'pre-wrap' }}>
                        <TypewriterText text={faq.answer} isActive={isActive} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
