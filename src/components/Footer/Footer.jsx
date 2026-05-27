import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="page-footer">
      <div className="footer-container">
        <p className="copyright">© NYATHIYA'S. ALL RIGHTS RESERVED.</p>
        <div className="footer-links">
          <Link to="/shop" className="footer-link">Partner Portal</Link>
          <span className="footer-divider">•</span>
          <Link to="/admin" className="footer-link">Admin Console</Link>
        </div>
      </div>
    </footer>
  );
}

