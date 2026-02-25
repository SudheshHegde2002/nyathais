import { useState, useEffect } from 'react';
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

function RatingPopup({ onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <button className="popup-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="popup-stars">★ ★ ★ ★ ★</div>
        <h2 className="popup-heading">Enjoying our flavours?</h2>
        <p className="popup-body">
          If you love what we're crafting, it would mean the world to us if you
          left us a quick Google review! It only takes a second. 💛
        </p>
        <a
          href={GOOGLE_REVIEW_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="popup-btn"
        >
          ⭐ Rate Us on Google
        </a>
      </div>
    </div>
  );
}

function App() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // small delay so the page loads before popup appears
    const timer = setTimeout(() => setShowPopup(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      {/* ── Rating popup ── */}
      {showPopup && <RatingPopup onClose={() => setShowPopup(false)} />}

      {/* ── Page header ── */}
      <header className="page-header">
        <img src="/logo.png" alt="Nyathiyas logo" className="header-logo" />
        <div className="header-divider" />
      </header>

      {/* ── Product sections ── */}
      {products.map((product, idx) => (
        <div key={product.folder} className={`product-section ${idx % 2 === 1 ? 'product-section--alt' : ''}`}>
          <div className="product-inner">
            <div className="product-label">
              <span className="product-number">{String(idx + 1).padStart(2, '0')}</span>
              <h2 className="product-title">{product.name}</h2>
            </div>
            <div className="product-media">
              {product.media.map((item) => {
                const src = `/gif/${product.folder}/${item.file}`;
                return (
                  <div key={item.file} className={`media-wrap ${item.type === 'gif' ? 'media-wrap--gif' : 'media-wrap--image'}`}>
                    <img
                      src={src}
                      alt={`${product.name} - ${item.type === 'gif' ? 'animation' : 'preview'}`}
                      className={item.type === 'gif' ? 'media-gif' : 'media-image'}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <footer className="page-footer">
        <p>© 2026 Nyathiyas · Made with 💛</p>
      </footer>
    </div>
  );
}

export default App;
