import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar({ setShowFranchiseForm }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <a href="#home">Nyathiya's</a>
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
  );
}
