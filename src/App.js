import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const GOOGLE_REVIEW_LINK = "https://www.google.com/search?sca_esv=b622e0e69be708e0&sxsrf=ANbL-n4D2hdEGHr6Z4wZnlnxJo2UmNShRQ:1771792092724&q=rasavanti+juice+centre+(cafe)+sirsi+reviews+page&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOcOQQT2UuNYPKN8jHbUNk_TmM6OjT4KqcgIP3elK38yqrlr2OduO-RD181ip_Z5BxiaqUAtJUGyTyg-XiYDmjY-nKcPW9BzuKy4yZo9dJNIyMW75jA%3D%3D&sa=X&ved=2ahUKEwiD2bXy9-2SAxVeTmwGHW4SORAQrrQLegQIGxAA&biw=1522&bih=736&dpr=1.25&zx=1771792186825&no_sw_cr=1#lrd=0x3bbea92bc99dd9d9:0x5ebfcfff1ad73ee4,3"; // ← replace this

const products = [
  {
    name: "Banana Cardamom",
    folder: "banana cardum",
    media: [
      { file: "kling_20260214_VIDEO_Create_a_s_1113_01-ezgif.com-video-to-gif-converter.gif", type: "gif" },
      { file: "Screenshot 2026-02-16 023700.png", type: "image" },
    ],
  },
  {
    name: "Blue Berry",
    folder: "blue berry",
    media: [
      { file: "Ultrarealistic_natural_ice_202602160228.gif", type: "gif" },
      { file: "Screenshot 2026-02-16 025030.png", type: "image" },
    ],
  },
  {
    name: "Chilly Guava",
    folder: "chilly guava",
    media: [
      { file: "Create_a_seamless_202602160233.gif", type: "gif" },
      { file: "Screenshot 2026-02-16 024953.png", type: "image" },
    ],
  },
  {
    name: "Custard Apple",
    folder: "custerd apple",
    media: [
      { file: "Create_a_seamless_202602160228 (1).gif", type: "gif" },
      { file: "Screenshot 2026-02-16 024810.png", type: "image" },
    ],
  },
  {
    name: "Jack Fruit",
    folder: "jack fruit",
    media: [
      { file: "Create_a_seamless_202602160227 (1).gif", type: "gif" },
      { file: "Screenshot 2026-02-16 025304.png", type: "image" },
    ],
  },
  {
    name: "Mango",
    folder: "mango",
    media: [
      { file: "Create_a_seamless_202602160305.gif", type: "gif" },
      { file: "Screenshot 2026-02-16 030635.png", type: "image" },
    ],
  },
  {
    name: "Oreo",
    folder: "oreo",
    media: [
      { file: "Create_a_seamless_202602160229 (2).gif", type: "gif" },
      { file: "Screenshot 2026-02-16 024322.png", type: "image" },
    ],
  },
  {
    name: "Red Dragon Fruit",
    folder: "red dragon fruit",
    media: [
      { file: "Create_a_seamless_202602160228.gif", type: "gif" },
      { file: "Screenshot 2026-02-16 025434.png", type: "image" },
    ],
  },
  {
    name: "Tender Coconut",
    folder: "tender coconut",
    media: [
      { file: "Create_a_seamless_202602160229 (1).gif", type: "gif" },
      { file: "Screenshot 2026-02-16 024654.png", type: "image" },
    ],
  },
  {
    name: "Lotus Biscoff",
    folder: "Lotus biscoff",
    media: [
      { file: "Create_a_seamless_202602160228 (2).gif", type: "gif" },
      { file: "Screenshot 2026-02-16 024528.png", type: "image" },
    ],
  },
  {
    name: "Muskmelon",
    folder: "Muskmelon",
    media: [
      { file: "Create_a_seamless_202602160227.gif", type: "gif" },
      { file: "Screenshot 2026-02-16 024854.png", type: "image" },
    ],
  },
  {
    name: "Star Anise + Cardamom",
    folder: "Star Anise + Cardamom",
    media: [
      { file: "Create_a_seamless_202602160229.gif", type: "gif" },
      { file: "Screenshot 2026-02-16 025602.png", type: "image" },
    ],
  },
  {
    name: "Star Anise + Cardamom + Sweet Pan",
    folder: "Star Anise + Cardamom + Sweet Pan",
    media: [
      { file: "Create_a_seamless_202602160233 (1).gif", type: "gif" },
      { file: "Screenshot 2026-02-16 025524.png", type: "image" },
    ],
  },
  {
    name: "Red Fig (Anjeer)",
    folder: "Red Fig",
    media: [
      { file: "Opening_frame_shows_202602230144.gif", type: "gif" },
      { file: "Screenshot 2026-02-23 014809.png", type: "image" },
    ],
  },
  {
    name: "",
    folder: "starting",
    media: [
      { file: "Screenshot 2026-02-23 014851.png", type: "image" },
    ],
  }
];

