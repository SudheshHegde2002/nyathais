import './Hero.css';

export default function Hero({ setShowFranchiseForm }) {
  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Experience the Art of Taste</h1>
        <p className="hero-subtitle">
          Immerse yourself in a legacy of premium craftsmanship. Exquisite flavors, cinematic luxury, and unforgettable moments wrapped in gold.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => setShowFranchiseForm(true)}>Join the Legacy</button>
          <a href="#products" className="btn btn-secondary">Explore Collection</a>
        </div>
      </div>
    </section>
  );
}
