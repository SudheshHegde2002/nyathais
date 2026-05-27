import { useState } from 'react';
import { motion } from 'framer-motion';
import './About.css';

export default function About() {
  const [aboutTilt, setAboutTilt] = useState({ x: 0, y: 0 });

  const handleAboutMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setAboutTilt({ x: y * -5, y: x * 5 }); // Softer tilt for premium feel
  };

  const handleAboutMouseLeave = () => setAboutTilt({ x: 0, y: 0 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 1.2, ease: [0.25, 0.4, 0.1, 1] }
    }
  };

  return (
    <section id="about" className="about-section">
      <div className="about-ambient-glow" />
      <div className="about-container">
        <motion.div
          className="about-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
        >
          <motion.div variants={itemVariants}>
            <h2 className="section-title" style={{ letterSpacing: '0.02em' }}>Our Heritage</h2>
            <h3 className="section-subtitle" style={{ color: 'var(--gold)' }}>A Tradition of Culinary Excellence Since the 1960s</h3>
          </motion.div>

          <div className="about-paragraphs">
            <motion.p className="about-text" variants={itemVariants}>
              Serving since the 1960s, Rasavanti Cafe proudly carries forward a legacy built across three generations of passion, quality, and tradition. While natural ice cream has been cherished for decades, we pioneered the unique concept of handcrafted natural ice cream candy bars — bringing authentic flavors into an exciting new form.
            </motion.p>
            <motion.p className="about-text" variants={itemVariants}>
              Born from a deep passion for culinary excellence, Nyathiya's is more than just a brand — it is a celebration of taste, craftsmanship, and premium quality. Our journey began with a simple vision: to create unforgettable treats using only the finest ingredients and real fruit flavors.
            </motion.p>
            <motion.p className="about-text" variants={itemVariants}>
              Today, with our proven business model and unwavering commitment to perfection, we continue to set new standards in the industry while winning the hearts of customers with every bite.
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          className="about-image-wrapper"
          onMouseMove={handleAboutMouseMove}
          onMouseLeave={handleAboutMouseLeave}
          animate={{ rotateX: aboutTilt.x, rotateY: aboutTilt.y }}
          transition={{ type: "spring", stiffness: 80, damping: 30 }}
        >
          <img
            src="/logo.gif"
            onError={(e) => { e.target.src = '/logo.png'; e.target.onerror = null; }}
            alt="Nyathiya's Animated Logo"
            className="about-animated-logo"
          />
        </motion.div>
      </div>
    </section>
  );
}
