import { faqs } from '../../data/faqData';
import FAQAccordion from './FAQAccordion';
import './FAQ.css';

export default function FAQ() {
  return (
    <section id="faq" className="faq-section">
      <div className="faq-container">
        <div className="fade-up">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Franchise FAQs</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto' }}>Common questions about starting your journey with us.</p>
        </div>

        <FAQAccordion faqs={faqs} />
      </div>
    </section>
  );
}
