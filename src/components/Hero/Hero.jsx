import './Hero.css';

export default function Hero({ setShowFranchiseForm }) {
  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Experience the Art of Taste</h1>
        <p className="hero-subtitle">
          Immerse yourself in a legacy of premium craftsmanship. Exquisite flavors, cinematic luxury, and unforgettable moments wrapped in gold.
        </p>
      </div>
      <a href="#about" className="hero-scroll-cue" aria-label="Scroll to discover our story">
        <span className="scroll-text">Scroll to discover</span>
        <div className="scroll-arrow">
          <span className="arrow-down"></span>
        </div>
      </a>
    </section>
  );
}
