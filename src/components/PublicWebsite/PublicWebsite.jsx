import { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import Hero from '../Hero/Hero';
import About from '../About/About';
import Franchise from '../Franchise/Franchise';
import Products from '../Products/Products';
import Testimonials from '../Testimonials/Testimonials';
import FAQ from '../FAQ/FAQ';
import Contact from '../Contact/Contact';
import FinalCTA from '../FinalCTA/FinalCTA';
import Footer from '../Footer/Footer';
import FloatingWhatsApp from '../FloatingWhatsApp/FloatingWhatsApp';
import IntroSequence from '../IntroSequence/IntroSequence';
import RatingPopup from '../Common/RatingPopup';
import FranchiseFormPopup from '../Common/FranchiseFormPopup';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function PublicWebsite() {
  const [showIntro, setShowIntro] = useState(() => {
    if (sessionStorage.getItem('introShown')) return false;
    return true;
  });
  const [showPopup, setShowPopup] = useState(false);
  const [showFranchiseForm, setShowFranchiseForm] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [popupTriggered, setPopupTriggered] = useState(false);

  useScrollReveal();

  const handleIntroComplete = () => {
    sessionStorage.setItem('introShown', 'true');
    setShowIntro(false);
  };

  useEffect(() => {
    const handleScroll = () => {
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
    return () => window.removeEventListener('scroll', handleScroll);
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
    <>
      {showIntro && <IntroSequence onComplete={handleIntroComplete} />}
      {showPopup && <RatingPopup onClose={() => setShowPopup(false)} />}
      {showFranchiseForm && <FranchiseFormPopup onClose={() => setShowFranchiseForm(false)} />}

      <Navbar setShowFranchiseForm={setShowFranchiseForm} />
      <Hero setShowFranchiseForm={setShowFranchiseForm} />
      <About />
      <Franchise setShowFranchiseForm={setShowFranchiseForm} />
      <Products />
      <Testimonials />
      <FAQ />
      <FinalCTA setShowFranchiseForm={setShowFranchiseForm} />
      <Contact />
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
