import { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicWebsite from './components/PublicWebsite/PublicWebsite';
import ShopkeeperPortal from './components/ShopkeeperPortal/ShopkeeperPortal';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import useCursorGlow from './hooks/useCursorGlow';
import './App.css';

export default function App() {
  const cursorGlowRef = useRef(null);
  useCursorGlow(cursorGlowRef);

  return (
    <Router>
      <div className="App">
        <div className="cursor-glow" ref={cursorGlowRef}></div>

        <Routes>
          {/* Public Brand Website */}
          <Route path="/" element={<PublicWebsite />} />

          {/* Shopkeeper Ordering Portal */}
          <Route path="/shop/*" element={<ShopkeeperPortal />} />

          {/* Admin Management Dashboard */}
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
