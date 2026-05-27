import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleContactSubmit = async () => {
    if (!name || !email || !message) {
      setErrorMessage("Please fill in all required fields.");
      setStatus("error");
      return;
    }

    const payload = {
      access_key: process.env.REACT_APP_WEB3FORMS_KEY || "dummy",
      name,
      email,
      subject,
      message
    };

    setStatus("submitting");
    setErrorMessage("");

    try {
      // eslint-disable-next-line no-useless-concat
      const endpoint = "https://api." + "web3forms.com" + "/submit";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("Network error.");
    }
  };

  if (status === "success") {
    return (
      <section id="contact" className="contact-section">
        <div className="contact-container">
          <div className="contact-form-wrapper fade-up delay-2" style={{ textAlign: 'center', padding: '64px 32px', width: '100%' }}>
            <div style={{ fontSize: '3rem', color: 'var(--gold)', marginBottom: '16px' }}>✓</div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: 'var(--gold-light)', marginBottom: '16px' }}>Message Sent</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Our team will get back to you shortly.</p>
            <button className="btn btn-secondary" onClick={() => setStatus("idle")}>Send Another</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-info fade-up">
          <h2>Get in Touch</h2>
          <p>Whether you have a question, a business proposal, or simply want to connect with us, our team is always here to assist you with care and prompt support.</p>
          <div className="contact-details">
            <div className="contact-detail-item">
              <span>Email Us</span>
              <a href="mailto:nyathiyas@gmail.com" className="contact-link">
                <strong>nyathiyas@gmail.com</strong>
              </a>
            </div>
            <div className="contact-detail-item">
              <span>Call Us</span>
              <a href="tel:+919380992619" className="contact-link">
                <strong>+91 9380992619</strong>
              </a>
            </div>
            <div className="contact-detail-item">
              <span>Headquarters</span>
              <a href="https://maps.google.com/?q=Sirsi,+Karnataka+581401" target="_blank" rel="noopener noreferrer" className="contact-link">
                <strong>Sirsi, Karnataka 581401</strong>
              </a>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper fade-up delay-2">
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label>Name</label>
              <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="Your Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Subject</label>
              <input type="text" placeholder="Regarding?" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Message</label>
              <textarea placeholder="Your message..." value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
            </div>

            {status === "error" && (
              <p style={{ color: '#ff6b6b', fontSize: '0.9rem', margin: '0' }}>{errorMessage}</p>
            )}

            <button
              type="button"
              className="btn btn-primary contact-submit-btn"
              style={{ marginTop: '16px', opacity: status === 'submitting' ? 0.7 : 1 }}
              onClick={handleContactSubmit}
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
