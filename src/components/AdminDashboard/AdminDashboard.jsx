import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, ShoppingBag, Plus, Edit2, Search, Filter, Clock,
  AlertCircle, Users, User, MapPin, Phone, Mail, Check, ArrowLeft,
  Volume2, VolumeX, Package, TrendingUp, AlertTriangle, ArrowRightLeft,
  RotateCcw, History, ClipboardList, ChevronDown, ChevronUp
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
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'inventory', 'locations', 'movements', 'shops', 'flavors'
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [batches, setBatches] = useState([]);
  const [locationStock, setLocationStock] = useState([]);
  const [movements, setMovements] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [shopFilter, setShopFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [flavorFilter, setFlavorFilter] = useState('All');
  const [batchStatusFilter, setBatchStatusFilter] = useState('All');
  const [statFilterOverride, setStatFilterOverride] = useState(null);

  // Selected details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  // Sound trigger state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals state
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [isAdjustStoreStockModalOpen, setIsAdjustStoreStockModalOpen] = useState(false);
  const [isReturnStockModalOpen, setIsReturnStockModalOpen] = useState(false);

  const [expandedShopIds, setExpandedShopIds] = useState({});
  const [editingShop, setEditingShop] = useState(null);
  const [editingFlavor, setEditingFlavor] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);

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

  // Form States - Batch
  const [batchForm, setBatchForm] = useState({
    batch_number: '',
    flavor_id: '',
    manufactured_date: '',
    expiry_date: '',
    quantity_received: 100,
    unit: 'Tub (5L)',
    min_order_qty: 5,
    reorder_point: 15,
    notes: ''
  });

  // Form States - Stock Adjustments
  const [adjustStockForm, setAdjustStockForm] = useState({
    batch_id: '',
    quantity_change: 0,
    type: 'adjustment',
    notes: ''
  });

  const [adjustStoreForm, setAdjustStoreForm] = useState({
    shop_id: '',
    flavor_id: '',
    batch_id: '',
    quantity_change: 0,
    type: 'adjustment',
    notes: ''
  });

  const [returnStockForm, setReturnStockForm] = useState({
    shop_id: '',
    flavor_id: '',
    batch_id: '',
    quantity: 0,
    notes: ''
  });

  const ordersRef = useRef([]);

  // Check login session
  useEffect(() => {
    checkSession();
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
      setBatches([]);
      setLocationStock([]);
      setMovements([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const loadDashboardData = async () => {
    try {
      const ordersList = await supabaseService.getOrders();
      const shopsList = await supabaseService.getAllShopsAdmin();
      const flavorsList = await supabaseService.getFlavors(false); // get active & inactive
      const batchesList = await supabaseService.getBatches();
      const locStockList = await supabaseService.getStockByLocation();
      const movementsList = await supabaseService.getStockMovements();

      setOrders(ordersList);
      ordersRef.current = ordersList; // Store in ref to check against new orders in realtime
      setShops(shopsList);
      setFlavors(flavorsList);
      setBatches(batchesList);
      setLocationStock(locStockList);
      setMovements(movementsList);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  // Synthesize a chime when a new order arrives
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
      osc2.frequency.setValueAtTime(659.25, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.42);

      // Tone 3 (G5)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.24);
      gain3.gain.setValueAtTime(0.2, now + 0.24);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.24);
      osc3.stop(now + 0.7);

    } catch (e) {
      console.warn('Web Audio API not supported or blocked by browser policy:', e);
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!userSession) return;

    const unsubscribe = supabaseService.subscribeToOrders((payload) => {
      if (payload.eventType === 'INSERT') {
        const exists = ordersRef.current.some(o => o.id === payload.new.id);
        if (!exists) {
          playNewOrderChime();
        }
      }

      loadDashboardData();

      if (selectedOrder && selectedOrder.id === payload.new.id) {
        supabaseService.getOrderHistory(selectedOrder.id).then(setOrderHistory);
        setSelectedOrder(prev => prev ? { ...prev, status: payload.new.status } : null);
      }
    });

    return () => unsubscribe();
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
      setShopForm(prev => ({ ...prev, [targetField]: reader.result }));
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

  // Batch Handlers
  const handleOpenBatchModal = (batch = null) => {
    if (batch) {
      setEditingBatch(batch);
      setBatchForm({
        batch_number: batch.batch_number,
        flavor_id: batch.flavor_id,
        manufactured_date: batch.manufactured_date.substring(0, 10),
        expiry_date: batch.expiry_date.substring(0, 10),
        quantity_received: batch.quantity_received,
        unit: batch.unit,
        min_order_qty: batch.min_order_qty,
        reorder_point: batch.reorder_point,
        notes: batch.notes || ''
      });
    } else {
      setEditingBatch(null);
      setBatchForm({
        batch_number: '',
        flavor_id: flavors[0]?.id || '',
        manufactured_date: new Date().toISOString().substring(0, 10),
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        quantity_received: 100,
        unit: 'Tub (5L)',
        min_order_qty: 5,
        reorder_point: 15,
        notes: ''
      });
    }
    setIsBatchModalOpen(true);
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBatch) {
        await supabaseService.updateBatch(editingBatch.id, batchForm);
      } else {
        await supabaseService.createBatch(batchForm);
      }
      setIsBatchModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to save batch: ' + err.message);
    }
  };

  const handleToggleBatchStatus = async (batch) => {
    try {
      const nextStatus = batch.status === 'active' ? 'depleted' : 'active';
      await supabaseService.updateBatch(batch.id, { status: nextStatus });
      loadDashboardData();
    } catch (err) {
      alert('Failed to update batch status: ' + err.message);
    }
  };

  // Stock Adjustment Handlers
  const handleOpenAdjustStockModal = (batch) => {
    setAdjustStockForm({
      batch_id: batch.id,
      quantity_change: 0,
      type: 'adjustment',
      notes: ''
    });
    setIsAdjustStockModalOpen(true);
  };

  const handleAdjustStockSubmit = async (e) => {
    e.preventDefault();
    if (Number(adjustStockForm.quantity_change) === 0) {
      alert('Stock change quantity cannot be zero.');
      return;
    }
    try {
      await supabaseService.adjustBatchStock(
        adjustStockForm.batch_id,
        adjustStockForm.quantity_change,
        adjustStockForm.type,
        adjustStockForm.notes
      );
      setIsAdjustStockModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to adjust stock: ' + err.message);
    }
  };

  // Location Stock Handlers
  const handleOpenAdjustStoreStockModal = (loc = null) => {
    setAdjustStoreForm({
      shop_id: loc?.shop_id || shops[0]?.id || '',
      flavor_id: loc?.flavor_id || flavors[0]?.id || '',
      batch_id: loc?.batch_id || batches[0]?.id || '',
      quantity_change: 0,
      type: 'adjustment',
      notes: ''
    });
    setIsAdjustStoreStockModalOpen(true);
  };

  const handleAdjustStoreStockSubmit = async (e) => {
    e.preventDefault();
    if (Number(adjustStoreForm.quantity_change) === 0) {
      alert('Stock change quantity cannot be zero.');
      return;
    }
    try {
      await supabaseService.adjustLocationStock(
        adjustStoreForm.shop_id,
        adjustStoreForm.flavor_id,
        adjustStoreForm.batch_id,
        adjustStoreForm.quantity_change,
        adjustStoreForm.type,
        adjustStoreForm.notes
      );
      setIsAdjustStoreStockModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to adjust store stock: ' + err.message);
    }
  };

  const handleOpenReturnStockModal = (loc = null) => {
    setReturnStockForm({
      shop_id: loc?.shop_id || shops[0]?.id || '',
      flavor_id: loc?.flavor_id || flavors[0]?.id || '',
      batch_id: loc?.batch_id || batches[0]?.id || '',
      quantity: 0,
      notes: ''
    });
    setIsReturnStockModalOpen(true);
  };

  const handleReturnStockSubmit = async (e) => {
    e.preventDefault();
    if (Number(returnStockForm.quantity) <= 0) {
      alert('Return quantity must be greater than zero.');
      return;
    }
    try {
      await supabaseService.returnStockToWarehouse(
        returnStockForm.shop_id,
        returnStockForm.flavor_id,
        returnStockForm.batch_id,
        returnStockForm.quantity,
        returnStockForm.notes
      );
      setIsReturnStockModalOpen(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to return stock to warehouse: ' + err.message);
    }
  };

  const toggleShopExpand = (id) => {
    setExpandedShopIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleStatCardClick = (filterType) => {
    if (statFilterOverride === filterType) {
      setStatFilterOverride(null);
      return;
    }
    setStatFilterOverride(filterType);
    setSelectedOrder(null);
    setSearchQuery(''); // clear query so stats override takes precedence cleanly
    
    switch (filterType) {
      case 'today_orders':
        setActiveTab('orders');
        setStatusFilter('All');
        break;
      case 'pending_orders':
        setActiveTab('orders');
        setStatusFilter('Pending');
        break;
      case 'active_shops':
        setActiveTab('shops');
        break;
      case 'total_tubs':
        setActiveTab('inventory');
        setBatchStatusFilter('All');
        break;
      case 'low_stock_batches':
        setActiveTab('inventory');
        setBatchStatusFilter('low_stock');
        break;
      case 'expiring_soon_batches':
        setActiveTab('inventory');
        setBatchStatusFilter('expiring');
        break;
      default:
        break;
    }
  };

  // Analytics Stats helpers
  const getStats = () => {
    const todayStr = new Date().toDateString();

    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === todayStr);
    const pendingCount = orders.filter(o => o.status === 'pending').length;

    // Calculate inventory statistics
    const activeBatches = batches.filter(b => b.status === 'active' && new Date(b.expiry_date) > new Date());
    
    // Low stock count (active batches under reorder point)
    const lowStockCount = activeBatches.filter(b => b.stock_remaining < b.reorder_point).length;

    // Expiring soon count (active batches expiring in next 10 days)
    const expiringSoonCount = activeBatches.filter(b => {
      const expiry = new Date(b.expiry_date);
      const diffDays = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 10;
    }).length;

    const activeShopsCount = shops.filter(s => s.active).length;
    const totalTubsCount = batches.reduce((sum, b) => sum + (b.status === 'active' ? b.stock_on_hand : 0), 0);

    return {
      todayCount: todayOrders.length,
      pendingCount,
      lowStockCount,
      expiringSoonCount,
      activeShopsCount,
      totalTubsCount
    };
  };

  const stats = getStats();

  // Filters logic for Orders
  const filteredOrders = orders.filter(o => {
    const shop = o.shops || {};
    const matchesSearch = o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.shop_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = statusFilter === 'All' || o.status === statusFilter.toLowerCase();
    if (statFilterOverride === 'pending_orders') {
      matchesStatus = o.status === 'pending';
    }

    let matchesDate = true;
    if (statFilterOverride === 'today_orders') {
      matchesDate = new Date(o.created_at).toDateString() === new Date().toDateString();
    }

    const matchesShop = shopFilter === 'All' || o.shop_id === shopFilter;

    return matchesSearch && matchesStatus && matchesDate && matchesShop;
  });

  // Filters for Batches
  const filteredBatches = batches.filter(b => {
    const flavor = b.flavors || {};
    const matchesSearch = b.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flavor.flavor_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFlavor = flavorFilter === 'All' || b.flavor_id === flavorFilter;
    
    // Status filter
    const expiry = new Date(b.expiry_date);
    const diffDays = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
    
    let matchesStatus = true;
    if (statFilterOverride === 'low_stock_batches') {
      matchesStatus = b.stock_remaining < b.reorder_point && b.stock_remaining > 0 && b.status === 'active';
    } else if (statFilterOverride === 'expiring_soon_batches') {
      matchesStatus = diffDays >= 0 && diffDays <= 10 && b.status === 'active';
    } else {
      // Use dropdown filter if no stat override or if override is 'total_tubs'
      if (batchStatusFilter === 'expired') {
        matchesStatus = diffDays < 0;
      } else if (batchStatusFilter === 'expiring') {
        matchesStatus = diffDays >= 0 && diffDays <= 10 && b.status === 'active';
      } else if (batchStatusFilter === 'low_stock') {
        matchesStatus = b.stock_remaining < b.reorder_point && b.stock_remaining > 0 && b.status === 'active';
      } else if (batchStatusFilter === 'depleted') {
        matchesStatus = b.status === 'depleted' || b.stock_on_hand === 0;
      } else if (batchStatusFilter === 'active') {
        matchesStatus = b.status === 'active' && diffDays > 10;
      }
    }

    return matchesSearch && matchesFlavor && matchesStatus;
  });

  // Filters for Shops
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.shop_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.owner_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesActive = true;
    if (statFilterOverride === 'active_shops') {
      matchesActive = shop.active === true;
    }

    return matchesSearch && matchesActive;
  });

  // Filters for Location Stock
  const filteredLocationStock = locationStock.filter(l => {
    const shop = l.shops || {};
    const flavor = l.flavors || {};
    const batch = l.batches || {};

    const matchesSearch = shop.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flavor.flavor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.batch_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesShop = shopFilter === 'All' || l.shop_id === shopFilter;
    const matchesFlavor = flavorFilter === 'All' || l.flavor_id === flavorFilter;

    return matchesSearch && matchesShop && matchesFlavor;
  });

  // Filters for Movements Log
  const filteredMovements = movements.filter(m => {
    const shop = m.shops || {};
    const flavor = m.flavors || {};
    const batch = m.batches || {};

    const matchesSearch = flavor.flavor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.batch_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesShop = shopFilter === 'All' || m.shop_id === shopFilter || (shopFilter === 'warehouse' && m.shop_id === null);
    const matchesFlavor = flavorFilter === 'All' || m.flavor_id === flavorFilter;

    return matchesSearch && matchesShop && matchesFlavor;
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
            className={`header-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); setSearchQuery(''); setStatFilterOverride(null); }}
          >
            <ShoppingBag size={18} />
            <span>Orders</span>
          </button>

          <button
            className={`header-nav-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => { setActiveTab('inventory'); setSelectedOrder(null); setSearchQuery(''); setStatFilterOverride(null); }}
          >
            <Package size={18} />
            <span>Warehouse</span>
          </button>

          <button
            className={`header-nav-btn ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('locations'); setSelectedOrder(null); setSearchQuery(''); setStatFilterOverride(null); }}
          >
            <MapPin size={18} />
            <span>Location Stock</span>
          </button>

          <button
            className={`header-nav-btn ${activeTab === 'movements' ? 'active' : ''}`}
            onClick={() => { setActiveTab('movements'); setSelectedOrder(null); setSearchQuery(''); setStatFilterOverride(null); }}
          >
            <History size={18} />
            <span>Audit Trail</span>
          </button>

          <button
            className={`header-nav-btn ${activeTab === 'shops' ? 'active' : ''}`}
            onClick={() => { setActiveTab('shops'); setSelectedOrder(null); setSearchQuery(''); setStatFilterOverride(null); }}
          >
            <Users size={18} />
            <span>Stores</span>
          </button>

          <button
            className={`header-nav-btn ${activeTab === 'flavors' ? 'active' : ''}`}
            onClick={() => { setActiveTab('flavors'); setSelectedOrder(null); setSearchQuery(''); setStatFilterOverride(null); }}
          >
            <ClipboardList size={18} />
            <span>Catalog</span>
          </button>

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
        <button 
          className={`stat-card interactive-card ${statFilterOverride === 'today_orders' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('today_orders')}
          title="Filter by Today's Orders"
          type="button"
        >
          <div className="stat-icon-wrap yellow">
            <ShoppingBag size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.todayCount}</span>
            <span className="stat-label">Orders Today</span>
          </div>
        </button>

        <button 
          className={`stat-card interactive-card ${statFilterOverride === 'pending_orders' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('pending_orders')}
          title="Filter by Pending Orders"
          type="button"
        >
          <div className="stat-icon-wrap purple">
            <Clock size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.pendingCount}</span>
            <span className="stat-label">Pending Approval</span>
          </div>
        </button>

        <button 
          className={`stat-card interactive-card ${statFilterOverride === 'active_shops' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('active_shops')}
          title="Filter by Active Partner Stores"
          type="button"
        >
          <div className="stat-icon-wrap blue">
            <Users size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.activeShopsCount}</span>
            <span className="stat-label">Active Partner Shops</span>
          </div>
        </button>

        <button 
          className={`stat-card interactive-card ${statFilterOverride === 'total_tubs' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('total_tubs')}
          title="Show Warehouse Inventory Tubs"
          type="button"
        >
          <div className="stat-icon-wrap green">
            <Package size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.totalTubsCount}</span>
            <span className="stat-label">Total Tubs (WH)</span>
          </div>
        </button>

        <button 
          className={`stat-card alert-stock interactive-card ${statFilterOverride === 'low_stock_batches' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('low_stock_batches')}
          title="Filter by Low Stock Batches"
          type="button"
        >
          <div className={`stat-icon-wrap ${stats.lowStockCount > 0 ? 'red-alert' : 'green-ok'}`}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.lowStockCount}</span>
            <span className="stat-label">Low Stock Batches</span>
          </div>
        </button>

        <button 
          className={`stat-card alert-expiry interactive-card ${statFilterOverride === 'expiring_soon_batches' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('expiring_soon_batches')}
          title="Filter by Batches Expiring Soon"
          type="button"
        >
          <div className={`stat-icon-wrap ${stats.expiringSoonCount > 0 ? 'orange-alert' : 'green-ok'}`}>
            <AlertCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.expiringSoonCount}</span>
            <span className="stat-label">Expiring Soon (10d)</span>
          </div>
        </button>
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
                        <option value="dispatched">Dispatch Order (Deduct Stock)</option>
                        <option value="delivered">Set to Delivered (Add Store Stock)</option>
                        <option value="rejected">Reject Order</option>
                        <option value="cancelled">Cancel Order</option>
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

                    {/* Flavors Grid with Allocations */}
                    <div className="details-card-block">
                      <h3>Batch Tubs Ordered & Allocated (FEFO)</h3>
                      <div className="ordered-items-table">
                        <div className="table-header-row">
                          <span>Gourmet Flavor</span>
                          <span>Allocated Batches</span>
                          <span style={{ textAlign: 'right' }}>Total Quantity</span>
                        </div>
                        <div className="table-body-rows">
                          {selectedOrder.order_items?.map(item => (
                            <div className="table-body-row-complex" key={item.id}>
                              <div className="item-meta">
                                <span className="name">{item.flavors?.flavor_name}</span>
                                <span className="category">{item.flavors?.category}</span>
                              </div>
                              <div className="item-allocations">
                                {item.allocations && item.allocations.length > 0 ? (
                                  item.allocations.map((a, idx) => (
                                    <div key={idx} className={`allocation-tag ${a.batch_id === 'unallocated' ? 'warning' : 'success'}`}>
                                      <strong>{a.batch_number}</strong>: {a.quantity} Tubs
                                    </div>
                                  ))
                                ) : (
                                  <div className="allocation-tag error">No batch allocated</div>
                                )}
                              </div>
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

        {/* TABS 2: WAREHOUSE & BATCHES */}
        {activeTab === 'inventory' && (
          <div className="inventory-mgmt-tab fade-in-up">
            <div className="tab-actions-row">
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <h2>Master Warehouse Inventory</h2>
                <div className="search-box inline-search">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search batch # or flavor..."
                  />
                </div>
                <div className="select-wrapper">
                  <Filter size={14} className="filter-icon" />
                  <select value={flavorFilter} onChange={(e) => setFlavorFilter(e.target.value)}>
                    <option value="All">All Flavors</option>
                    {flavors.map(f => (
                      <option key={f.id} value={f.id}>{f.flavor_name}</option>
                    ))}
                  </select>
                </div>
                <div className="select-wrapper">
                  <Filter size={14} className="filter-icon" />
                  <select value={batchStatusFilter} onChange={(e) => setBatchStatusFilter(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="active">Active & Healthy</option>
                    <option value="expiring">Expiring Soon (10d)</option>
                    <option value="expired">Expired</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="depleted">Depleted / Out of Stock</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenBatchModal()}>
                <Plus size={16} style={{ marginRight: '6px' }} /> Create New Stock Batch
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Batch Code</th>
                    <th>Flavor Name</th>
                    <th>Mfg Date</th>
                    <th>Expiry Date</th>
                    <th>Total Received</th>
                    <th>On Hand (Warehouse)</th>
                    <th>Allocated (Pending)</th>
                    <th>Available (Remaining)</th>
                    <th>Reorder Pt</th>
                    <th>Unit</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan="12" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No warehouse stock batches found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map(batch => {
                      const expiry = new Date(batch.expiry_date);
                      const diffDays = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
                      
                      let statusPill = <span className="status-dot-pill active">Active</span>;
                      if (diffDays < 0) {
                        statusPill = <span className="status-dot-pill error">Expired</span>;
                      } else if (diffDays <= 10) {
                        statusPill = <span className="status-dot-pill warning">Expiring ({diffDays}d)</span>;
                      } else if (batch.stock_remaining < batch.reorder_point && batch.stock_remaining > 0) {
                        statusPill = <span className="status-dot-pill warning-orange">Low Stock</span>;
                      } else if (batch.stock_on_hand === 0 || batch.status === 'depleted') {
                        statusPill = <span className="status-dot-pill inactive">Depleted</span>;
                      }

                      return (
                        <tr key={batch.id} className={batch.status === 'depleted' ? 'disabled-row' : ''}>
                          <td><code className="batch-code-tag">{batch.batch_number}</code></td>
                          <td>
                            <strong style={{ color: 'var(--gold-light)' }}>{batch.flavors?.flavor_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{batch.flavors?.category}</div>
                          </td>
                          <td>{formatDate(batch.manufactured_date).split(',')[0]}</td>
                          <td className={diffDays <= 10 ? 'date-critical' : ''}>
                            {formatDate(batch.expiry_date).split(',')[0]}
                          </td>
                          <td>{batch.quantity_received}</td>
                          <td><strong>{batch.stock_on_hand}</strong></td>
                          <td style={{ color: batch.stock_allocated > 0 ? 'var(--accent)' : 'inherit' }}>
                            {batch.stock_allocated}
                          </td>
                          <td>
                            <strong style={{ color: batch.stock_remaining < batch.reorder_point ? 'var(--accent)' : '#4bc0c0' }}>
                              {batch.stock_remaining}
                            </strong>
                          </td>
                          <td>{batch.reorder_point}</td>
                          <td><span className="unit-badge">{batch.unit}</span></td>
                          <td>{statusPill}</td>
                          <td>
                            <div className="table-actions-cell">
                              <button className="action-circle-btn edit" onClick={() => handleOpenBatchModal(batch)} title="Edit Batch Details">
                                <Edit2 size={13} />
                              </button>
                              <button className="action-circle-btn adjust" onClick={() => handleOpenAdjustStockModal(batch)} title="Adjust Stock On Hand">
                                <TrendingUp size={13} />
                              </button>
                              <button 
                                className={`action-circle-btn toggle ${batch.status === 'active' ? 'active' : 'inactive'}`} 
                                onClick={() => handleToggleBatchStatus(batch)}
                                title={batch.status === 'active' ? 'Mark Depleted' : 'Mark Active'}
                              >
                                <Check size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABS 3: MULTI-LOCATION STOCK */}
        {activeTab === 'locations' && (
          <div className="locations-mgmt-tab fade-in-up">
            <div className="tab-actions-row">
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <h2>Multi-Location Parlour Stock</h2>
                <div className="search-box inline-search">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search store, flavor or batch..."
                  />
                </div>
                <div className="select-wrapper">
                  <Filter size={14} className="filter-icon" />
                  <select value={shopFilter} onChange={(e) => setShopFilter(e.target.value)}>
                    <option value="All">All Parlours</option>
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>{s.shop_name}</option>
                    ))}
                  </select>
                </div>
                <div className="select-wrapper">
                  <Filter size={14} className="filter-icon" />
                  <select value={flavorFilter} onChange={(e) => setFlavorFilter(e.target.value)}>
                    <option value="All">All Flavors</option>
                    {flavors.map(f => (
                      <option key={f.id} value={f.id}>{f.flavor_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenReturnStockModal()}>
                  <RotateCcw size={14} style={{ marginRight: '4px' }} /> Return Parlour Stock
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleOpenAdjustStoreStockModal()}>
                  <Plus size={14} style={{ marginRight: '4px' }} /> Direct Store Adjust
                </button>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Store / Parlour</th>
                    <th>Flavor Name</th>
                    <th>Batch #</th>
                    <th>Expiry Date</th>
                    <th>Current Store Stock</th>
                    <th>Last Updated</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocationStock.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No store stock records found. Stock is added here when orders are marked "DELIVERED".
                      </td>
                    </tr>
                  ) : (
                    filteredLocationStock.map(loc => {
                      const expiry = loc.batches ? new Date(loc.batches.expiry_date) : null;
                      const diffDays = expiry ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)) : null;

                      return (
                        <tr key={loc.id}>
                          <td>
                            <strong style={{ color: 'var(--text-main)' }}>{loc.shops?.shop_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loc.shops?.shop_code}</div>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--gold-light)' }}>{loc.flavors?.flavor_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loc.flavors?.category}</div>
                          </td>
                          <td><code className="batch-code-tag">{loc.batches?.batch_number || 'Unknown'}</code></td>
                          <td className={diffDays && diffDays <= 10 ? 'date-critical' : ''}>
                            {loc.batches ? formatDate(loc.batches.expiry_date).split(',')[0] : 'N/A'}
                          </td>
                          <td><strong style={{ fontSize: '1rem', color: 'var(--gold)' }}>{loc.stock_qty} Tubs</strong></td>
                          <td>{formatDate(loc.last_updated)}</td>
                          <td>
                            <div className="table-actions-cell">
                              <button className="action-circle-btn edit" onClick={() => handleOpenAdjustStoreStockModal(loc)} title="Deduct / Adjust Store Stock">
                                <TrendingUp size={13} />
                              </button>
                              <button className="action-circle-btn adjust" onClick={() => handleOpenReturnStockModal(loc)} title="Return stock to warehouse">
                                <RotateCcw size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABS 4: STOCK MOVEMENTS AUDIT */}
        {activeTab === 'movements' && (
          <div className="movements-mgmt-tab fade-in-up">
            <div className="tab-actions-row">
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <h2>Inventory Movements Audit Trail</h2>
                <div className="search-box inline-search">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notes, flavor, batch..."
                  />
                </div>
                <div className="select-wrapper">
                  <Filter size={14} className="filter-icon" />
                  <select value={shopFilter} onChange={(e) => setShopFilter(e.target.value)}>
                    <option value="All">All Locations</option>
                    <option value="warehouse">Warehouse Only</option>
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>{s.shop_name}</option>
                    ))}
                  </select>
                </div>
                <div className="select-wrapper">
                  <Filter size={14} className="filter-icon" />
                  <select value={flavorFilter} onChange={(e) => setFlavorFilter(e.target.value)}>
                    <option value="All">All Flavors</option>
                    {flavors.map(f => (
                      <option key={f.id} value={f.id}>{f.flavor_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Flavor Name</th>
                    <th>Batch #</th>
                    <th>Movement Type</th>
                    <th>Quantity Change</th>
                    <th>Location / Parlour</th>
                    <th>System Audit Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No stock movement records found matching the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map(move => {
                      const isPositive = move.quantity > 0;
                      let typePill = <span className="movement-type-tag info">{move.type}</span>;
                      if (move.type === 'received') typePill = <span className="movement-type-tag success">Received</span>;
                      if (move.type === 'allocated') typePill = <span className="movement-type-tag warning">Allocated</span>;
                      if (move.type === 'dispatched') typePill = <span className="movement-type-tag warning-orange">Dispatched</span>;
                      if (move.type === 'delivered') typePill = <span className="movement-type-tag success-green">Delivered</span>;
                      if (move.type === 'damaged') typePill = <span className="movement-type-tag danger">Damage/Loss</span>;
                      if (move.type === 'returned') typePill = <span className="movement-type-tag info-blue">Returned</span>;

                      return (
                        <tr key={move.id}>
                          <td>{formatDate(move.created_at)}</td>
                          <td>
                            <strong style={{ color: 'var(--gold-light)' }}>{move.flavors?.flavor_name}</strong>
                          </td>
                          <td><code className="batch-code-tag">{move.batches?.batch_number || 'Unknown'}</code></td>
                          <td>{typePill}</td>
                          <td style={{ color: isPositive ? '#4bc0c0' : 'var(--accent)', fontWeight: 'bold' }}>
                            {isPositive ? '+' : ''}{move.quantity} Tubs
                          </td>
                          <td>{move.shops?.shop_name || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Master Warehouse</span>}</td>
                          <td>{move.notes}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABS 5: STORES DIRECTORY */}
        {activeTab === 'shops' && (
          <div className="stores-mgmt-tab fade-in-up">
            <div className="tab-actions-row">
              <h2>Partner Store Directory</h2>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenShopModal()}>
                <Plus size={16} style={{ marginRight: '6px' }} /> Add New Partner Shop
              </button>
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="admin-table-container desktop-only">
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
                  {filteredShops.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No partner stores found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredShops.map(shop => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="mobile-shops-list mobile-only">
              {filteredShops.length === 0 ? (
                <div className="mobile-empty-state">
                  No partner stores found matching the filters.
                </div>
              ) : (
                filteredShops.map(shop => {
                  const isExpanded = !!expandedShopIds[shop.id];
                  return (
                    <div key={shop.id} className={`mobile-shop-card ${!shop.active ? 'disabled-card' : ''}`}>
                      <div className="mobile-shop-header" onClick={() => toggleShopExpand(shop.id)}>
                        <div className="mobile-shop-title-wrap">
                          <div className="admin-partner-avatar-wrapper">
                            {shop.profile_image ? (
                              <img src={shop.profile_image} alt={shop.shop_name} className="admin-partner-avatar-img" />
                            ) : (
                              <div className="admin-partner-avatar-fallback">{shop.shop_name.charAt(0)}</div>
                            )}
                          </div>
                          <div className="mobile-shop-meta">
                            <h3 className="mobile-shop-name">{shop.shop_name}</h3>
                            <span className="mobile-shop-slug">/{shop.route_slug || 'n/a'}</span>
                          </div>
                        </div>
                        <div className="mobile-header-right">
                          <span className="shop-code-badge">{shop.shop_code}</span>
                          <button className="expand-chevron-btn" type="button">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="mobile-shop-body">
                        <div className="mobile-shop-info-row">
                          <span className="info-label">Access Code</span>
                          <code className="mobile-access-code">{shop.partner_code || 'N/A'}</code>
                        </div>

                        <div className="mobile-shop-info-row">
                          <span className="info-label">Location</span>
                          <span className="info-value">{shop.store_location}</span>
                        </div>

                        <div className="mobile-shop-info-row">
                          <span className="info-label">Status</span>
                          <span className={`status-dot-pill ${shop.active ? 'active' : 'inactive'}`}>
                            {shop.active ? 'Active' : 'Suspended'}
                          </span>
                        </div>

                        {/* Collapsible details section */}
                        {isExpanded && (
                          <div className="mobile-shop-expanded-details">
                            <div className="mobile-shop-info-row">
                              <span className="info-label">Contact Person</span>
                              <span className="info-value">{shop.owner_name}</span>
                            </div>
                            <div className="mobile-shop-info-row">
                              <span className="info-label">Phone</span>
                              <a href={`tel:${shop.phone}`} className="info-value text-link">{shop.phone}</a>
                            </div>
                            <div className="mobile-shop-info-row">
                              <span className="info-label">Email</span>
                              <a href={`mailto:${shop.email}`} className="info-value text-link">{shop.email}</a>
                            </div>
                            <div className="mobile-shop-info-row">
                              <span className="info-label">Security Login</span>
                              <span className="info-value text-monospace">{shop.email} (pwd: password)</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mobile-shop-actions">
                        <button className="mobile-action-btn edit" onClick={() => handleOpenShopModal(shop)}>
                          <Edit2 size={14} style={{ marginRight: '6px' }} />
                          <span>Edit</span>
                        </button>
                        <button
                          className={`mobile-action-btn toggle ${shop.active ? 'active' : 'inactive'}`}
                          onClick={() => toggleShopActive(shop)}
                        >
                          <Check size={14} style={{ marginRight: '6px' }} />
                          <span>{shop.active ? 'Suspend' : 'Activate'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TABS 6: FLAVORS CATALOG */}
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
                        {flavor.active ? 'Active Catalog' : 'Disabled'}
                      </span>
                    </div>
                    <p className="notes">{flavor.notes || 'No description provided.'}</p>
                    
                    <div className="flavor-stock-rollup">
                      <div>
                        <span className="label">Stock On Hand:</span>
                        <span className="value">{flavor.stock_on_hand} Tubs</span>
                      </div>
                      <div>
                        <span className="label">Available (Remaining):</span>
                        <span className={`value ${flavor.stock_remaining < flavor.reorder_point ? 'critical' : 'ok'}`}>{flavor.stock_remaining} Tubs</span>
                      </div>
                    </div>

                    <div className="flavor-card-footer">
                      <button className="btn btn-secondary btn-sm edit-btn" onClick={() => handleOpenFlavorModal(flavor)}>
                        ✏ Edit Details
                      </button>

                      <button
                        className={`toggle-availability-btn ${flavor.active ? 'active' : 'inactive'}`}
                        onClick={() => toggleFlavorActive(flavor)}
                      >
                        {flavor.active ? '🚫 Disable Catalog' : '✔️ Enable Catalog'}
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
                    <label>Partner Access Code (Secret PIN)</label>
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
              <h3>{editingFlavor ? 'Modify Flavor Details' : 'Add New Gourmet Flavor'}</h3>
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
                      <option value="Premium">Premium</option>
                      <option value="Fruit">Fruit</option>
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

      {/* BATCH ADD/EDIT MODAL */}
      {isBatchModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in-up">
            <div className="modal-header">
              <h3>{editingBatch ? 'Modify Stock Batch' : 'Create New Inventory Batch'}</h3>
              <button className="close-btn" onClick={() => setIsBatchModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleBatchSubmit}>
              <div className="modal-body">
                <div className="modal-form-grid">
                  <div className="form-group">
                    <label>Batch Number / Code</label>
                    <input
                      type="text"
                      value={batchForm.batch_number}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, batch_number: e.target.value.toUpperCase() }))}
                      placeholder="e.g. B-MNG-003"
                      required
                      disabled={!!editingBatch}
                    />
                  </div>
                  <div className="form-group">
                    <label>Flavor Profile</label>
                    <select
                      value={batchForm.flavor_id}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, flavor_id: e.target.value }))}
                      required
                      disabled={!!editingBatch}
                    >
                      {flavors.map(f => (
                        <option key={f.id} value={f.id}>{f.flavor_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Manufactured Date</label>
                    <input
                      type="date"
                      value={batchForm.manufactured_date}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, manufactured_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Expiry Date (FEFO tracker)</label>
                    <input
                      type="date"
                      value={batchForm.expiry_date}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity Received (Initial)</label>
                    <input
                      type="number"
                      value={batchForm.quantity_received}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, quantity_received: e.target.value }))}
                      min="1"
                      required
                      disabled={!!editingBatch}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pack Size / Unit</label>
                    <input
                      type="text"
                      value={batchForm.unit}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="e.g. Tub (5L)"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Min Order Quantity (MOQ)</label>
                    <input
                      type="number"
                      value={batchForm.min_order_qty}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, min_order_qty: e.target.value }))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Reorder Point Alert Limit</label>
                    <input
                      type="number"
                      value={batchForm.reorder_point}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, reorder_point: e.target.value }))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Production / Manufacturing Notes</label>
                    <textarea
                      value={batchForm.notes}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Cool chain details, ingredients batch numbers..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsBatchModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Stock Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WAREHOUSE STOCK ADJUST MODAL */}
      {isAdjustStockModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in-up compact-modal">
            <div className="modal-header">
              <h3>Adjust Warehouse Stock</h3>
              <button className="close-btn" onClick={() => setIsAdjustStockModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAdjustStockSubmit}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label>Quantity Change (+/- Tubs)</label>
                    <input
                      type="number"
                      value={adjustStockForm.quantity_change}
                      onChange={(e) => setAdjustStockForm(prev => ({ ...prev, quantity_change: e.target.value }))}
                      placeholder="e.g. 25 or -10"
                      required
                    />
                    <span className="help-text">Use positive numbers to add stock, negative numbers for damages/lost stock.</span>
                  </div>
                  <div className="form-group">
                    <label>Adjustment Type</label>
                    <select
                      value={adjustStockForm.type}
                      onChange={(e) => setAdjustStockForm(prev => ({ ...prev, type: e.target.value }))}
                      required
                    >
                      <option value="adjustment">General Correction</option>
                      <option value="damaged">Damage / Spillage Loss</option>
                      <option value="received">Extra Stock Churned</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Adjustment Reason / Notes</label>
                    <textarea
                      value={adjustStockForm.notes}
                      onChange={(e) => setAdjustStockForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Explain why this manual stock modification is being made..."
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdjustStockModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Apply Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STORE DIRECT STOCK ADJUST MODAL */}
      {isAdjustStoreStockModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in-up">
            <div className="modal-header">
              <h3>Direct Store Stock Adjustment</h3>
              <button className="close-btn" onClick={() => setIsAdjustStoreStockModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAdjustStoreStockSubmit}>
              <div className="modal-body">
                <div className="modal-form-grid">
                  <div className="form-group">
                    <label>Select Store</label>
                    <select
                      value={adjustStoreForm.shop_id}
                      onChange={(e) => setAdjustStoreForm(prev => ({ ...prev, shop_id: e.target.value }))}
                      required
                    >
                      {shops.map(s => (
                        <option key={s.id} value={s.id}>{s.shop_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Flavor</label>
                    <select
                      value={adjustStoreForm.flavor_id}
                      onChange={(e) => setAdjustStoreForm(prev => ({ ...prev, flavor_id: e.target.value }))}
                      required
                    >
                      {flavors.map(f => (
                        <option key={f.id} value={f.id}>{f.flavor_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Batch #</label>
                    <select
                      value={adjustStoreForm.batch_id}
                      onChange={(e) => setAdjustStoreForm(prev => ({ ...prev, batch_id: e.target.value }))}
                      required
                    >
                      {batches.filter(b => b.flavor_id === adjustStoreForm.flavor_id).map(b => (
                        <option key={b.id} value={b.id}>{b.batch_number} (Exp: {b.expiry_date.substring(0,10)})</option>
                      ))}
                      {batches.filter(b => b.flavor_id === adjustStoreForm.flavor_id).length === 0 && (
                        <option value="">No batches available</option>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity Change (+/- Tubs)</label>
                    <input
                      type="number"
                      value={adjustStoreForm.quantity_change}
                      onChange={(e) => setAdjustStoreForm(prev => ({ ...prev, quantity_change: e.target.value }))}
                      placeholder="e.g. -5 for store sales"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Audit Type</label>
                    <select
                      value={adjustStoreForm.type}
                      onChange={(e) => setAdjustStoreForm(prev => ({ ...prev, type: e.target.value }))}
                      required
                    >
                      <option value="adjustment">General Correction</option>
                      <option value="damaged">Store Loss / Damaged</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Audit Notes</label>
                    <textarea
                      value={adjustStoreForm.notes}
                      onChange={(e) => setAdjustStoreForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Specify why store inventory is being adjusted manually..."
                      rows={2}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdjustStoreStockModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Apply Store Adjust</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN STOCK MODAL */}
      {isReturnStockModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card fade-in-up">
            <div className="modal-header">
              <h3>Return Parlour Stock to Warehouse</h3>
              <button className="close-btn" onClick={() => setIsReturnStockModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleReturnStockSubmit}>
              <div className="modal-body">
                <div className="modal-form-grid">
                  <div className="form-group">
                    <label>Select Store</label>
                    <select
                      value={returnStockForm.shop_id}
                      onChange={(e) => setReturnStockForm(prev => ({ ...prev, shop_id: e.target.value }))}
                      required
                    >
                      {shops.map(s => (
                        <option key={s.id} value={s.id}>{s.shop_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Flavor</label>
                    <select
                      value={returnStockForm.flavor_id}
                      onChange={(e) => setReturnStockForm(prev => ({ ...prev, flavor_id: e.target.value }))}
                      required
                    >
                      {flavors.map(f => (
                        <option key={f.id} value={f.id}>{f.flavor_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Select Batch #</label>
                    <select
                      value={returnStockForm.batch_id}
                      onChange={(e) => setReturnStockForm(prev => ({ ...prev, batch_id: e.target.value }))}
                      required
                    >
                      {locationStock.filter(l => l.shop_id === returnStockForm.shop_id && l.flavor_id === returnStockForm.flavor_id).map(l => (
                        <option key={l.batch_id} value={l.batch_id}>{l.batches?.batch_number} (Available: {l.stock_qty})</option>
                      ))}
                      {locationStock.filter(l => l.shop_id === returnStockForm.shop_id && l.flavor_id === returnStockForm.flavor_id).length === 0 && (
                        <option value="">No parlour stock records found</option>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity to Return (Tubs)</label>
                    <input
                      type="number"
                      value={returnStockForm.quantity}
                      onChange={(e) => setReturnStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Return Notes / Reasoning</label>
                    <textarea
                      value={returnStockForm.notes}
                      onChange={(e) => setReturnStockForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="e.g. End of season shelf-life rotation, surplus stock consolidations..."
                      rows={2}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsReturnStockModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Process Return</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
