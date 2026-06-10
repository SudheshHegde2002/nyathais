import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, ShoppingBag, History, User, MapPin, Phone, Mail,
  Plus, Minus, Check, Search, FileText, ChevronRight, Clock,
  Truck, CheckCircle, Package, AlertCircle, ShoppingCart, ArrowLeft,
  ArrowRightLeft, AlertTriangle, RefreshCw
} from 'lucide-react';
import { supabaseService } from '../../supabase';
import { formatDate } from '../../utils/dateFormatter';
import './ShopkeeperPortal.css';

export default function ShopkeeperPortal() {
  const navigate = useNavigate();
  const [userSession, setUserSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Portal State
  const [activeTab, setActiveTab] = useState('order'); // 'order', 'parlour_stock', 'history', 'profile'
  const [flavors, setFlavors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [parlourStock, setParlourStock] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart State
  const [cart, setCart] = useState({}); // { flavor_id: quantity }
  const [notes, setNotes] = useState('');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [submittedOrderDetails, setSubmittedOrderDetails] = useState(null); // Success screen

  // Expanded Order in History
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Profile Customization State
  const [profileForm, setProfileForm] = useState({
    secondary_phone: '',
    bio: '',
    profile_image: '',
    store_banner: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Parlour Adjustment Modal State
  const [isParlourAdjustOpen, setIsParlourAdjustOpen] = useState(false);
  const [selectedStockForAdjust, setSelectedStockForAdjust] = useState(null);
  const [parlourAdjustQty, setParlourAdjustQty] = useState(1);
  const [parlourAdjustType, setParlourAdjustType] = useState('damaged'); // 'damaged', 'adjustment'
  const [parlourAdjustNotes, setParlourAdjustNotes] = useState('');

  // Parlour Return Modal State
  const [isParlourReturnOpen, setIsParlourReturnOpen] = useState(false);
  const [selectedStockForReturn, setSelectedStockForReturn] = useState(null);
  const [parlourReturnQty, setParlourReturnQty] = useState(5);
  const [parlourReturnNotes, setParlourReturnNotes] = useState('');

  // Load initial session
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const session = await supabaseService.getCurrentUser();
      if (session) {
        if (session.profile.role !== 'shopkeeper') {
          setAuthError('Access Denied: This portal is for shopkeeper accounts only.');
          await supabaseService.signOut();
        } else {
          setUserSession(session);
          setProfileForm({
            secondary_phone: session.profile.shops?.secondary_phone || '',
            bio: session.profile.shops?.bio || '',
            profile_image: session.profile.shops?.profile_image || '',
            store_banner: session.profile.shops?.store_banner || ''
          });
          loadPortalData(session.profile.shop_id);
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
      if (data.profile.role !== 'shopkeeper') {
        setAuthError('Access Denied: This portal is for shopkeeper accounts only.');
        await supabaseService.signOut();
      } else {
        setUserSession(data);
        setProfileForm({
          secondary_phone: data.profile.shops?.secondary_phone || '',
          bio: data.profile.shops?.bio || '',
          profile_image: data.profile.shops?.profile_image || '',
          store_banner: data.profile.shops?.store_banner || ''
        });
        loadPortalData(data.profile.shop_id);
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
      setCart({});
      setOrders([]);
      setParlourStock([]);
      setSubmittedOrderDetails(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const loadPortalData = async (shopId) => {
    try {
      // Load active flavors (which includes aggregated stock details)
      const flavorsList = await supabaseService.getFlavors(true);
      setFlavors(flavorsList);

      // Load shop orders & local stock
      if (shopId) {
        const ordersList = await supabaseService.getOrders({ shop_id: shopId });
        setOrders(ordersList);

        const stockList = await supabaseService.getStockByLocation(shopId);
        setParlourStock(stockList);
      }
    } catch (err) {
      console.error('Error loading portal data:', err);
    }
  };

  // Set up realtime updates for shopkeeper orders & stock levels
  useEffect(() => {
    if (!userSession?.profile?.shop_id) return;

    const unsubscribe = supabaseService.subscribeToOrders((payload) => {
      const shopId = userSession.profile.shop_id;
      loadPortalData(shopId);
    });

    return () => unsubscribe();
  }, [userSession]);

  // Quantity handlers
  const updateQuantity = (flavorId, delta) => {
    setCart(prev => {
      const current = prev[flavorId] || 0;
      let next = current + delta;

      // MOQ is 5 tubs
      if (next < 5) {
        next = 0;
      }

      if (next <= 0) {
        const updated = { ...prev };
        delete updated[flavorId];
        return updated;
      }
      return { ...prev, [flavorId]: next };
    });
  };

  const getCartTotalItems = () => {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  };

  // Submit Order
  const handleSubmitOrder = async () => {
    const totalItems = getCartTotalItems();
    if (totalItems === 0 || !userSession?.profile?.shop_id) return;

    setSubmittingOrder(true);
    try {
      const orderItems = Object.entries(cart).map(([flavorId, qty]) => ({
        flavor_id: flavorId,
        quantity: qty
      }));

      const newOrder = await supabaseService.createOrder(
        userSession.profile.shop_id,
        orderItems,
        notes
      );

      // Trigger local mock realtime change event
      supabaseService.triggerLocalOrderChange('INSERT', newOrder);

      setSubmittedOrderDetails(newOrder);
      setCart({});
      setNotes('');
      setIsReviewOpen(false);

      // Reload data
      loadPortalData(userSession.profile.shop_id);
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!userSession?.profile?.shop_id) return;
    
    setSavingProfile(true);
    setProfileSaveSuccess(false);
    try {
      const updatedShop = await supabaseService.updateShop(userSession.profile.shop_id, profileForm);
      
      // Update session locally to reflect changes
      setUserSession(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          shops: updatedShop
        }
      }));
      
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleShopkeeperImageUpload = (e, targetField) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("Image file is too large. Please select an image smaller than 2MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm(prev => ({
        ...prev,
        [targetField]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Parlour Stock Adjustment handlers
  const handleQuickParlourSale = async (stockItem, quantity) => {
    if (stockItem.stock_qty < quantity) {
      alert(`Cannot record sale. Only ${stockItem.stock_qty} Tubs left in parlour.`);
      return;
    }
    try {
      await supabaseService.adjustLocationStock(
        userSession.profile.shop_id,
        stockItem.flavor_id,
        stockItem.batch_id,
        -quantity,
        'adjustment',
        `Recorded parlour sale of ${quantity} tubs`
      );
      loadPortalData(userSession.profile.shop_id);
    } catch (err) {
      alert('Failed to record sale: ' + err.message);
    }
  };

  const handleOpenParlourAdjust = (stockItem) => {
    setSelectedStockForAdjust(stockItem);
    setParlourAdjustQty(1);
    setParlourAdjustType('damaged');
    setParlourAdjustNotes('');
    setIsParlourAdjustOpen(true);
  };

  const handleParlourAdjustSubmit = async (e) => {
    e.preventDefault();
    if (parlourAdjustQty <= 0) {
      alert('Adjustment quantity must be greater than zero.');
      return;
    }
    if (selectedStockForAdjust.stock_qty < parlourAdjustQty) {
      alert(`Insufficient stock. Only ${selectedStockForAdjust.stock_qty} Tubs remaining.`);
      return;
    }
    try {
      await supabaseService.adjustLocationStock(
        userSession.profile.shop_id,
        selectedStockForAdjust.flavor_id,
        selectedStockForAdjust.batch_id,
        -Number(parlourAdjustQty),
        parlourAdjustType,
        parlourAdjustNotes || `Parlour stock adjustment: -${parlourAdjustQty} units (${parlourAdjustType})`
      );
      setIsParlourAdjustOpen(false);
      loadPortalData(userSession.profile.shop_id);
    } catch (err) {
      alert('Failed to save adjustment: ' + err.message);
    }
  };

  const handleOpenParlourReturn = (stockItem) => {
    setSelectedStockForReturn(stockItem);
    setParlourReturnQty(Math.min(stockItem.stock_qty, 5));
    setParlourReturnNotes('');
    setIsParlourReturnOpen(true);
  };

  const handleParlourReturnSubmit = async (e) => {
    e.preventDefault();
    if (parlourReturnQty <= 0) {
      alert('Return quantity must be greater than zero.');
      return;
    }
    if (selectedStockForReturn.stock_qty < parlourReturnQty) {
      alert(`Cannot return more than available store stock (${selectedStockForReturn.stock_qty} Tubs).`);
      return;
    }
    try {
      await supabaseService.returnStockToWarehouse(
        userSession.profile.shop_id,
        selectedStockForReturn.flavor_id,
        selectedStockForReturn.batch_id,
        parlourReturnQty,
        parlourReturnNotes || `Returned surplus stock to master warehouse`
      );
      setIsParlourReturnOpen(false);
      loadPortalData(userSession.profile.shop_id);
    } catch (err) {
      alert('Failed to process return: ' + err.message);
    }
  };

  // Filter and search flavors
  const filteredFlavors = flavors.filter(f => {
    const matchesSearch = f.flavor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.notes && f.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter parlour stock
  const filteredParlourStock = parlourStock.filter(l => {
    const flavor = l.flavors || {};
    const batch = l.batches || {};
    return flavor.flavor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.batch_number?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get categories
  const categories = ['All', ...new Set(flavors.map(f => f.category))];

  // Helper for Order Status rendering
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-status pending';
      case 'accepted': return 'badge-status accepted';
      case 'preparing': return 'badge-status preparing';
      case 'dispatched': return 'badge-status dispatched';
      case 'delivered': return 'badge-status delivered';
      default: return 'badge-status';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'accepted': return <Check size={16} />;
      case 'preparing': return <Package size={16} />;
      case 'dispatched': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      default: return null;
    }
  };

  // Render Loader
  if (loading) {
    return (
      <div className="portal-loader-container">
        <div className="luxury-spinner"></div>
        <p className="loader-text">Securing connection to Nyathiyas Portal...</p>
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
            <span className="brand-subtitle">Partner Ordering Portal</span>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {authError && (
              <div className="login-error-alert">
                <AlertCircle size={18} />
                <span>{authError}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Partner Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. colaba@nyathiyas.com"
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
              {authLoading ? <div className="spinner-sm"></div> : 'Verify & Enter Portal'}
            </button>
          </form>

          <div className="login-helper-box">
            <h4>Quick Testing Partners</h4>
            <div className="helper-item" onClick={() => { setEmail('colaba@nyathiyas.com'); setPassword('password'); }}>
              <strong>Colaba Parlour:</strong> colaba@nyathiyas.com / password
            </div>
            <div className="helper-item" onClick={() => { setEmail('bandra@nyathiyas.com'); setPassword('password'); }}>
              <strong>Bandra Premium:</strong> bandra@nyathiyas.com / password
            </div>
          </div>

          <button className="back-to-web-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Public Brand Site
          </button>
        </div>
      </div>
    );
  }

  const shop = userSession.profile.shops || {};

  return (
    <div className="shopkeeper-portal-container">
      {/* HEADER */}
      <header className="portal-main-header">
        <div className="header-brand">
          <span className="brand-logo" onClick={() => navigate('/')}>Nyathiya's</span>
          <div className="shop-badge">
            <span className="shop-code-pill">{shop.shop_code}</span>
            <span className="shop-name-text">{shop.shop_name}</span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`header-nav-btn ${activeTab === 'order' ? 'active' : ''}`}
            onClick={() => { setActiveTab('order'); setSubmittedOrderDetails(null); setSearchQuery(''); }}
          >
            <ShoppingBag size={18} />
            <span>Catalog</span>
          </button>
          
          <button
            className={`header-nav-btn ${activeTab === 'parlour_stock' ? 'active' : ''}`}
            onClick={() => { setActiveTab('parlour_stock'); setSubmittedOrderDetails(null); setSearchQuery(''); }}
          >
            <Package size={18} />
            <span>My Parlour Stock</span>
          </button>

          <button
            className={`header-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => { setActiveTab('history'); setSubmittedOrderDetails(null); setSearchQuery(''); }}
          >
            <History size={18} />
            <span>Order History</span>
            {orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'dispatched').length > 0 && (
              <span className="live-orders-indicator"></span>
            )}
          </button>
          
          <button
            className={`header-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setSubmittedOrderDetails(null); setSearchQuery(''); }}
          >
            <User size={18} />
            <span>Branding</span>
          </button>
          
          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* SUB-HEADER STORE PROFILE */}
      <section className="store-profile-strip">
        <div className="profile-item">
          <MapPin size={15} />
          <span>{shop.store_location}</span>
        </div>
        <div className="profile-item">
          <User size={15} />
          <span>Owner: {shop.owner_name}</span>
        </div>
        <div className="profile-item">
          <Phone size={15} />
          <a href={`tel:${shop.phone}`} className="phone-link">{shop.phone}</a>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="portal-main-content">

        {/* SUBMITTED SUCCESS SCREEN */}
        {submittedOrderDetails && (
          <div className="order-success-screen fade-in-up">
            <div className="success-icon-wrap">
              <Check className="success-check-icon" size={48} />
            </div>
            <h2>Order Placed Successfully</h2>
            <p className="subtitle">Your gourmet batch request has been submitted to the Nyathiyas Admin dashboard.</p>

            <div className="receipt-box">
              <div className="receipt-row">
                <span className="receipt-label">Order Reference</span>
                <strong className="receipt-val">{submittedOrderDetails.order_number}</strong>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Status</span>
                <span className="receipt-val status-pending-text">Pending Approval</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Submitted At</span>
                <span className="receipt-val">{formatDate(submittedOrderDetails.created_at)}</span>
              </div>
              {submittedOrderDetails.notes && (
                <div className="receipt-row notes-row">
                  <span className="receipt-label">Special Instructions</span>
                  <p className="receipt-val-notes">"{submittedOrderDetails.notes}"</p>
                </div>
              )}
            </div>

            <div className="success-actions">
              <button className="btn btn-primary" onClick={() => { setSubmittedOrderDetails(null); setActiveTab('history'); }}>
                Track Order Status
              </button>
              <button className="btn btn-secondary" onClick={() => setSubmittedOrderDetails(null)}>
                Order More Flavors
              </button>
            </div>
          </div>
        )}

        {/* ORDER CATALOG TAB */}
        {!submittedOrderDetails && activeTab === 'order' && (
          <div className="catalog-tab-content">
            {/* Filter Bar */}
            <div className="catalog-filter-bar">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gourmet flavors..."
                />
              </div>
              <div className="category-filters">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`cat-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            {filteredFlavors.length === 0 ? (
              <div className="empty-catalog">
                <p>No gourmet flavors match your current filters.</p>
              </div>
            ) : (
              <div className="flavor-catalog-grid">
                {filteredFlavors.map(flavor => {
                  const qty = cart[flavor.id] || 0;
                  const stockRemaining = flavor.stock_remaining !== undefined ? flavor.stock_remaining : 50;
                  const isLowStock = stockRemaining < (flavor.reorder_point || 15) && stockRemaining > 0;
                  const isOutOfStock = stockRemaining === 0;

                  return (
                    <div className={`flavor-order-card ${isOutOfStock ? 'card-out-of-stock' : ''}`} key={flavor.id}>
                      <div className="flavor-card-image-wrap">
                        {flavor.image_url ? (
                          <img src={flavor.image_url} alt={flavor.flavor_name} />
                        ) : (
                          <div className="flavor-image-fallback">
                            <ShoppingBag size={32} />
                          </div>
                        )}
                        <span className="flavor-card-category">{flavor.category}</span>
                        <span className="flavor-card-number">No. {flavor.number || '00'}</span>
                      </div>
                      <div className="flavor-card-details">
                        <div className="flavor-card-header-row">
                          <h3>{flavor.flavor_name}</h3>
                          <div className="stock-indicators-row">
                            {isOutOfStock ? (
                              <span className="stock-alert-badge out">SOLD OUT</span>
                            ) : isLowStock ? (
                              <span className="stock-alert-badge low">LOW STOCK ({stockRemaining} Left)</span>
                            ) : (
                              <span className="stock-alert-badge ok">AVAILABLE ({stockRemaining} Tubs)</span>
                            )}
                          </div>
                        </div>
                        <p className="flavor-notes">{flavor.notes || 'Premium hand-crafted ice cream batch.'}</p>
                        
                        <div className="pack-size-display text-muted">
                          <span>Pack Size: <strong>{flavor.unit || 'Tub (5L)'}</strong></span>
                          <span>•</span>
                          <span>MOQ: <strong>{flavor.min_order_qty || 5} Tubs</strong></span>
                        </div>

                        <div className="flavor-card-action-row">
                          {isOutOfStock ? (
                            <button className="add-to-order-btn disabled" disabled>
                              Out of Stock
                            </button>
                          ) : qty > 0 ? (
                            <div className="qty-selector">
                              <button onClick={() => updateQuantity(flavor.id, -5)} className="qty-btn" title="Decrease">
                                <Minus size={16} />
                              </button>
                              <span className="qty-value">{qty} Tubs</span>
                              <button onClick={() => updateQuantity(flavor.id, 5)} className="qty-btn" title="Increase" disabled={qty >= stockRemaining}>
                                <Plus size={16} />
                              </button>
                            </div>
                          ) : (
                            <button className="add-to-order-btn" onClick={() => updateQuantity(flavor.id, 5)}>
                              <Plus size={14} style={{ marginRight: '6px' }} /> Order Tubs (MOQ: 5)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sticky Bottom Order summary Bar */}
            {getCartTotalItems() > 0 && (
              <div className="sticky-order-summary-bar">
                <div className="bar-info">
                  <div className="cart-icon-wrap">
                    <ShoppingCart size={20} />
                    <span className="cart-count-badge">{getCartTotalItems()}</span>
                  </div>
                  <div className="cart-details-text">
                    <span className="title">Flavor Batch Selection</span>
                    <span className="desc">{Object.keys(cart).length} unique flavors selected</span>
                  </div>
                </div>
                <button className="btn btn-primary review-order-btn" onClick={() => setIsReviewOpen(true)}>
                  Review & Submit Batch
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: MY PARLOUR STOCK */}
        {!submittedOrderDetails && activeTab === 'parlour_stock' && (
          <div className="parlour-stock-tab fade-in-up">
            <div className="tab-header-line">
              <div>
                <h2 className="tab-title">My Parlour Stock</h2>
                <p className="tab-subtitle">Real-time inventory levels currently available at your storefront parlour.</p>
              </div>
              <div className="search-box compact">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter parlour stock..."
                />
              </div>
            </div>

            {filteredParlourStock.length === 0 ? (
              <div className="empty-stock-box">
                <Package size={48} className="empty-icon" />
                <h3>No inventory at parlour</h3>
                <p>Stock will be added to your parlour automatically when orders are delivered by our logistics.</p>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('order')}>
                  Request Warehouse Restock
                </button>
              </div>
            ) : (
              <div className="parlour-stock-grid">
                {filteredParlourStock.map(item => {
                  const expiry = item.batches ? new Date(item.batches.expiry_date) : null;
                  const diffDays = expiry ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)) : null;

                  return (
                    <div className="parlour-stock-card" key={item.id}>
                      <div className="card-top">
                        <strong className="flavor-title">{item.flavors?.flavor_name}</strong>
                        <code className="batch-code">{item.batches?.batch_number}</code>
                      </div>
                      <div className="card-mid">
                        <div className="stock-level">
                          <span className="label">Current Stock:</span>
                          <strong className="qty-val">{item.stock_qty} Tubs</strong>
                        </div>
                        <div className="expiry-level">
                          <span className="label">Shelf Expiry:</span>
                          <span className={`expiry-val ${diffDays !== null && diffDays <= 10 ? 'critical' : ''}`}>
                            {item.batches ? formatDate(item.batches.expiry_date).split(',')[0] : 'N/A'}
                            {diffDays !== null && diffDays <= 10 && ` (${diffDays}d left)`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button className="quick-btn sale" onClick={() => handleQuickParlourSale(item, 1)} title="Record 1 Tub Sold">
                          Record Sale (-1)
                        </button>
                        <button className="quick-btn bulk" onClick={() => handleQuickParlourSale(item, 5)} title="Record 5 Tubs Sold">
                          Bulk Sale (-5)
                        </button>
                        <button className="quick-btn adjust" onClick={() => handleOpenParlourAdjust(item)} title="Report Damage or Loss">
                          Report Loss
                        </button>
                        <button className="quick-btn return" onClick={() => handleOpenParlourReturn(item)} title="Return Surplus to Warehouse">
                          Return Tubs
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ORDER HISTORY TAB */}
        {!submittedOrderDetails && activeTab === 'history' && (
          <div className="history-tab-content">
            <h2 className="tab-title">Past Batch Requests</h2>

            {orders.length === 0 ? (
              <div className="empty-history-box">
                <FileText size={48} className="empty-icon" />
                <h3>No order history found</h3>
                <p>Submit your first batch order in the catalog tab.</p>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('order')}>
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="orders-history-list">
                {orders.map(order => {
                  const isExpanded = expandedOrderId === order.id;
                  const totalTubs = order.order_items?.reduce((a, b) => a + b.quantity, 0) || 0;

                  return (
                    <div className={`history-order-card ${isExpanded ? 'expanded' : ''}`} key={order.id}>
                      {/* Card Summary Line */}
                      <div
                        className="order-card-summary"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      >
                        <div className="summary-left">
                          <strong className="order-number">{order.order_number}</strong>
                          <span className="order-date">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="summary-center">
                          <span className="tubs-count">{totalTubs} Tubs</span>
                          <span className="flavors-count">({order.order_items?.length || 0} Flavors)</span>
                        </div>
                        <div className="summary-right">
                          <span className={getStatusBadgeClass(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="status-text">{order.status}</span>
                          </span>
                          <ChevronRight className="expand-chevron" size={18} />
                        </div>
                      </div>

                      {/* Card Expanded Details */}
                      {isExpanded && (
                        <div className="order-card-expanded-details fade-in-down">
                          <div className="expanded-grid">

                            {/* Left Side: Order Items */}
                            <div className="items-list-box">
                              <h4>Flavors Ordered</h4>
                              <div className="itemized-lines">
                                {order.order_items?.map(item => (
                                  <div className="item-line" key={item.id}>
                                    <div className="flavor-details">
                                      <span className="flavor-name">{item.flavors?.flavor_name || 'Unknown Flavor'}</span>
                                      <span className="flavor-category-tag">{item.flavors?.category || 'General'}</span>
                                    </div>
                                    <strong className="item-qty">{item.quantity} Tubs</strong>
                                  </div>
                                ))}
                              </div>
                              {order.notes && (
                                <div className="order-notes-display">
                                  <strong>Special Instructions:</strong>
                                  <p>"{order.notes}"</p>
                                </div>
                              )}
                            </div>

                            {/* Right Side: Status Timeline Tracker */}
                            <div className="status-tracker-box">
                              <h4>Live Tracking Status</h4>

                              <div className="timeline-track">
                                <div className={`timeline-step ${['pending', 'accepted', 'preparing', 'dispatched', 'delivered'].includes(order.status) ? 'active' : ''}`}>
                                  <div className="step-circle"><Clock size={14} /></div>
                                  <div className="step-content">
                                    <span className="step-title">Submitted</span>
                                    <span className="step-desc">Order placed by {shop.owner_name}</span>
                                  </div>
                                </div>

                                <div className={`timeline-step ${['accepted', 'preparing', 'dispatched', 'delivered'].includes(order.status) ? 'active' : ''}`}>
                                  <div className="step-circle"><Check size={14} /></div>
                                  <div className="step-content">
                                    <span className="step-title">Accepted</span>
                                    <span className="step-desc">Confirmed by Nyathiyas Admin</span>
                                  </div>
                                </div>

                                <div className={`timeline-step ${['preparing', 'dispatched', 'delivered'].includes(order.status) ? 'active' : ''}`}>
                                  <div className="step-circle"><Package size={14} /></div>
                                  <div className="step-content">
                                    <span className="step-title">Preparing</span>
                                    <span className="step-desc">Batch being churned & packaged</span>
                                  </div>
                                </div>

                                <div className={`timeline-step ${['dispatched', 'delivered'].includes(order.status) ? 'active' : ''}`}>
                                  <div className="step-circle"><Truck size={14} /></div>
                                  <div className="step-content">
                                    <span className="step-title">Dispatched</span>
                                    <span className="step-desc">Cold-chain truck departed</span>
                                  </div>
                                </div>

                                <div className={`timeline-step ${['delivered'].includes(order.status) ? 'active' : ''}`}>
                                  <div className="step-circle"><CheckCircle size={14} /></div>
                                  <div className="step-content">
                                    <span className="step-title">Delivered</span>
                                    <span className="step-desc">Received at {shop.shop_name}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BRANDING PROFILE CUSTOMIZATION TAB */}
        {!submittedOrderDetails && activeTab === 'profile' && (
          <div className="branding-profile-tab fade-in-up">
            {profileSaveSuccess && (
              <div className="profile-save-success-banner">
                <CheckCircle size={18} />
                <span>Branding configuration updated successfully! Changes are live immediately.</span>
              </div>
            )}

            <div className="profile-preview-card">
              <div className="shop-profile-cover-img-wrapper">
                {profileForm.store_banner ? (
                  <img src={profileForm.store_banner} alt="Cover Banner" className="shop-profile-cover-img" />
                ) : (
                  <div className="shop-profile-cover-img-placeholder">
                    <span>No cover banner image set</span>
                  </div>
                )}
              </div>
              
              <div className="profile-header-card">
                <div className="profile-dp-container">
                  {profileForm.profile_image ? (
                    <img src={profileForm.profile_image} alt="Profile DP" className="profile-dp-img" />
                  ) : (
                    <div className="profile-dp-fallback">{shop.shop_name?.charAt(0)}</div>
                  )}
                </div>
                <div className="profile-info-heading-wrap">
                  <h3 className="profile-info-heading">{shop.shop_name}</h3>
                  <div className="profile-metadata-row">
                    <span className="profile-metadata-item">
                      <strong>Code:</strong> {shop.shop_code}
                    </span>
                    <span className="profile-metadata-divider">•</span>
                    <span className="profile-metadata-item">
                      <strong>Slug:</strong> /{shop.route_slug || 'n/a'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="branding-edit-form">
              <div className="form-sections-grid">
                
                {/* Modifiable Fields */}
                <div className="form-section-card">
                  <h4>Custom Branding Config</h4>
                  <p className="section-subtitle-text">Personalize your public partner page styling and additional contacts.</p>
                  
                  <div className="form-group">
                    <label>Secondary Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={profileForm.secondary_phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, secondary_phone: e.target.value }))}
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>

                  <div className="form-group">
                    <label>Display Picture (DP / Owner Image)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleShopkeeperImageUpload(e, 'profile_image')}
                      className="file-upload-input"
                    />
                    <span className="help-text">JPG, PNG or WEBP formats. Max 2MB limit.</span>
                  </div>

                  <div className="form-group">
                    <label>Cover Banner Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleShopkeeperImageUpload(e, 'store_banner')}
                      className="file-upload-input"
                    />
                    <span className="help-text">Wide landscape aspect recommended. Max 2MB limit.</span>
                  </div>

                  <div className="form-group">
                    <label>Store Bio / Narrative Description</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Introduce your parlor, neighborhood history, or opening hours..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Restricted Fields - Locked by Administrator */}
                <div className="form-section-card restricted-card">
                  <h4>System Parameters</h4>
                  <p className="section-subtitle-text">Managed by main administration only. Contact admin to modify.</p>
                  
                  <div className="locked-fields-grid">
                    <div className="form-group locked">
                      <label>Store ID Code</label>
                      <input type="text" value={shop.shop_code || ''} disabled />
                    </div>

                    <div className="form-group locked">
                      <label>Official Store Name</label>
                      <input type="text" value={shop.shop_name || ''} disabled />
                    </div>

                    <div className="form-group locked">
                      <label>Route URL Slug</label>
                      <input type="text" value={shop.route_slug ? `/shop/${shop.route_slug}` : ''} disabled />
                    </div>

                    <div className="form-group locked">
                      <label>Partner Access Code</label>
                      <input type="text" value={shop.partner_code || ''} disabled />
                    </div>

                    <div className="form-group locked">
                      <label>Primary Phone Number</label>
                      <input type="text" value={shop.phone || ''} disabled />
                    </div>

                    <div className="form-group locked">
                      <label>Primary Email</label>
                      <input type="text" value={shop.email || ''} disabled />
                    </div>

                    <div className="form-group locked full-width">
                      <label>Physical Address Location</label>
                      <input type="text" value={shop.store_location || ''} disabled />
                    </div>
                  </div>
                </div>

              </div>

              <div className="form-actions-row">
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? <div className="spinner-sm"></div> : 'Publish Brand Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* REVIEW DRAWER / MODAL */}
      {isReviewOpen && (
        <div className="review-modal-overlay">
          <div className="review-modal-card fade-in-up">
            <div className="modal-header">
              <h3>Confirm Batch Order</h3>
              <button className="close-modal-btn" onClick={() => setIsReviewOpen(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="review-shop-summary">
                <strong>Shipment Destination:</strong>
                <p>{shop.shop_name} - {shop.store_location}</p>
              </div>

              <div className="review-items-list">
                <h4>Items Summary ({getCartTotalItems()} Tubs)</h4>
                <div className="review-rows-container">
                  {Object.entries(cart).map(([flavorId, qty]) => {
                    const flavor = flavors.find(f => f.id === flavorId) || {};
                    return (
                      <div className="review-item-row" key={flavorId}>
                        <span>{flavor.flavor_name}</span>
                        <strong>{qty} Tubs</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-group notes-group">
                <label htmlFor="order-notes">Special Shipping or Batch Instructions (Optional)</label>
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please deliver before 10 AM, require extra ice pads, etc."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsReviewOpen(false)} disabled={submittingOrder}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmitOrder} disabled={submittingOrder}>
                {submittingOrder ? <div className="spinner-sm"></div> : 'Submit Premium Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PARLOUR ADJUSTMENT MODAL */}
      {isParlourAdjustOpen && selectedStockForAdjust && (
        <div className="review-modal-overlay">
          <div className="review-modal-card fade-in-up compact-modal">
            <div className="modal-header">
              <h3>Report Parlour Loss</h3>
              <button className="close-modal-btn" onClick={() => setIsParlourAdjustOpen(false)}>×</button>
            </div>
            <form onSubmit={handleParlourAdjustSubmit}>
              <div className="modal-body">
                <div className="parlour-adjust-target">
                  <strong>Flavor Profile:</strong>
                  <p>{selectedStockForAdjust.flavors?.flavor_name} ({selectedStockForAdjust.batches?.batch_number})</p>
                  <p className="subtext text-muted">Currently at Store: {selectedStockForAdjust.stock_qty} Tubs</p>
                </div>

                <div className="form-group">
                  <label htmlFor="adjust-qty">Deduct Quantity (Tubs)</label>
                  <input
                    type="number"
                    id="adjust-qty"
                    value={parlourAdjustQty}
                    onChange={(e) => setParlourAdjustQty(e.target.value)}
                    min="1"
                    max={selectedStockForAdjust.stock_qty}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="adjust-type">Reason / Type</label>
                  <select
                    id="adjust-type"
                    value={parlourAdjustType}
                    onChange={(e) => setParlourAdjustType(e.target.value)}
                    required
                  >
                    <option value="damaged">Damage / Melted (Freezer Issue)</option>
                    <option value="adjustment">General Discrepancy Correction</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="adjust-notes">Loss Explanation / Notes</label>
                  <textarea
                    id="adjust-notes"
                    value={parlourAdjustNotes}
                    onChange={(e) => setParlourAdjustNotes(e.target.value)}
                    placeholder="e.g. Freezer seal failed overnight, temp went to 5C..."
                    rows={2}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsParlourAdjustOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Deduct Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PARLOUR RETURN STOCK MODAL */}
      {isParlourReturnOpen && selectedStockForReturn && (
        <div className="review-modal-overlay">
          <div className="review-modal-card fade-in-up compact-modal">
            <div className="modal-header">
              <h3>Return Tubs to Warehouse</h3>
              <button className="close-modal-btn" onClick={() => setIsParlourReturnOpen(false)}>×</button>
            </div>
            <form onSubmit={handleParlourReturnSubmit}>
              <div className="modal-body">
                <div className="parlour-adjust-target">
                  <strong>Returning Flavor:</strong>
                  <p>{selectedStockForReturn.flavors?.flavor_name} ({selectedStockForReturn.batches?.batch_number})</p>
                  <p className="subtext text-muted">Available at Parlour: {selectedStockForReturn.stock_qty} Tubs</p>
                </div>

                <div className="form-group">
                  <label htmlFor="return-qty">Return Quantity (Tubs)</label>
                  <input
                    type="number"
                    id="return-qty"
                    value={parlourReturnQty}
                    onChange={(e) => setParlourReturnQty(e.target.value)}
                    min="1"
                    max={selectedStockForReturn.stock_qty}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="return-notes">Reason for Return</label>
                  <textarea
                    id="return-notes"
                    value={parlourReturnNotes}
                    onChange={(e) => setParlourReturnNotes(e.target.value)}
                    placeholder="e.g. Consolidating stock, rotation, overstocked for winter..."
                    rows={2}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsParlourReturnOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
