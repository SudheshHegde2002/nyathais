import { useState } from 'react';
import { supabaseService } from '../../supabase';
import './Popup.css';

export default function FranchiseFormPopup({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.target);
    const phone = formData.get("phone")?.trim() || "";

    // Intercept if it starts with NYA-
    if (phone.toUpperCase().startsWith("NYA-")) {
      const partnerCode = phone.toUpperCase();
      try {
        const shops = await supabaseService.getAllShopsAdmin();
        const matchedShop = shops.find(s => s.partner_code === partnerCode);
        
        if (matchedShop) {
          if (!matchedShop.active) {
            setError("This partner account is suspended. Please contact Admin.");
            setIsSubmitting(false);
            return;
          }
          // Authenticate under-the-hood using default credential mapping
          await supabaseService.signIn(matchedShop.email, 'password');
          onClose();
          window.location.href = '/shop';
          return;
        } else {
          setError("Invalid Partner Access Code.");
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        setError("Partner authentication failed: " + err.message);
        setIsSubmitting(false);
        return;
      }
    }

    // Otherwise proceed with normal public franchise inquiry submission
    formData.append("access_key", process.env.REACT_APP_WEB3FORMS_KEY || "4903d823-345a-4216-bd96-f5a2b0bddee4");
    formData.append("subject", "New Franchise Application - Nyathiya's");
    formData.append("from_name", "Nyathiya's Website Franchise Form");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="form-popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Close">✕</button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '4rem', color: 'var(--gold)', marginBottom: '24px' }}>✓</div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: 'var(--gold-light)', marginBottom: '16px' }}>Application Received</h3>
            <p style={{ color: 'var(--text-muted)' }}>Thank you for your interest in joining the Nyathiya's legacy. Our franchise team will contact you shortly.</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: 'var(--gold-light)', marginBottom: '8px' }}>Begin Your Journey</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Submit your details to explore our premium franchise opportunities.</p>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" name="name" placeholder="Enter your full name" required />
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="Enter your phone number" required />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="Enter your email address" required />
              </div>

              <div className="input-group">
                <label>Target City / Location</label>
                <input type="text" name="location" placeholder="Where do you wish to open?" required />
              </div>

              {error && <p style={{ color: '#ff6b6b', fontSize: '0.9rem', margin: '0' }}>{error}</p>}

              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', width: '100%', opacity: isSubmitting ? 0.7 : 1 }} disabled={isSubmitting}>
                {isSubmitting ? 'Reserving...' : 'Reserve Your Opportunity'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
