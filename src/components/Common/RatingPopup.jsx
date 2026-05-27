import './Popup.css';

const GOOGLE_REVIEW_LINK = "https://www.google.com/search?sca_esv=b622e0e69be708e0&sxsrf=ANbL-n4D2hdEGHr6Z4wZnlnxJo2UmNShRQ:1771792092724&q=rasavanti+juice+centre+(cafe)+sirsi+reviews+page&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOcOQQT2UuNYPKN8jHbUNk_TmM6OjT4KqcgIP3elK38yqrlr2OduO-RD181ip_Z5BxiaqUAtJUGyTyg-XiYDmjY-nKcPW9BzuKy4yZo9dJNIyMW75jA%3D%3D&sa=X&ved=2ahUKEwiD2bXy9-2SAxVeTmwGHW4SORAQrrQLegQIGxAA&biw=1522&bih=736&dpr=1.25&zx=1771792186825&no_sw_cr=1#lrd=0x3bbea92bc99dd9d9:0x5ebfcfff1ad73ee4,3";

export default function RatingPopup({ onClose }) {
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
