import './Franchise.css';

export default function Franchise({ setShowFranchiseForm }) {
  return (
    <section id="franchise" className="franchise-section">
      <div className="franchise-container">
        <div className="franchise-header fade-up">
          <h2 className="section-title">The Franchise Opportunity</h2>
          <p className="section-subtitle">Step into a world of profitability and elegance with our proven luxury business model.</p>
        </div>

        <div className="franchise-cards">
          <div className="info-card fade-up delay-1">
            <div className="card-icon">✦</div>
            <h3>Low Barrier to Entry</h3>
            <p>Start your premium entrepreneurial journey with an accessible investment structure.</p>
          </div>
          <div className="info-card fade-up delay-2">
            <div className="card-icon">✦</div>
            <h3>Compact Setup</h3>
            <p>Perfectly optimized for small yet high-potential luxury spaces.</p>
          </div>
          <div className="info-card fade-up delay-3">
            <div className="card-icon">✦</div>
            <h3>Comprehensive Training</h3>
            <p>We guide you through every operational step to ensure immaculate service.</p>
          </div>
          <div className="info-card fade-up delay-4">
            <div className="card-icon">✦</div>
            <h3>Turnkey Launch</h3>
            <p>End-to-end store setup and design support matching our high-end aesthetic.</p>
          </div>
        </div>

        <div className="franchise-details">
          <div className="franchise-who fade-up delay-1">
            <h3 className="why-title">Who This Is For</h3>
            <ul className="why-list">
              <li><strong>New Entrepreneurs:</strong> We provide step-by-step guidance.</li>
              <li><strong>Investors:</strong> A highly scalable, high-ROI luxury model.</li>
              <li><strong>Connoisseurs:</strong> Turn your passion for quality treats into profit.</li>
              <li><strong>Driven Leaders:</strong> Perfect for those wanting a proven, turnkey system.</li>
            </ul>
          </div>

          <div className="franchise-how fade-up delay-2">
            <h3 className="why-title">How It Works</h3>
            <div className="how-steps">
              <div className="how-step">
                <div className="step-number">1</div>
                <div>
                  <h4>Submit Application</h4>
                  <p>Express your interest through our secure portal.</p>
                </div>
              </div>
              <div className="how-step">
                <div className="step-number">2</div>
                <div>
                  <h4>Initial Consultation</h4>
                  <p>We reach out for profiling and location assessment.</p>
                </div>
              </div>
              <div className="how-step">
                <div className="step-number">3</div>
                <div>
                  <h4>Setup & Launch</h4>
                  <p>Store design, comprehensive training, and grand opening.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="franchise-cta fade-up delay-3">
          <button className="btn btn-primary btn-lg" onClick={() => setShowFranchiseForm(true)}>Begin Your Nyathiya's Journey</button>
          <p className="cta-microcopy">Exclusive territories available. Fast review process.</p>
        </div>
      </div>
    </section>
  );
}
