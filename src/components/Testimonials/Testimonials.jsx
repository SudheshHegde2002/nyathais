import { testimonials } from '../../data/testimonialData';
import './Testimonials.css';

export default function Testimonials() {
  return (
    <section id="testimonials" className="testimonials-section">
      <div className="testimonials-container">
        <div className="fade-up">
          <h2 className="section-title" style={{ textAlign: 'center' }}>The Nyathiya's Experience</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 64px' }}>Discover what our partners say about joining the Nyathiya's family.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div key={t.id} className={`testimonial-card fade-up delay-${idx + 1}`}>
              <div className="quote-icon">"</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>{t.author}</h4>
                  <p>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