const testimonials = [
  {
    id: 1,
    text: "We’ve always loved visiting Nyathiyas as a family. When the chance came to open our own, we knew we had to do it. The team treated us like family, and bringing these flavors to our neighborhood has been incredibly rewarding.",
    author: "",
    role: "Franchise Partner, "
  },
  {
    id: 2,
    text: "There’s something so nostalgic yet premium about their treats. Every bite feels like it was made with genuine care. Our customers don't just come for dessert; they come for the warmth of the experience.",
    author: "",
    role: "Franchise Partner"
  },
  {
    id: 3,
    text: "I didn't have much experience in food, but I knew I loved their products. The Nyathiyas team guided me patiently through every single step. Today, seeing the smiles on people's faces when they taste our menu is the best feeling.",
    author: "",
    role: "Franchise Partner"
  }
];

const faqs = [

  {
    "question": "What is the initial investment required for a Nyathiyas franchise?",
    "answer": "The investment required depends on the franchise format, outlet size, and location. Our business model is designed to be accessible while maintaining premium quality standards, making it suitable for both new and experienced entrepreneurs. Detailed investment and setup information will be shared during the franchise consultation process."
  },
  {
    question: "Do I need prior experience in the food and beverage industry?",
    answer: "No prior F&B experience is strictly required. Our turnkey model is built for driven entrepreneurs from any background. We provide comprehensive, end-to-end training covering operations, quality control, customer service, and local marketing."
  },
  {
    question: "What kind of setup support does Nyathiyas provide?",
    answer: "We offer complete setup support including site selection assistance, architectural and interior design guidelines matching our premium aesthetic, equipment sourcing, and pre-launch marketing strategies to ensure a powerful grand opening."
  },
  {
    question: "How long does it typically take to launch a franchise?",
    answer: "From the moment the agreement is signed and the location is finalized, a standard Nyathiyas outlet can be fully operational within 45 to 60 days, thanks to our streamlined setup protocols."
  },
  {
    question: "What makes the Nyathiyas business model so profitable?",
    answer: "Our profitability stems from a combination of low barrier to entry, compact setup requirements, highly optimized supply chains, and a premium product that commands excellent margins while ensuring high customer retention and loyalty."
  }
];

function IntroSequence({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4500); // 4.5s buffer to allow CSS to fully complete
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="intro-overlay">
      <div className="intro-ambient-glow"></div>
      <div className="intro-content">
        <h1 className="intro-title">Welcome to Nyathiyas</h1>
        <p className="intro-subtitle">Natural Ice Cream, Crafted in the Form of Candy</p>
      </div>
    </div>
  );
}

