import './FinalCTA.css';

export default function FinalCTA({ setShowFranchiseForm }) {
  return (
    <section className="final-cta-section">
      <div className="final-cta-container fade-up">
        <h2 className="section-title" style={{ color: '#fff', fontSize: 'clamp(3rem, 6vw, 4.5rem)', marginBottom: '32px' }}>Crafting Luxury, Together.</h2>
        <p className="section-subtitle" style={{ color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '600px' }}>Take the next step towards owning a high-end business with our proven and elegant franchise model.</p>
        <button className="btn btn-primary btn-xl" onClick={() => setShowFranchiseForm(true)}>Secure Your Franchise</button>
      </div>
    </section>
  );
}
