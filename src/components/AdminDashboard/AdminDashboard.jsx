import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, ShoppingBag, Plus, Edit2, Search, Filter, Clock,
  AlertCircle, Users, User,
  MapPin, Phone, Mail, Check, ArrowLeft,
  Volume2, VolumeX, Package
} from 'lucide-react';
import { supabaseService } from '../../supabase';
import { formatDate } from '../../utils/dateFormatter';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [userSession, setUserSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'shops', 'flavors'
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [flavors, setFlavors] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [shopFilter, setShopFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  // Sound trigger state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals state
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [editingFlavor, setEditingFlavor] = useState(null);

  // Form States - Shop
  const [shopForm, setShopForm] = useState({
    shop_code: '', 
    shop_name: '', 
    store_location: '', 
    owner_name: '', 
    phone: '', 
    email: '',
    partner_code: '', 
    route_slug: '', 
    profile_image: '', 
    store_banner: '',
    bio: '',
    secondary_phone: ''
  });
  // Form States - Flavor
  const [flavorForm, setFlavorForm] = useState({
    flavor_name: '', category: 'Signature', image_url: '', notes: ''
  });

  const ordersRef = useRef([]);

  // Check login session
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const session = await supabaseService.getCurrentUser();
      if (session) {
        if (session.profile.role !== 'admin') {
          setAuthError('Access Denied: This portal is for admin accounts only.');
          await supabaseService.signOut();
        } else {
          setUserSession(session);
          loadDashboardData();
        }
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setAuthLoading(true);
    setAuthError('');
    try {
      const data = await supabaseService.signIn(email, password);
      if (data.profile.role !== 'admin') {
        setAuthError('Access Denied: This portal is for admin accounts only.');
        await supabaseService.signOut();
      } else {
        setUserSession(data);
        loadDashboardData();
      }
    } catch (err) {
      setAuthError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseService.signOut();
      setUserSession(null);
      setOrders([]);
      setShops([]);
      setFlavors([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const loadDashboardData = async () => {
    try {
      const ordersList = await supabaseService.getOrders();
      const shopsList = await supabaseService.getAllShopsAdmin();
      const flavorsList = await supabaseService.getFlavors(false); // get active & inactive

      setOrders(ordersList);
      ordersRef.current = ordersList; // Store in ref to check against new orders in realtime
      setShops(shopsList);
      setFlavors(flavorsList);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  // Synthesize a premium brand chime when a new order arrives
  const playNewOrderChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // Tone 1 (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Tone 2 (E5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now + 0.15);
      gain2.gain.setValueAtTime(0.15, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.45);

      // Tone 3 (G5)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.3);
      gain3.gain.setValueAtTime(0.2, now + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.3);
      osc3.stop(now + 0.8);

    } catch (e) {
      console.warn('Web Audio API not supported or blocked by browser policy:', e);
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!userSession) return;

    const unsubscribe = supabaseService.subscribeToOrders((payload) => {
      // Check if it's an INSERT (new order)
      if (payload.eventType === 'INSERT') {
        // Double check if we already have it in state
        const exists = ordersRef.current.some(o => o.id === payload.new.id);
        if (!exists) {
          playNewOrderChime();
        }
      }

      // Reload dashboard data
      loadDashboardData();

      // If the expanded order is the one updated, reload its history
      if (selectedOrder && selectedOrder.id === payload.new.id) {
        // Fetch new status history
        supabaseService.getOrderHistory(selectedOrder.id).then(setOrderHistory);
        // Merge the updated order fields into selectedOrder
        setSelectedOrder(prev => prev ? { ...prev, status: payload.new.status } : null);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSession, selectedOrder, soundEnabled]);

  // Load selected order history
  useEffect(() => {
    if (selectedOrder) {
      supabaseService.getOrderHistory(selectedOrder.id).then(setOrderHistory);
    }
  }, [selectedOrder]);

  // Update order status handler
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updated = await supabaseService.updateOrderStatus(orderId, newStatus);

      // Trigger local mock realtime change event
      supabaseService.triggerLocalOrderChange('UPDATE', updated);

      loadDashboardData();

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        const history = await supabaseService.getOrderHistory(orderId);
        setOrderHistory(history);
      }
    } catch (err) {
      alert('Error updating order status: ' + err.message);
    }
  };

  // Shop forms handlers
  const handleOpenShopModal = (shop = null) => {
    if (shop) {
      setEditingShop(shop);
      setShopForm({
        shop_code: shop.shop_code || '',
        shop_name: shop.shop_name || '',
        store_location: shop.store_location || '',
        owner_name: shop.owner_name || '',
        phone: shop.phone || '',
        email: shop.email || '',
        partner_code: shop.partner_code || '',
        route_slug: shop.route_slug || '',
        profile_image: shop.profile_image || '',
        store_banner: shop.store_banner || '',
        bio: shop.bio || '',
        secondary_phone: shop.secondary_phone || ''
      });
    } else {
      setEditingShop(null);
      setShopForm({
        shop_code: '',
        shop_name: '',
        store_location: '',
        owner_name: '',
        phone: '',
        email: '',
        partner_code: '',
        route_slug: '',
        profile_image: '',
        store_banner: '',
        bio: '',
        secondary_phone: ''
      });
    }
    setIsShopModalOpen(true);
  };

  const handleImageUpload = (e, targetField) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("Image file is too large. Please select an image smaller than 2MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setShopForm(prev => ({
        ...prev,
        [targetField]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingShop) {
        await supabaseService.updateShop(editingShop.id, shopForm);
      } else {
        await supabaseService.createShop(shopForm);
      }
      setIsShopModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to save store: ' + err.message);
    }
  };

  const toggleShopActive = async (shop) => {
    try {
      await supabaseService.updateShop(shop.id, { active: !shop.active });
      loadDashboardData();
    } catch (err) {
      alert('Error toggling shop status: ' + err.message);
    }
  };

  // Flavor forms handlers
  const handleOpenFlavorModal = (flavor = null) => {
    if (flavor) {
      setEditingFlavor(flavor);
      setFlavorForm({
        flavor_name: flavor.flavor_name,
        category: flavor.category,
        image_url: flavor.image_url || '',
        notes: flavor.notes || ''
      });
    } else {
      setEditingFlavor(null);
      setFlavorForm({
        flavor_name: '', category: 'Signature', image_url: '', notes: ''
      });
    }
    setIsFlavorModalOpen(true);
  };

  const handleFlavorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFlavor) {
        await supabaseService.updateFlavor(editingFlavor.id, flavorForm);
      } else {
        await supabaseService.createFlavor(flavorForm);
      }
      setIsFlavorModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to save flavor: ' + err.message);
    }
  };

  const toggleFlavorActive = async (flavor) => {
    try {
      await supabaseService.updateFlavor(flavor.id, { active: !flavor.active });
      loadDashboardData();
    } catch (err) {
      alert('Error toggling flavor availability: ' + err.message);
    }
  };

  // Analytics Stats helpers
  const getStats = () => {
    const todayStr = new Date().toDateString();

    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === todayStr);
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const activeShopsCount = shops.filter(s => s.active).length;

    let totalTubs = 0;
    orders.forEach(o => {
      o.order_items?.forEach(i => {
        totalTubs += i.quantity;
      });
    });

    return {
      todayCount: todayOrders.length,
      pendingCount,
      activeShopsCount,
      totalTubs
    };
  };

  const stats = getStats();

  // Filters logic for Orders
  const filteredOrders = orders.filter(o => {
    const shop = o.shops || {};
    const matchesSearch = o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.shop_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter.toLowerCase();
    const matchesShop = shopFilter === 'All' || o.shop_id === shopFilter;

    return matchesSearch && matchesStatus && matchesShop;
  });

  // Render Loader
  if (loading) {
    return (
      <div className="portal-loader-container">
        <div className="luxury-spinner"></div>
        <p className="loader-text">Loading Admin Control Panel...</p>
      </div>
    );
  }

  // Render Login
  if (!userSession) {
    return (
      <div className="portal-login-wrapper">
        <div className="login-backdrop-glow"></div>
        <div className="login-card-container">
          <div className="login-header">
            <span className="brand-title">Nyathiya's</span>
            <span className="brand-subtitle">Admin Control Center</span>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {authError && (
              <div className="login-error-alert">
                <AlertCircle size={18} />
                <span>{authError}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nyathiyas.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Security Password</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={authLoading}>
              {authLoading ? <div className="spinner-sm"></div> : 'Verify Credentials'}
            </button>
          </form>

          <div className="login-helper-box">
            <h4>Quick Testing Admin</h4>
            <div className="helper-item" onClick={() => { setEmail('admin@nyathiyas.com'); setPassword('password'); }}>
              <strong>Admin Profile:</strong> admin@nyathiyas.com / password
            </div>
          </div>

          <button className="back-to-web-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Public Brand Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* HEADER */}
      <header className="admin-main-header">
        <div className="header-brand">
          <span className="brand-logo" onClick={() => navigate('/')}>Nyathiya's</span>
          <div className="admin-badge">
            <span className="admin-badge-pill">ADMIN</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="realtime-status-pill">
            <span className="pulse-dot"></span>
            <span>Live Stream</span>
          </div>

          <button
            className={`header-nav-btn ${activeTab === 'flavors' ? 'active' : ''}`}
            onClick={() => { setActiveTab('flavors'); setSelectedOrder(null); }}
          >
            <Package size={18} />
            <span>Catalog</span>
          </button>

          <button
            className={`header-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
          </button>

          <button
            className={`header-nav-btn ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => { setActiveTab('shops'); setSelectedOrder(null); }}
          >
            <Users size={18} />
            <span>Stores</span>
          </button>

          {/* Sound Controls relocated to header icon group */}
          <button
            className={`sound-nav-btn ${soundEnabled ? 'enabled' : 'disabled'}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute notification sounds' : 'Unmute notification sounds'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* DASHBOARD SUMMARY CARDS */}
      <section className="dashboard-stats-strip">
        <div className="stat-card">
          <div className="stat-icon-wrap yellow">
            <ShoppingBag size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.todayCount}</span>
            <span className="stat-label">Orders Today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap purple">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.pendingCount}</span>
            <span className="stat-label">Pending Approval</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap blue">
            <Users size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.activeShopsCount}</span>
            <span className="stat-label">Partner Shops</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap green">
            <Package size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.totalTubs}</span>
            <span className="stat-label">Total Tubs</span>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="admin-main-content">

        {/* TABS 1: ORDERS FEED */}
        {activeTab === 'orders' && (
          <div className="orders-feed-layout">

            {/* Left side: Orders list */}
            <div className="feed-orders-list-pane">
              <div className="pane-header-filters">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by order or shop code..."
                  />
                </div>

                <div className="filters-row">
                  <div className="select-wrapper">
                    <Filter size={14} className="filter-icon" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  <div className="select-wrapper">
                    <Filter size={14} className="filter-icon" />
                    <select value={shopFilter} onChange={(e) => setShopFilter(e.target.value)}>
                      <option value="All">All Stores</option>
                      {shops.map(s => (
                        <option key={s.id} value={s.id}>{s.shop_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="empty-results-box">
                  <p>No orders matching filters found.</p>
                </div>
              ) : (
                <div className="admin-orders-scroll-list">
                  {filteredOrders.map(order => {
                    const shop = order.shops || {};
                    const totalQty = order.order_items?.reduce((a, b) => a + b.quantity, 0) || 0;
                    const isSelected = selectedOrder && selectedOrder.id === order.id;

                    return (
                      <div
                        className={`admin-order-row-card ${isSelected ? 'selected' : ''} ${order.status === 'pending' ? 'new-alert' : ''}`}
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="order-row-top">
                          <strong className="order-num">{order.order_number}</strong>
                          <span className={`status-tag ${order.status}`}>{order.status}</span>
                        </div>
                        <div className="order-row-mid">
                          <span className="shop-title">{shop.shop_name}</span>
                          <span className="shop-code-tag">{shop.shop_code}</span>
                        </div>
                        <div className="order-row-bot">
                          <span className="time">{formatDate(order.created_at)}</span>
                          <strong className="qty">{totalQty} Tubs</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right side: Detailed View Pane */}
            <div className="feed-order-details-pane">
              {selectedOrder ? (
                <div className="order-details-wrapper fade-in-up">
                  <div className="details-header">
                    <div>
                      <h2>Order {selectedOrder.order_number}</h2>
                      <p className="order-date-text">Received: {formatDate(selectedOrder.created_at)}</p>
                    </div>

                    {/* Status updater actions dropdown */}
                    <div className="status-action-box">
                      <label>Action Status:</label>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                        className={`status-dropdown-select ${selectedOrder.status}`}
                      >
                        <option value="pending">Pending Approval</option>
                        <option value="accepted">Accept Order</option>
                        <option value="preparing">Set to Preparing</option>
                        <option value="dispatched">Set to Dispatched</option>
                        <option value="delivered">Set to Delivered</option>
                      </select>
                    </div>
                  </div>

                  <div className="details-grid">

                    {/* Destination Store */}
                    <div className="details-card-block">
                      <h3>Store Delivery Address</h3>
                      <div className="store-address-card">
                        <strong className="store-name">{selectedOrder.shops?.shop_name}</strong>
                        <p className="address"><MapPin size={14} style={{ marginRight: '6px' }} /> {selectedOrder.shops?.store_location}</p>

                        <div className="contact-details-row">
                          <span><Users size={12} /> {selectedOrder.shops?.owner_name}</span>
                          <span><Phone size={12} /> {selectedOrder.shops?.phone}</span>
                          <span><Mail size={12} /> {selectedOrder.shops?.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Flavors Grid */}
                    <div className="details-card-block">
                      <h3>Batch Tubs Ordered</h3>
                      <div className="ordered-items-table">
                        <div className="table-header-row">
                          <span>Gourmet Flavor</span>
                          <span>Category</span>
                          <span style={{ textAlign: 'right' }}>Quantity</span>
                        </div>
                        <div className="table-body-rows">
                          {selectedOrder.order_items?.map(item => (
                            <div className="table-body-row" key={item.id}>
                              <span className="name">{item.flavors?.flavor_name}</span>
                              <span className="category">{item.flavors?.category}</span>
                              <strong className="qty" style={{ textAlign: 'right' }}>{item.quantity} Tubs</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedOrder.notes && (
                        <div className="admin-order-notes-box">
                          <strong>Store Instructions:</strong>
                          <p>"{selectedOrder.notes}"</p>
                        </div>
                      )}
                    </div>

                    {/* Status Log timeline */}
                    <div className="details-card-block">
                      <h3>Status Transition History</h3>
                      <div className="audit-timeline">
                        {orderHistory.map((history, idx) => (
                          <div className="audit-step" key={history.id || idx}>
                            <span className="bullet"></span>
                            <div className="step-info">
                              <strong className="status-name uppercase">{history.status}</strong>
                              <span className="audit-meta">
                                Changed At: {formatDate(history.changed_at)} by System / Admin
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="no-order-selected-box">
                  <ShoppingBag size={48} className="icon" />
                  <h3>No order selected</h3>
                  <p>Click on any batch card in the feed stream to view shipping items, address parameters, and update status.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TABS 2: STORES MANAGEMENT */}
        {activeTab === 'shops' && (
          <div className="stores-mgmt-tab fade-in-up">
            <div className="tab-actions-row">
              <h2>Partner Store Directory</h2>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenShopModal()}>
                <Plus size={16} style={{ marginRight: '6px' }} /> Add New Partner Shop
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Shop Code</th>
                    <th>Shop Name / Slug</th>
                    <th>Partner Access Code</th>
                    <th>Location Address</th>
                    <th>Contact Person</th>
                    <th>Phone / Email</th>
                    <th>Security Login</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map(shop => (
                    <tr key={shop.id} className={!shop.active ? 'disabled-row' : ''}>
                      <td><span className="shop-code-badge">{shop.shop_code}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="admin-partner-avatar-wrapper">
                            {shop.profile_image ? (
                              <img src={shop.profile_image} alt={shop.shop_name} className="admin-partner-avatar-img" />
                            ) : (
                              <div className="admin-partner-avatar-fallback">{shop.shop_name.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <strong style={{ color: 'var(--gold-light)' }}>{shop.shop_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>slug: /{shop.route_slug || 'n/a'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code style={{ color: 'var(--gold)', letterSpacing: '0.5px', fontWeight: '600' }}>
                          {shop.partner_code || 'N/A'}
                        </code>
                      </td>
                      <td><p className="cell-address-text">{shop.store_location}</p></td>
                      <td>{shop.owner_name}</td>
                      <td>
                        <div className="contact-cell">
                          <span>{shop.phone}</span>
                          <span className="sub">{shop.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="login-cred-cell">
                          <span>{shop.email}</span>
                          <span className="sub">password: password</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-dot-pill ${shop.active ? 'active' : 'inactive'}`}>
                          {shop.active ? 'Active Partner' : 'Suspended'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <button className="action-circle-btn edit" onClick={() => handleOpenShopModal(shop)} title="Edit Store">
                            <Edit2 size={14} />
                          </button>
                          <button
                            className={`action-circle-btn toggle ${shop.active ? 'active' : 'inactive'}`}
                            onClick={() => toggleShopActive(shop)}
                            title={shop.active ? 'Suspend Store' : 'Activate Store'}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABS 3: FLAVORS CATALOG */}
        {activeTab === 'flavors' && (
          <div className="flavors-mgmt-tab fade-in-up">
            <div className="tab-actions-row">
              <h2>Gourmet Batch Catalog</h2>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenFlavorModal()}>
                <Plus size={14} style={{ marginRight: '4px' }} /> Add Flavor
              </button>
            </div>

            <div className="flavors-admin-grid">
              {flavors.map(flavor => (
                <div className={`flavor-admin-card ${!flavor.active ? 'disabled-flavor' : ''}`} key={flavor.id}>
                  <div className="flavor-img-box">
                    {flavor.image_url ? (
                      <img src={flavor.image_url} alt={flavor.flavor_name} />
                    ) : (
                      <div className="fallback-img"><ShoppingBag size={24} /></div>
                    )}
                    <span className="cat-badge">{flavor.category}</span>
                  </div>
                  <div className="flavor-body">
                    <div className="flavor-header-line">
                      <h3>{flavor.flavor_name}</h3>
                      <span className={`availability-status ${flavor.active ? 'in-stock' : 'out-of-stock'}`}>
                        {flavor.active ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <p className="notes">{flavor.notes || 'No description provided.'}</p>

                    <div className="flavor-card-footer">
                      <button className="btn btn-secondary btn-sm edit-btn" onClick={() => handleOpenFlavorModal(flavor)}>
                        ✏ Edit
                      </button>

                      <button
                        className={`toggle-availability-btn ${flavor.active ? 'active' : 'inactive'}`}
                        onClick={() => toggleFlavorActive(flavor)}
                      >
                        {flavor.active ? '🚫 Disable' : '✔️ Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* SHOP ADD/EDIT MODAL */}
      {isShopModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in-up">
            <div className="modal-header">
              <h3>{editingShop ? 'Modify Partner Store' : 'Register New Partner'}</h3>
              <button className="close-btn" onClick={() => setIsShopModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleShopSubmit}>
              <div className="modal-body">
                <div className="modal-form-grid">
                  <div className="form-group">
                    <label>Store Code (Unique ID)</label>
                    <input
                      type="text"
                      value={shopForm.shop_code}
                      onChange={(e) => setShopForm(prev => ({ ...prev, shop_code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. SH-ANDH-04"
                      required
                      disabled={!!editingShop}
                    />
                  </div>
                  <div className="form-group">
                    <label>Store Name</label>
                    <input
                      type="text"
                      value={shopForm.shop_name}
                      onChange={(e) => setShopForm(prev => ({ ...prev, shop_name: e.target.value }))}
                      placeholder="e.g. Nyathiyas Andheri Hub"
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Physical Location Address</label>
                    <input
                      type="text"
                      value={shopForm.store_location}
                      onChange={(e) => setShopForm(prev => ({ ...prev, store_location: e.target.value }))}
                      placeholder="Street address, block details, Mumbai"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Owner/Contact Person</label>
                    <input
                      type="text"
                      value={shopForm.owner_name}
                      onChange={(e) => setShopForm(prev => ({ ...prev, owner_name: e.target.value }))}
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={shopForm.phone}
                      onChange={(e) => setShopForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Contact Email (Used for login)</label>
                    <input
                      type="email"
                      value={shopForm.email}
                      onChange={(e) => setShopForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="store@nyathiyas.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Partner Access Code (Secret Login Code)</label>
                    <input
                      type="text"
                      value={shopForm.partner_code}
                      onChange={(e) => setShopForm(prev => ({ ...prev, partner_code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. NYA-COL-1860"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Route URL Slug (e.g. colaba, bandra)</label>
                    <input
                      type="text"
                      value={shopForm.route_slug}
                      onChange={(e) => setShopForm(prev => ({ ...prev, route_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') }))}
                      placeholder="e.g. colaba"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Secondary Contact Number (Optional)</label>
                    <input
                      type="text"
                      value={shopForm.secondary_phone}
                      onChange={(e) => setShopForm(prev => ({ ...prev, secondary_phone: e.target.value }))}
                      placeholder="e.g. +91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Picture (DP / Owner Photo)</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                      {shopForm.profile_image ? (
                        <img src={shopForm.profile_image} alt="DP Preview" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--gold)' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'profile_image')}
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Store Cover Banner</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                      {shopForm.store_banner ? (
                        <img src={shopForm.store_banner} alt="Banner Preview" style={{ width: '80px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--gold)' }} />
                      ) : (
                        <div style={{ width: '80px', height: '40px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'store_banner')}
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Store Bio / Description</label>
                    <textarea
                      value={shopForm.bio}
                      onChange={(e) => setShopForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Describe the partner parlour details..."
                      rows={3}
                      style={{ width: '100%', padding: '10px', background: 'rgba(28, 8, 38, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: 'var(--text-main)', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsShopModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Partner Shop</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLAVOR ADD/EDIT MODAL */}
      {isFlavorModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in-up">
            <div className="modal-header">
              <h3>{editingFlavor ? 'Modify Flavor details' : 'Add New Gourmet Flavor'}</h3>
              <button className="close-btn" onClick={() => setIsFlavorModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleFlavorSubmit}>
              <div className="modal-body">
                <div className="modal-form-grid">
                  <div className="form-group">
                    <label>Flavor Name</label>
                    <input
                      type="text"
                      value={flavorForm.flavor_name}
                      onChange={(e) => setFlavorForm(prev => ({ ...prev, flavor_name: e.target.value }))}
                      placeholder="e.g. Pistachio Cardamom Royal"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={flavorForm.category}
                      onChange={(e) => setFlavorForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="Signature">Signature</option>
                      <option value="Classic">Classic</option>
                      <option value="Exotic">Exotic</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Flavor Image URL</label>
                    <input
                      type="url"
                      value={flavorForm.image_url}
                      onChange={(e) => setFlavorForm(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="Unsplash or static directory URL"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Gourmet Notes/Flavor Description</label>
                    <textarea
                      value={flavorForm.notes}
                      onChange={(e) => setFlavorForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Ingredient specs, allergen notes, churn batch description."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFlavorModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Flavor</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