function TypewriterText({ text, isActive }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText("");
      setIsComplete(false);
      return;
    }

    if (!text) {
      setIsComplete(true);
      return;
    }

    let i = 0;
    let timeoutId;

    const typeChar = () => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;

        let delay = 15 + (Math.random() * 20); // Medium-slow elegant pacing
        const char = text[i - 1];
        if (['.', '?', '!'].includes(char)) delay += 100;
        else if (char === ',') delay += 40;

        timeoutId = setTimeout(typeChar, delay);
      } else {
        setIsComplete(true);
      }
    };

    // Slight delay before typing begins
    timeoutId = setTimeout(typeChar, 200);

    return () => clearTimeout(timeoutId);
  }, [text, isActive]);

  // Fallback safety: ensures complete full text render if typing finishes or if text exists but animation is skipped
  if (isActive && isComplete) {
    return <>{text}</>;
  }

  return (
    <>
      {displayedText}
      {!isComplete && isActive && (
        <span className="typing-cursor" />
      )}
    </>
  );
}

function FAQAccordion({ faqs }) {
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

function RatingPopup({ onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Close">✕</button>
        <div style={{ fontSize: '2rem', color: 'var(--gold)', marginBottom: '16px', letterSpacing: '4px' }}>★ ★ ★ ★ ★</div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: 'var(--gold-light)', marginBottom: '16px' }}>Enjoying our craft?</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '32px' }}>
          If our creations have brought warmth to your day, it would mean the world to us if you left a quick review.
        </p>
        <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          Rate Us on Google
        </a>
      </div>
    </div>
  );
}

