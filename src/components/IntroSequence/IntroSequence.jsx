import { useEffect } from 'react';
import './IntroSequence.css';

export default function IntroSequence({ onComplete }) {
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
        <h1 className="intro-title">Welcome to Nyathiya's</h1>
        <p className="intro-subtitle">Natural Ice Cream, Crafted in the Form of Candy</p>
      </div>
    </div>
  );
}