function FranchiseFormPopup({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.target);
    // TODO: Temporary hardcoded key for testing. 
    // Later, move this key into a proper .env file for security and production deployment.
    formData.append("access_key", "4903d823-345a-4216-bd96-f5a2b0bddee4");
    formData.append("subject", "New Franchise Application - Nyathiyas");
    formData.append("from_name", "Nyathiyas Website Franchise Form");

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
            <p style={{ color: 'var(--text-muted)' }}>Thank you for your interest in joining the Nyathiyas legacy. Our franchise team will contact you shortly.</p>
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

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const handleContactSubmit = async () => {
    console.log("CONTACT FORM STARTED");

    if (!name || !email || !message) {
      setErrorMessage("Please fill in all required fields.");
      setStatus("error");
      return;
    }

    const payload = {
      access_key: process.env.REACT_APP_WEB3FORMS_KEY,
      name,
      email,
      subject,
      message
    };

    console.log("Sending payload:", payload);
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("Response:", data);

      if (data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Something went wrong. Please try again.");
        console.error("CONTACT ERROR:", data.message);
      }
    } catch (error) {
      console.error("CONTACT ERROR:", error);
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="contact-form-wrapper fade-up delay-2" style={{ textAlign: 'center', padding: '64px 32px' }}>
        <div style={{ fontSize: '3rem', color: 'var(--gold)', marginBottom: '16px' }}>✓</div>
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', color: 'var(--gold-light)', marginBottom: '16px' }}>Message Sent Successfully</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Our team will get back to you shortly.</p>
        <button className="btn btn-secondary" onClick={() => setStatus("idle")}>Send Another Message</button>
      </div>
    );
  }

  return (
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
          <input type="text" placeholder="What is this regarding?" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Message</label>
          <textarea placeholder="Write your message here..." value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
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
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(() => {
    if (sessionStorage.getItem('introShown')) return false;
    return true;
  });
  const [showPopup, setShowPopup] = useState(false);
  const [showFranchiseForm, setShowFranchiseForm] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [popupTriggered, setPopupTriggered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [aboutTilt, setAboutTilt] = useState({ x: 0, y: 0 });
  const cursorGlowRef = useRef(null);

  const handleAboutMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setAboutTilt({ x: y * -10, y: x * 10 });
  };
  const handleAboutMouseLeave = () => setAboutTilt({ x: 0, y: 0 });

  const handleIntroComplete = () => {
    sessionStorage.setItem('introShown', 'true');
    setShowIntro(false);
  };

  // Cursor glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorGlowRef.current && window.innerWidth > 768) {
        requestAnimationFrame(() => {
          if (cursorGlowRef.current) {
            cursorGlowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
          }
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);

      const scrollHeight = document.body.scrollHeight;
      const scrollPosition = window.scrollY + window.innerHeight;

      if (scrollPosition >= scrollHeight - 50) {
        setPopupTriggered((prev) => {
          if (!prev) {
            setShowPopup(true);
            return true;
          }
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const hiddenElements = document.querySelectorAll('.fade-up');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Track active section for navbar
  useEffect(() => {
    const sections = ['home', 'about', 'franchise', 'products', 'testimonials', 'faq', 'contact'];
    const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.3, rootMargin: "-10% 0px -40% 0px" });

    sectionElements.forEach(el => observer.observe(el));
    return () => sectionElements.forEach(el => observer.unobserve(el));
  }, []);

  useEffect(() => {
    if (showIntro || showPopup || showFranchiseForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showIntro, showPopup, showFranchiseForm]);

  return (
    <div className="App">
      {showIntro && <IntroSequence onComplete={handleIntroComplete} />}

      {/* ── Cursor Glow Effect ── */}
      <div className="cursor-glow" ref={cursorGlowRef}></div>

      {showPopup && <RatingPopup onClose={() => setShowPopup(false)} />}
      {showFranchiseForm && <FranchiseFormPopup onClose={() => setShowFranchiseForm(false)} />}

      {/* ── Navigation Bar ── */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-brand">
            <a href="#home">Nyathiyas</a>
          </div>

          <div className={`navbar-menu ${menuOpen ? 'is-open' : ''}`}>
            <a href="#home" className={activeSection === 'home' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#about" className={activeSection === 'about' ? 'active' : ''} onClick={() => setMenuOpen(false)}>About</a>
            <a href="#franchise" className={activeSection === 'franchise' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Franchise</a>
            <a href="#products" className={activeSection === 'products' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Products</a>
            <a href="#testimonials" className={activeSection === 'testimonials' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Testimonials</a>
            <a href="#faq" className={activeSection === 'faq' ? 'active' : ''} onClick={() => setMenuOpen(false)}>FAQ</a>
            <a href="#contact" className={activeSection === 'contact' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Contact</a>
          </div>

          <div className="navbar-actions">
            <button className="btn btn-primary btn-sm nav-btn" onClick={() => setShowFranchiseForm(true)}>Apply</button>
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
              <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
              <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero section ── */}
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

      {/* ── About Section ── */}
      <section id="about" className="about-section">
        <div className="about-ambient-glow" />
        <div className="about-container">
          <div className="about-content">
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="section-title" style={{ letterSpacing: '0.02em' }}>Our Heritage</h2>
              <h3 className="section-subtitle" style={{ color: 'var(--gold)' }}>A Tradition of Culinary Excellence Since the 1960s</h3>
            </motion.div>
            
            <div className="about-paragraphs">
              <motion.p 
                className="about-text" 
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }} 
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Serving since the 1960s, Rasavanti Cafe proudly carries forward a legacy built across three generations of passion, quality, and tradition. While natural ice cream has been cherished for decades, we pioneered the unique concept of handcrafted natural ice cream candy bars — bringing authentic flavors into an exciting new form.
              </motion.p>
              <motion.p 
                className="about-text" 
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }} 
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Born from a deep passion for culinary excellence, Nyathiyas is more than just a brand — it is a celebration of taste, craftsmanship, and premium quality. Our journey began with a simple vision: to create unforgettable treats using only the finest ingredients and real fruit flavors.
              </motion.p>
              <motion.p 
                className="about-text" 
                initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }} 
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Today, with our proven business model and unwavering commitment to perfection, we continue to set new standards in the industry while winning the hearts of customers with every bite.
              </motion.p>
            </div>
          </div>
          
          <motion.div 
            className="about-image-wrapper"
            onMouseMove={handleAboutMouseMove}
            onMouseLeave={handleAboutMouseLeave}
            animate={{ rotateX: aboutTilt.x, rotateY: aboutTilt.y }}
            transition={{ type: "spring", stiffness: 100, damping: 30 }}
            whileHover={{ boxShadow: "0 30px 60px rgba(212, 175, 55, 0.15)" }}
          >
            <img
              src="/logo.gif"
              onError={(e) => { e.target.src = '/logo.png'; e.target.onerror = null; }}
              alt="Nyathiyas Animated Logo"
              className="about-animated-logo"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Franchise Section ── */}
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
            <button className="btn btn-primary btn-lg" onClick={() => setShowFranchiseForm(true)}>Begin Your Nyathiyas Journey</button>
            <p className="cta-microcopy">Exclusive territories available. Fast review process.</p>
          </div>
        </div>
      </section>

      {/* ── Products Section ── */}
      <div id="products" className="products-container">
        {products.map((product, idx) => (
          <div key={product.folder} className={`product-section ${idx % 2 === 1 ? 'product-section--alt' : ''}`}>
            <div className="product-inner">
              <div className="product-label fade-up">
                <span className="product-number">No. {String(idx + 1).padStart(2, '0')}</span>
                <h2 className="product-title">{product.name || "Signature Blend"}</h2>
              </div>
              <div className="product-media">
                {product.media.map((item, mIdx) => {
                  const src = `/gif/${product.folder}/${item.file}`;
                  return (
                    <div key={item.file} className={`media-wrap fade-up delay-${mIdx + 1} ${item.type === 'gif' ? 'media-wrap--gif' : 'media-wrap--image'}`}>
                      <img
                        src={src}
                        alt={`${product.name} showcase`}
                        className={item.type === 'gif' ? 'media-gif' : 'media-image'}
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Testimonials Section ── */}
      <section id="testimonials" className="testimonials-section">
        <div className="testimonials-container">
          <div className="fade-up">
            <h2 className="section-title" style={{ textAlign: 'center' }}>The Nyathiyas Experience</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 64px' }}>Discover what our partners say about joining the Nyathiyas family.</p>
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

      {/* ── FAQ Section ── */}
      <section id="faq" className="faq-section">
        <div className="faq-container">
          <div className="fade-up">
            <h2 className="section-title" style={{ textAlign: 'center' }}>Franchise FAQs</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto' }}>Common questions about starting your journey with us.</p>
          </div>

          <FAQAccordion faqs={faqs} />
        </div>
      </section>

      {/* ── Final CTA Section ── */}
      <section className="final-cta-section">
        <div className="final-cta-container fade-up">
          <h2 className="section-title" style={{ color: '#fff', fontSize: 'clamp(3rem, 6vw, 4.5rem)', marginBottom: '32px' }}>Crafting Luxury, Together.</h2>
          <p className="section-subtitle" style={{ color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '600px' }}>Take the next step towards owning a high-end business with our proven and elegant franchise model.</p>
          <button className="btn btn-primary btn-xl" onClick={() => setShowFranchiseForm(true)}>Secure Your Franchise</button>
        </div>
      </section>

      {/* ── Contact Form Section ── */}
      <section id="contact" className="contact-section">
        <div className="contact-container">
          <div className="contact-info fade-up">
            <h2>Get in Touch</h2>
            <p>Whether you have a question, a business proposal, or simply want to connect with us, our team is always here to assist you with care and prompt support.</p>            <div className="contact-details">
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

          <ContactForm />
        </div>
      </section>

      <footer className="page-footer">
        <p>©  NYATHIYAS. ALL RIGHTS RESERVED.</p>
      </footer>

      <FloatingWhatsApp />
    </div>
  );
}

function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/919380992619?text=Hello%20I%20am%20interested%20in%20Nyathiyas%20Franchise"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
      aria-label="Chat With Us on WhatsApp"
    >
      <div className="floating-whatsapp-tooltip">Chat With Us</div>
      <div className="floating-whatsapp-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      </div>
    </a>
  );
}

export default App;
