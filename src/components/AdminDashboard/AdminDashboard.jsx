import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, ShoppingBag, Plus, Edit2, Search, Filter, Clock,
  AlertCircle, Users, User, MapPin, Phone, Mail, Check, ArrowLeft,
  Volume2, VolumeX, Package, TrendingUp, AlertTriangle,
  RotateCcw, ClipboardList, ChevronDown, ChevronUp,
  Activity, RefreshCw
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
  const [flavorStockFilter, setFlavorStockFilter] = useState('All'); // 'All', 'low_stock', 'out_of_stock'
  const [locationStockFilter, setLocationStockFilter] = useState('All'); // 'All', 'low_stock'
  const [selectedInventoryCenterSubTab, setSelectedInventoryCenterSubTab] = useState('summary'); // 'summary', 'batches', 'forecast', 'movements'
  const [selectedAnalyticsSubTab, setSelectedAnalyticsSubTab] = useState('performance'); // 'performance', 'flavors', 'health'

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
  const [expandedInventorySummaryIds, setExpandedInventorySummaryIds] = useState({});
  const [expandedWarehouseBatchIds, setExpandedWarehouseBatchIds] = useState({});
  const [expandedProductionRecommendIds, setExpandedProductionRecommendIds] = useState({});
  const [expandedStockMovementIds, setExpandedStockMovementIds] = useState({});
  const [expandedParlourStockIds, setExpandedParlourStockIds] = useState({});
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

      // Keep selected order info in sync
      if (selectedOrder) {
        const updatedOrder = ordersList.find(o => o.id === selectedOrder.id);
        if (updatedOrder && (updatedOrder.status !== selectedOrder.status || updatedOrder.cancellation_reason !== selectedOrder.cancellation_reason)) {
          setSelectedOrder(updatedOrder);
          const history = await supabaseService.getOrderHistory(selectedOrder.id);
          setOrderHistory(history);
        }
      }
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

  // Realtime subscription, polling, and window storage events
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

    // Polling interval (5 seconds) as fallback/cross-browser sync
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000);

    // Storage event listener for instant multi-tab local sync
    const handleStorageChange = (e) => {
      if (
        e.key === 'nyathiyas_orders' || 
        e.key === 'nyathiyas_order_items' || 
        e.key === 'nyathiyas_batches' ||
        e.key === 'nyathiyas_order_history'
      ) {
        loadDashboardData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSession, selectedOrder, soundEnabled]);

  // Load selected order history
  useEffect(() => {
    if (selectedOrder) {
      supabaseService.getOrderHistory(selectedOrder.id).then(setOrderHistory);
    }
  }, [selectedOrder]);

  // Update order status handler
  const handleUpdateStatus = async (orderId, newStatus, reason = '') => {
    try {
      const updated = await supabaseService.updateOrderStatus(orderId, newStatus, reason);
      supabaseService.triggerLocalOrderChange('UPDATE', updated);
      loadDashboardData();

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus, cancellation_reason: reason }));
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
    if (batch && batch.id) {
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
      const selectedFlavorId = batch?.flavor_id || flavors[0]?.id || '';
      const selectedFlavor = flavors.find(f => f.id === selectedFlavorId);
      const flavorPrefix = selectedFlavor ? selectedFlavor.flavor_name.substring(0, 3).toUpperCase() : 'FLV';
      const dateStr = new Date().toISOString().substring(2, 10).replace(/-/g, '');
      const batchCode = `NY-${flavorPrefix}-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;

      setBatchForm({
        batch_number: batch?.batch_number || batchCode,
        flavor_id: selectedFlavorId,
        manufactured_date: new Date().toISOString().substring(0, 10),
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        quantity_received: batch?.quantity_received || 100,
        unit: 'Tub (5L)',
        min_order_qty: 5,
        reorder_point: 15,
        notes: batch?.notes || 'Triggered from Production Planner recommendation.'
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
      batch_number: batch.batch_number,
      flavor_name: batch.flavors?.flavor_name || '',
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

  const toggleInventorySummaryExpand = (id) => {
    setExpandedInventorySummaryIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleWarehouseBatchExpand = (id) => {
    setExpandedWarehouseBatchIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleProductionRecommendExpand = (id) => {
    setExpandedProductionRecommendIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleStockMovementExpand = (id) => {
    setExpandedStockMovementIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleParlourStockExpand = (id) => {
    setExpandedParlourStockIds(prev => ({
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
        setActiveTab('inventory_center');
        setSelectedInventoryCenterSubTab('summary');
        setFlavorStockFilter('All');
        break;
      case 'low_stock_flavors':
        setActiveTab('inventory_center');
        setSelectedInventoryCenterSubTab('summary');
        setFlavorStockFilter('low_stock');
        break;
      case 'out_of_stock_flavors':
        setActiveTab('inventory_center');
        setSelectedInventoryCenterSubTab('summary');
        setFlavorStockFilter('out_of_stock');
        break;
      case 'reorder_requests':
        setActiveTab('locations');
        setLocationStockFilter('low_stock');
        break;
      case 'expiring_soon_batches':
        setActiveTab('inventory_center');
        setSelectedInventoryCenterSubTab('batches');
        setBatchStatusFilter('expiring');
        break;
      case 'inventory_health':
        setActiveTab('analytics');
        setSelectedAnalyticsSubTab('health');
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
    const activeShopsCount = shops.filter(s => s.active).length;
    const totalTubsCount = batches.reduce((sum, b) => sum + (b.status === 'active' ? b.stock_on_hand : 0), 0);

    // Calculate flavor-level warehouse stock stats
    const flavorStats = flavors.map(flavor => {
      const flavorBatches = batches.filter(b => b.flavor_id === flavor.id);
      const available = flavorBatches.reduce((sum, b) => sum + (b.status === 'active' ? b.stock_remaining : 0), 0);
      const reserved = flavorBatches.reduce((sum, b) => sum + b.stock_allocated, 0);
      return { flavor, available, reserved };
    });

    const lowStockFlavorsCount = flavorStats.filter(f => f.available > 0 && f.available <= 20).length;
    const outOfStockFlavorsCount = flavorStats.filter(f => f.available === 0).length;

    // Reorder requests from parlour stock records needing replenishment (stock_qty <= 5)
    const reorderRequestsCount = locationStock.filter(loc => loc.stock_qty <= 5).length;

    // Expiring soon count (active batches expiring in next 10 days)
    const activeBatches = batches.filter(b => b.status === 'active' && new Date(b.expiry_date) > new Date());
    const expiringSoonCount = activeBatches.filter(b => {
      const expiry = new Date(b.expiry_date);
      const diffDays = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 10;
    }).length;

    // Inventory Health Pct: (Healthy Flavors / Total Flavors) * 100
    const healthyFlavorsCount = flavorStats.filter(f => f.available > 20).length;
    const totalFlavorsCount = flavors.length || 1;
    const inventoryHealthPct = Math.round((healthyFlavorsCount / totalFlavorsCount) * 100);

    return {
      todayCount: todayOrders.length,
      pendingCount,
      activeShopsCount,
      totalTubsCount,
      lowStockFlavorsCount,
      outOfStockFlavorsCount,
      reorderRequestsCount,
      expiringSoonCount,
      inventoryHealthPct
    };
  };

  const stats = getStats();

  const getFlavorInventoryStats = () => {
    return flavors.map(flavor => {
      const flavorBatches = batches.filter(b => b.flavor_id === flavor.id);
      const available = flavorBatches.reduce((sum, b) => sum + (b.status === 'active' ? b.stock_remaining : 0), 0);
      const reserved = flavorBatches.reduce((sum, b) => sum + b.stock_allocated, 0);
      
      let dispatched = 0;
      orders.forEach(order => {
        if (['dispatched', 'delivered', 'completed'].includes(order.status)) {
          const item = order.order_items?.find(i => i.flavor_id === flavor.id);
          if (item) {
            dispatched += item.quantity;
          }
        }
      });

      const activeBatches = flavorBatches.filter(b => b.status === 'active' && b.stock_remaining > 0);
      let nearestExpiryDays = null;
      if (activeBatches.length > 0) {
        const expiries = activeBatches.map(b => new Date(b.expiry_date));
        const minExpiry = new Date(Math.min(...expiries));
        nearestExpiryDays = Math.ceil((minExpiry - new Date()) / (1000 * 60 * 60 * 24));
      }

      let status = 'Healthy';
      if (available === 0) {
        status = 'Out of Stock';
      } else if (available <= 20) {
        status = 'Low Stock';
      }

      return {
        flavor,
        available,
        reserved,
        dispatched,
        nearestExpiryDays,
        status
      };
    });
  };

  const getLatestActiveBatch = (flavorId) => {
    const flavorBatches = batches.filter(b => b.flavor_id === flavorId && b.status === 'active');
    if (flavorBatches.length === 0) return null;
    return [...flavorBatches].sort((a, b) => new Date(b.manufactured_date) - new Date(a.manufactured_date))[0];
  };

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

    let matchesStockFilter = true;
    if (locationStockFilter === 'low_stock') {
      matchesStockFilter = l.stock_qty <= 5;
    }

    return matchesSearch && matchesShop && matchesFlavor && matchesStockFilter;
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
          <span className="brand-logo" onClick={() => {
            navigate('/admin');
            setActiveTab('orders');
            setSelectedOrder(null);
            setSearchQuery('');
            setStatFilterOverride(null);
            setStatusFilter('All');
            setShopFilter('All');
          }}>Nyathiya's</span>
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
            className={`header-nav-btn ${activeTab === 'inventory_center' ? 'active' : ''}`}
            onClick={() => { setActiveTab('inventory_center'); setSelectedOrder(null); setSearchQuery(''); setStatFilterOverride(null); }}
          >
            <Package size={18} />
            <span>Inventory Center</span>
          </button>

          <button
            className={`header-nav-btn ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('locations'); setSelectedOrder(null); setSearchQuery(''); setStatFilterOverride(null); setLocationStockFilter('All'); }}
          >
            <MapPin size={18} />
            <span>Location Stock</span>
          </button>

          <button
            className={`header-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setSelectedOrder(null); setSearchQuery(''); setStatFilterOverride(null); }}
          >
            <Activity size={18} />
            <span>Analytics Hub</span>
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
          className={`stat-card alert-stock interactive-card ${statFilterOverride === 'low_stock_flavors' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('low_stock_flavors')}
          title="Filter by Low Stock Flavors"
          type="button"
        >
          <div className={`stat-icon-wrap ${stats.lowStockFlavorsCount > 0 ? 'orange-alert' : 'green-ok'}`}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.lowStockFlavorsCount}</span>
            <span className="stat-label">Low Stock Flavors</span>
          </div>
        </button>

        <button 
          className={`stat-card alert-stock interactive-card ${statFilterOverride === 'out_of_stock_flavors' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('out_of_stock_flavors')}
          title="Filter by Out of Stock Flavors"
          type="button"
        >
          <div className={`stat-icon-wrap ${stats.outOfStockFlavorsCount > 0 ? 'red-alert' : 'green-ok'}`}>
            <AlertCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.outOfStockFlavorsCount}</span>
            <span className="stat-label">Out of Stock Flavors</span>
          </div>
        </button>

        <button 
          className={`stat-card interactive-card ${statFilterOverride === 'reorder_requests' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('reorder_requests')}
          title="Filter by Parlour Reorders"
          type="button"
        >
          <div className="stat-icon-wrap purple">
            <RefreshCw size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.reorderRequestsCount}</span>
            <span className="stat-label">Reorder Requests</span>
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
            <span className="stat-label">Expiring Soon</span>
          </div>
        </button>

        <button 
          className={`stat-card interactive-card ${statFilterOverride === 'inventory_health' ? 'active' : ''}`}
          onClick={() => handleStatCardClick('inventory_health')}
          title="Filter by Inventory Health & Analytics"
          type="button"
        >
          <div className="stat-icon-wrap green-ok">
            <Activity size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-val">{stats.inventoryHealthPct}%</span>
            <span className="stat-label">Inventory Health</span>
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
                      <option value="Cancellation_Requested">Cancellation Requested</option>
                      <option value="Cancelled">Cancelled</option>
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

              {/* Cancellation Requests Pending Review Panel */}
              {orders.filter(o => o.status === 'cancellation_requested').length > 0 && (
                <div className="cancellation-requests-review-panel">
                  <div className="panel-title-row">
                    <AlertTriangle size={16} className="warning-text-gold" />
                    <h3>Cancellation Requests ({orders.filter(o => o.status === 'cancellation_requested').length})</h3>
                  </div>
                  <div className="requests-stack">
                    {orders.filter(o => o.status === 'cancellation_requested').map(req => {
                      const shop = req.shops || {};
                      const isSelected = selectedOrder && selectedOrder.id === req.id;
                      return (
                        <div 
                          key={req.id} 
                          className={`cancellation-request-card ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedOrder(req)}
                        >
                          <div className="req-header">
                            <strong className="req-num">{req.order_number}</strong>
                            <span className="req-shop-code">{shop.shop_code}</span>
                          </div>
                          <p className="req-shop-name">{shop.shop_name}</p>
                          <div className="req-reason-box">
                            <span className="reason-label">Reason:</span>
                            <span className="reason-text">"{req.cancellation_reason || 'No reason provided'}"</span>
                          </div>
                          <div className="req-actions-row" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="btn-approve-cancel"
                              onClick={() => handleUpdateStatus(req.id, 'cancelled', req.cancellation_reason)}
                            >
                              Approve Cancel
                            </button>
                            <button 
                              className="btn-reject-cancel"
                              onClick={() => handleUpdateStatus(req.id, 'accepted', 'Cancellation request rejected by Admin')}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value, selectedOrder.cancellation_reason)}
                        className={`status-dropdown-select ${selectedOrder.status}`}
                      >
                        <option value="pending">Pending Approval</option>
                        <option value="accepted">Accept Order</option>
                        <option value="preparing">Set to Preparing</option>
                        <option value="dispatched">Dispatch Order (Deduct Stock)</option>
                        <option value="delivered">Set to Delivered (Add Store Stock)</option>
                        <option value="rejected">Reject Order</option>
                        <option value="cancellation_requested">Cancellation Requested</option>
                        <option value="cancelled">Cancel Order</option>
                      </select>
                    </div>
                  </div>

                  {selectedOrder.status === 'cancellation_requested' && (
                    <div className="admin-cancellation-alert-box">
                      <AlertTriangle size={18} className="warning-icon" />
                      <div>
                        <strong>Cancellation Requested by Store</strong>
                        <p>Reason: "{selectedOrder.cancellation_reason || 'No reason specified'}"</p>
                        <div className="alert-buttons">
                          <button 
                            className="btn btn-danger btn-xs"
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled', selectedOrder.cancellation_reason)}
                          >
                            Approve Cancellation (Release Stock)
                          </button>
                          <button 
                            className="btn btn-secondary btn-xs"
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'accepted', 'Cancellation request rejected by Admin')}
                          >
                            Reject Request (Keep Active)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status === 'cancelled' && (
                    <div className="admin-cancellation-alert-box cancelled">
                      <AlertCircle size={18} className="info-icon" />
                      <div>
                        <strong>Order Cancelled</strong>
                        <p>Reason: "{selectedOrder.cancellation_reason || 'No reason specified'}"</p>
                      </div>
                    </div>
                  )}

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
                              {history.notes && (
                                <span className="audit-reason">Reason/Note: "{history.notes}"</span>
                              )}
                              <span className="audit-meta">
                                Changed At: {formatDate(history.changed_at)}
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

        {/* TABS 2: UNIFIED INVENTORY CENTER */}
        {activeTab === 'inventory_center' && (
          <div className="inventory-mgmt-tab fade-in-up">
            <div className="tab-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Warehouse Inventory Intelligence</h2>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenBatchModal()}>
                <Plus size={16} style={{ marginRight: '6px' }} /> Create New Stock Batch
              </button>
            </div>

            {/* Sub navigation */}
            <div className="sub-tabs-nav" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', marginBottom: '20px', paddingBottom: '10px' }}>
              <button 
                className={`sub-tab-btn ${selectedInventoryCenterSubTab === 'summary' ? 'active' : ''}`}
                onClick={() => setSelectedInventoryCenterSubTab('summary')}
                style={{
                  background: selectedInventoryCenterSubTab === 'summary' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: selectedInventoryCenterSubTab === 'summary' ? 'var(--gold)' : 'transparent',
                  color: selectedInventoryCenterSubTab === 'summary' ? 'var(--gold)' : 'var(--text-muted)',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Flavor Stock Summary
              </button>
              <button 
                className={`sub-tab-btn ${selectedInventoryCenterSubTab === 'batches' ? 'active' : ''}`}
                onClick={() => setSelectedInventoryCenterSubTab('batches')}
                style={{
                  background: selectedInventoryCenterSubTab === 'batches' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: selectedInventoryCenterSubTab === 'batches' ? 'var(--gold)' : 'transparent',
                  color: selectedInventoryCenterSubTab === 'batches' ? 'var(--gold)' : 'var(--text-muted)',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Warehouse Batches
              </button>
              <button 
                className={`sub-tab-btn ${selectedInventoryCenterSubTab === 'forecast' ? 'active' : ''}`}
                onClick={() => setSelectedInventoryCenterSubTab('forecast')}
                style={{
                  background: selectedInventoryCenterSubTab === 'forecast' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: selectedInventoryCenterSubTab === 'forecast' ? 'var(--gold)' : 'transparent',
                  color: selectedInventoryCenterSubTab === 'forecast' ? 'var(--gold)' : 'var(--text-muted)',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Production Planning & Forecast
              </button>
              <button 
                className={`sub-tab-btn ${selectedInventoryCenterSubTab === 'movements' ? 'active' : ''}`}
                onClick={() => setSelectedInventoryCenterSubTab('movements')}
                style={{
                  background: selectedInventoryCenterSubTab === 'movements' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: selectedInventoryCenterSubTab === 'movements' ? 'var(--gold)' : 'transparent',
                  color: selectedInventoryCenterSubTab === 'movements' ? 'var(--gold)' : 'var(--text-muted)',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Warehouse Audit Trail
              </button>
            </div>

            {/* SUBTAB 1: FLAVOR SUMMARY */}
            {selectedInventoryCenterSubTab === 'summary' && (
              <div className="flavor-summary-view fade-in-up">
                <div className="tab-actions-row" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '16px' }}>
                  <div className="search-box inline-search">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search flavor..."
                    />
                  </div>
                  <div className="select-wrapper">
                    <Filter size={14} className="filter-icon" />
                    <select value={flavorStockFilter} onChange={(e) => setFlavorStockFilter(e.target.value)}>
                      <option value="All">All Stock Levels</option>
                      <option value="low_stock">{'Low Stock (<= 20 Tubs)'}</option>
                      <option value="out_of_stock">Out of Stock (0 Tubs)</option>
                    </select>
                  </div>
                </div>

                {/* DESKTOP TABLE VIEW */}
                <div className="admin-table-container desktop-only">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Flavor Name</th>
                        <th>Category</th>
                        <th>Available (Warehouse)</th>
                        <th>Reserved (Allocated)</th>
                        <th>Dispatched (Cumulative)</th>
                        <th>Nearest Expiry</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const flavorStatsList = getFlavorInventoryStats().filter(item => {
                          const matchesSearch = item.flavor.flavor_name.toLowerCase().includes(searchQuery.toLowerCase());
                          let matchesStatus = true;
                          if (flavorStockFilter === 'low_stock') {
                            matchesStatus = item.available > 0 && item.available <= 20;
                          } else if (flavorStockFilter === 'out_of_stock') {
                            matchesStatus = item.available === 0;
                          }
                          return matchesSearch && matchesStatus;
                        });

                        if (flavorStatsList.length === 0) {
                          return (
                            <tr>
                              <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No flavors matching the filter.
                              </td>
                            </tr>
                          );
                        }

                        return flavorStatsList.map(item => {
                          const latestBatch = getLatestActiveBatch(item.flavor.id);
                          
                          let statusPill = <span className="status-dot-pill active">Healthy</span>;
                          if (item.available === 0) {
                            statusPill = <span className="status-dot-pill error">Out of Stock</span>;
                          } else if (item.available <= 20) {
                            statusPill = <span className="status-dot-pill warning">Low Stock</span>;
                          } else if (item.nearestExpiryDays !== null && item.nearestExpiryDays <= 10) {
                            statusPill = <span className="status-dot-pill warning-orange">Expiring Soon</span>;
                          }

                          return (
                            <tr key={item.flavor.id}>
                              <td><strong>{item.flavor.flavor_name}</strong></td>
                              <td><span className="category-badge">{item.flavor.category}</span></td>
                              <td>
                                <strong style={{ color: item.available === 0 ? 'var(--accent)' : item.available <= 20 ? 'var(--gold)' : '#4bc0c0' }}>
                                  {item.available} Tubs
                                </strong>
                              </td>
                              <td style={{ color: item.reserved > 0 ? 'var(--gold-light)' : 'inherit' }}>
                                {item.reserved} Tubs
                              </td>
                              <td>{item.dispatched} Tubs</td>
                              <td className={item.nearestExpiryDays !== null && item.nearestExpiryDays <= 10 ? 'date-critical' : ''}>
                                {item.nearestExpiryDays !== null ? `${item.nearestExpiryDays} days left` : 'N/A'}
                              </td>
                              <td>{statusPill}</td>
                              <td>
                                <div className="table-actions-cell" style={{ justifyContent: 'center', gap: '8px' }}>
                                  {latestBatch ? (
                                    <>
                                      <button 
                                        className="btn btn-secondary btn-xs" 
                                        onClick={() => handleOpenAdjustStockModal(latestBatch)}
                                        title="Quickly Adjust Available Stock"
                                      >
                                        Adjust Stock
                                      </button>
                                      <button 
                                        className="btn btn-secondary btn-xs" 
                                        onClick={() => handleOpenBatchModal(latestBatch)}
                                        title="Manage Allocations & Reservation details"
                                      >
                                        Reserve Details
                                      </button>
                                      <button 
                                        className="btn btn-secondary btn-xs" 
                                        style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                                        onClick={() => handleToggleBatchStatus(latestBatch)}
                                        title="Mark the latest active batch of this flavor depleted/expired"
                                      >
                                        Mark Expired
                                      </button>
                                    </>
                                  ) : (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Active Batch</span>
                                  )}
                                  <button 
                                    className="btn btn-primary btn-xs" 
                                    onClick={() => handleOpenBatchModal({ flavor_id: item.flavor.id })}
                                    title="Add new production batch for this flavor"
                                  >
                                    Add Batch
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="mobile-records-list mobile-only">
                  {(() => {
                    const flavorStatsList = getFlavorInventoryStats().filter(item => {
                      const matchesSearch = item.flavor.flavor_name.toLowerCase().includes(searchQuery.toLowerCase());
                      let matchesStatus = true;
                      if (flavorStockFilter === 'low_stock') {
                        matchesStatus = item.available > 0 && item.available <= 20;
                      } else if (flavorStockFilter === 'out_of_stock') {
                        matchesStatus = item.available === 0;
                      }
                      return matchesSearch && matchesStatus;
                    });

                    if (flavorStatsList.length === 0) {
                      return (
                        <div className="mobile-empty-state">
                          No flavors matching the filter.
                        </div>
                      );
                    }

                    return flavorStatsList.map(item => {
                      const latestBatch = getLatestActiveBatch(item.flavor.id);
                      const isExpanded = !!expandedInventorySummaryIds[item.flavor.id];
                      
                      let statusPill = <span className="status-dot-pill active">Healthy</span>;
                      if (item.available === 0) {
                        statusPill = <span className="status-dot-pill error">Out of Stock</span>;
                      } else if (item.available <= 20) {
                        statusPill = <span className="status-dot-pill warning">Low Stock</span>;
                      } else if (item.nearestExpiryDays !== null && item.nearestExpiryDays <= 10) {
                        statusPill = <span className="status-dot-pill warning-orange">Expiring Soon</span>;
                      }

                      return (
                        <div key={item.flavor.id} className={`mobile-record-card ${item.available === 0 ? 'out-of-stock' : ''}`}>
                          <div className="mobile-card-header" onClick={() => toggleInventorySummaryExpand(item.flavor.id)}>
                            <div className="mobile-card-title-wrap">
                              <span className="category-badge">{item.flavor.category}</span>
                              <h3 className="mobile-card-title">{item.flavor.flavor_name}</h3>
                            </div>
                            <div className="mobile-card-header-right">
                              <strong style={{ color: item.available === 0 ? 'var(--accent)' : item.available <= 20 ? 'var(--gold)' : '#4bc0c0' }}>
                                {item.available} Tubs
                              </strong>
                              <ChevronDown className={`expand-chevron ${isExpanded ? 'rotated' : ''}`} size={16} />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mobile-card-details-expanded">
                              <div className="detail-row">
                                <span className="label">Reserved (Allocated):</span>
                                <span className="val">{item.reserved} Tubs</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Dispatched (Cumulative):</span>
                                <span className="val">{item.dispatched} Tubs</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Nearest Expiry:</span>
                                <span className={`val ${item.nearestExpiryDays !== null && item.nearestExpiryDays <= 10 ? 'date-critical' : ''}`}>
                                  {item.nearestExpiryDays !== null ? `${item.nearestExpiryDays} days left` : 'N/A'}
                                </span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Status:</span>
                                <span className="val">{statusPill}</span>
                              </div>

                              <div className="mobile-card-actions-wrapper">
                                {latestBatch ? (
                                  <>
                                    <button 
                                      className="btn btn-secondary btn-sm" 
                                      onClick={() => handleOpenAdjustStockModal(latestBatch)}
                                    >
                                      Adjust Stock
                                    </button>
                                    <button 
                                      className="btn btn-secondary btn-sm" 
                                      onClick={() => handleOpenBatchModal(latestBatch)}
                                    >
                                      Reserve Details
                                    </button>
                                    <button 
                                      className="btn btn-secondary btn-sm" 
                                      style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                                      onClick={() => handleToggleBatchStatus(latestBatch)}
                                    >
                                      Mark Expired
                                    </button>
                                  </>
                                ) : (
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Active Batch</span>
                                )}
                                <button 
                                  className="btn btn-primary btn-sm" 
                                  onClick={() => handleOpenBatchModal({ flavor_id: item.flavor.id })}
                                >
                                  Add Batch
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* SUBTAB 2: WAREHOUSE BATCHES (ORIGINAL VIEW) */}
            {selectedInventoryCenterSubTab === 'batches' && (
              <div className="warehouse-batches-view fade-in-up">
                <div className="tab-actions-row" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '16px' }}>
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

                {/* DESKTOP TABLE VIEW */}
                <div className="admin-table-container desktop-only">
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
                      {(() => {
                        const filtered = batches.filter(batch => {
                          const matchesSearch = batch.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            batch.flavors?.flavor_name.toLowerCase().includes(searchQuery.toLowerCase());
                          
                          const matchesFlavor = flavorFilter === 'All' || batch.flavor_id === flavorFilter;
                          
                          const expiry = new Date(batch.expiry_date);
                          const diffDays = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
                          
                          let matchesStatus = true;
                          if (batchStatusFilter === 'active') {
                            matchesStatus = batch.status === 'active' && diffDays > 10 && batch.stock_remaining >= batch.reorder_point;
                          } else if (batchStatusFilter === 'expiring') {
                            matchesStatus = diffDays >= 0 && diffDays <= 10 && batch.status === 'active';
                          } else if (batchStatusFilter === 'expired') {
                            matchesStatus = diffDays < 0;
                          } else if (batchStatusFilter === 'low_stock') {
                            matchesStatus = batch.status === 'active' && batch.stock_remaining < batch.reorder_point && batch.stock_remaining > 0;
                          } else if (batchStatusFilter === 'depleted') {
                            matchesStatus = batch.stock_on_hand === 0 || batch.status === 'depleted';
                          }

                          return matchesSearch && matchesFlavor && matchesStatus;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="12" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No warehouse stock batches found.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map(batch => {
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
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="mobile-records-list mobile-only">
                  {(() => {
                    const filtered = batches.filter(batch => {
                      const matchesSearch = batch.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        batch.flavors?.flavor_name.toLowerCase().includes(searchQuery.toLowerCase());
                      
                      const matchesFlavor = flavorFilter === 'All' || batch.flavor_id === flavorFilter;
                      
                      const expiry = new Date(batch.expiry_date);
                      const diffDays = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
                      
                      let matchesStatus = true;
                      if (batchStatusFilter === 'active') {
                        matchesStatus = batch.status === 'active' && diffDays > 10 && batch.stock_remaining >= batch.reorder_point;
                      } else if (batchStatusFilter === 'expiring') {
                        matchesStatus = diffDays >= 0 && diffDays <= 10 && batch.status === 'active';
                      } else if (batchStatusFilter === 'expired') {
                        matchesStatus = diffDays < 0;
                      } else if (batchStatusFilter === 'low_stock') {
                        matchesStatus = batch.status === 'active' && batch.stock_remaining < batch.reorder_point && batch.stock_remaining > 0;
                      } else if (batchStatusFilter === 'depleted') {
                        matchesStatus = batch.stock_on_hand === 0 || batch.status === 'depleted';
                      }

                      return matchesSearch && matchesFlavor && matchesStatus;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="mobile-empty-state">
                          No warehouse stock batches found.
                        </div>
                      );
                    }

                    return filtered.map(batch => {
                      const expiry = new Date(batch.expiry_date);
                      const diffDays = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
                      const isExpanded = !!expandedWarehouseBatchIds[batch.id];
                      
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
                        <div key={batch.id} className={`mobile-record-card ${batch.status === 'depleted' ? 'depleted' : ''}`}>
                          <div className="mobile-card-header" onClick={() => toggleWarehouseBatchExpand(batch.id)}>
                            <div className="mobile-card-title-wrap">
                              <code className="batch-code-tag">{batch.batch_number}</code>
                              <h3 className="mobile-card-title">{batch.flavors?.flavor_name}</h3>
                            </div>
                            <div className="mobile-card-header-right">
                              <strong style={{ color: batch.stock_remaining < batch.reorder_point ? 'var(--accent)' : '#4bc0c0' }}>
                                {batch.stock_remaining} Tubs
                              </strong>
                              <ChevronDown className={`expand-chevron ${isExpanded ? 'rotated' : ''}`} size={16} />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mobile-card-details-expanded">
                              <div className="detail-row">
                                <span className="label">Mfg Date:</span>
                                <span className="val">{formatDate(batch.manufactured_date).split(',')[0]}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Expiry Date:</span>
                                <span className={`val ${diffDays <= 10 ? 'date-critical' : ''}`}>
                                  {formatDate(batch.expiry_date).split(',')[0]}
                                </span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Total Received:</span>
                                <span className="val">{batch.quantity_received} Tubs</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">On Hand:</span>
                                <span className="val">{batch.stock_on_hand} Tubs</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Allocated:</span>
                                <span className="val" style={{ color: batch.stock_allocated > 0 ? 'var(--accent)' : 'inherit' }}>
                                  {batch.stock_allocated} Tubs
                                </span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Reorder Point:</span>
                                <span className="val">{batch.reorder_point} Tubs</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Unit:</span>
                                <span className="val"><span className="unit-badge">{batch.unit}</span></span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Status:</span>
                                <span className="val">{statusPill}</span>
                              </div>

                              <div className="mobile-card-actions-wrapper">
                                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenBatchModal(batch)}>
                                  Edit Details
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenAdjustStockModal(batch)}>
                                  Adjust Stock
                                </button>
                                <button 
                                  className="btn btn-secondary btn-sm" 
                                  style={{ color: batch.status === 'active' ? 'var(--accent)' : '#4bc0c0', borderColor: batch.status === 'active' ? 'rgba(239,68,68,0.4)' : 'rgba(75,192,192,0.4)' }}
                                  onClick={() => handleToggleBatchStatus(batch)}
                                >
                                  {batch.status === 'active' ? 'Mark Depleted' : 'Mark Active'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* SUBTAB 3: PRODUCTION PLANNING & FORECAST (NEW VIEW) */}
            {selectedInventoryCenterSubTab === 'forecast' && (
              <div className="production-forecast-view fade-in-up">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  
                  {/* Depletion Risk Box */}
                  <div className="forecast-metric-card" style={{ background: 'rgba(28, 8, 38, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
                      <h3 style={{ margin: 0 }}>Critical Depletion Risks</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                      Flavors currently out of stock or projected to run out based on sales demand velocity.
                    </p>
                    {(() => {
                      const risks = getFlavorInventoryStats().filter(f => f.available <= 20);
                      if (risks.length === 0) {
                        return <div style={{ color: '#4bc0c0', fontWeight: '600' }}>✓ All flavors healthy & fully stocked</div>;
                      }
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {risks.map(r => (
                            <div key={r.flavor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.08)', padding: '8px 12px', borderRadius: '4px', borderLeft: '4px solid #ef4444' }}>
                              <div>
                                <strong style={{ color: 'var(--gold-light)' }}>{r.flavor.flavor_name}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Warehouse: {r.available} Tubs</div>
                              </div>
                              <span className={`status-dot-pill ${r.available === 0 ? 'error' : 'warning'}`}>
                                {r.available === 0 ? 'DEPLETED' : 'LOW STOCK'}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Churn Rate & Velocity Box */}
                  <div className="forecast-metric-card" style={{ background: 'rgba(28, 8, 38, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <TrendingUp size={24} style={{ color: '#4bc0c0' }} />
                      <h3 style={{ margin: 0 }}>Demand & Churn Velocity</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                      Estimated weekly consumption rates synthesized from wholesale approvals and parlour sales logs.
                    </p>
                    {(() => {
                      const completedTubsCount = orders.filter(o => ['delivered', 'completed'].includes(o.status)).reduce((sum, o) => sum + (o.order_items?.reduce((a, b) => a + b.quantity, 0) || 0), 0);
                      const activeTubsCount = orders.filter(o => ['accepted', 'preparing', 'dispatched'].includes(o.status)).reduce((sum, o) => sum + (o.order_items?.reduce((a, b) => a + b.quantity, 0) || 0), 0);
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                            <span>Cumulative Sales (Delivered):</span>
                            <strong>{completedTubsCount} Tubs</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                            <span>Active Churn in Progress:</span>
                            <strong style={{ color: 'var(--gold-light)' }}>{activeTubsCount} Tubs</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Overall Inventory Health:</span>
                            <strong style={{ color: stats.inventoryHealthPct > 80 ? '#4bc0c0' : 'var(--gold)' }}>{stats.inventoryHealthPct}%</strong>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>

                {/* DESKTOP TABLE VIEW */}
                <div className="admin-table-container desktop-only">
                  <h3 style={{ marginBottom: '16px', color: 'var(--gold)' }}>Production Recommendations</h3>
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Flavor Name</th>
                        <th>Current Available</th>
                        <th>Pending Wholesale Demand</th>
                        <th>Parlour Low-Stock Shortfalls</th>
                        <th>Proactive Churn Recommendation</th>
                        <th style={{ textAlign: 'center' }}>Production Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flavors.map(flavor => {
                        const flavorBatches = batches.filter(b => b.flavor_id === flavor.id);
                        const available = flavorBatches.reduce((sum, b) => sum + (b.status === 'active' ? b.stock_remaining : 0), 0);
                        
                        // Calculate pending demand
                        let pendingDemand = 0;
                        orders.forEach(o => {
                          if (['submitted', 'pending', 'accepted', 'preparing'].includes(o.status)) {
                            const item = o.order_items?.find(i => i.flavor_id === flavor.id);
                            if (item) pendingDemand += item.quantity;
                          }
                        });

                        // Calculate parlour shortfall (parlours below threshold of 5 tubs)
                        let parlourShortfall = 0;
                        locationStock.forEach(loc => {
                          if (loc.flavor_id === flavor.id && loc.stock_qty <= 5) {
                            parlourShortfall += (10 - loc.stock_qty); // target 10 tubs max stock replenishment recommendation
                          }
                        });

                        const totalDemand = pendingDemand + parlourShortfall;
                        const recommendedProduction = Math.max(20, totalDemand + (available <= 20 ? 30 : 0));
                        const needsProduction = available <= 20 || totalDemand > available;

                        return (
                          <tr key={flavor.id}>
                            <td><strong>{flavor.flavor_name}</strong></td>
                            <td>
                              <span style={{ color: available === 0 ? '#ef4444' : available <= 20 ? '#f59e0b' : '#4bc0c0', fontWeight: 'bold' }}>
                                {available} Tubs
                              </span>
                            </td>
                            <td>{pendingDemand} Tubs</td>
                            <td>{parlourShortfall} Tubs</td>
                            <td>
                              <strong style={{ color: needsProduction ? 'var(--gold)' : 'var(--text-muted)' }}>
                                {needsProduction ? `${recommendedProduction} Tubs (Suggested)` : 'Warehouse Sufficient'}
                              </strong>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button 
                                className={`btn ${needsProduction ? 'btn-primary' : 'btn-secondary'} btn-xs`}
                                onClick={() => handleOpenBatchModal({ flavor_id: flavor.id, quantity_received: recommendedProduction })}
                              >
                                Produce Batch
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="mobile-records-list mobile-only" style={{ marginTop: '16px' }}>
                  <h3 style={{ marginBottom: '16px', color: 'var(--gold)' }}>Production Recommendations</h3>
                  {flavors.map(flavor => {
                    const flavorBatches = batches.filter(b => b.flavor_id === flavor.id);
                    const available = flavorBatches.reduce((sum, b) => sum + (b.status === 'active' ? b.stock_remaining : 0), 0);
                    
                    // Calculate pending demand
                    let pendingDemand = 0;
                    orders.forEach(o => {
                      if (['submitted', 'pending', 'accepted', 'preparing'].includes(o.status)) {
                        const item = o.order_items?.find(i => i.flavor_id === flavor.id);
                        if (item) pendingDemand += item.quantity;
                      }
                    });

                    // Calculate parlour shortfall
                    let parlourShortfall = 0;
                    locationStock.forEach(loc => {
                      if (loc.flavor_id === flavor.id && loc.stock_qty <= 5) {
                        parlourShortfall += (10 - loc.stock_qty);
                      }
                    });

                    const totalDemand = pendingDemand + parlourShortfall;
                    const recommendedProduction = Math.max(20, totalDemand + (available <= 20 ? 30 : 0));
                    const needsProduction = available <= 20 || totalDemand > available;
                    const isExpanded = !!expandedProductionRecommendIds[flavor.id];

                    return (
                      <div key={flavor.id} className="mobile-record-card">
                        <div className="mobile-card-header" onClick={() => toggleProductionRecommendExpand(flavor.id)}>
                          <div className="mobile-card-title-wrap">
                            <h3 className="mobile-card-title">{flavor.flavor_name}</h3>
                          </div>
                          <div className="mobile-card-header-right">
                            <span style={{ color: available === 0 ? '#ef4444' : available <= 20 ? '#f59e0b' : '#4bc0c0', fontWeight: 'bold' }}>
                              {available} Tubs
                            </span>
                            <ChevronDown className={`expand-chevron ${isExpanded ? 'rotated' : ''}`} size={16} />
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mobile-card-details-expanded">
                            <div className="detail-row">
                              <span className="label">Pending Demand:</span>
                              <span className="val">{pendingDemand} Tubs</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Parlour Shortfall:</span>
                              <span className="val">{parlourShortfall} Tubs</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Recommendation:</span>
                              <span className="val" style={{ color: needsProduction ? 'var(--gold)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                                {needsProduction ? `${recommendedProduction} Tubs (Suggested)` : 'Warehouse Sufficient'}
                              </span>
                            </div>

                            <div className="mobile-card-actions-wrapper">
                              <button 
                                className={`btn ${needsProduction ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                onClick={() => handleOpenBatchModal({ flavor_id: flavor.id, quantity_received: recommendedProduction })}
                              >
                                Produce Batch
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* SUBTAB 4: WAREHOUSE AUDIT TRAIL (STOCK MOVEMENTS) */}
            {selectedInventoryCenterSubTab === 'movements' && (
              <div className="warehouse-audit-trail-view fade-in-up">
                <div className="tab-actions-row" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '16px' }}>
                  <div className="search-box inline-search">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search movements..."
                    />
                  </div>
                </div>

                {/* DESKTOP TABLE VIEW */}
                <div className="admin-table-container desktop-only">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Flavor Name</th>
                        <th>Batch Code</th>
                        <th>Store Location</th>
                        <th>Transaction Qty</th>
                        <th>Adjustment Type</th>
                        <th>Reference Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filteredMovements = movements.filter(mov => {
                          const matchesSearch = mov.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            mov.flavors?.flavor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            mov.batches?.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            mov.shops?.shop_name?.toLowerCase().includes(searchQuery.toLowerCase());
                          return matchesSearch;
                        });

                        if (filteredMovements.length === 0) {
                          return (
                            <tr>
                              <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No stock movements logged in the audit trail.
                              </td>
                            </tr>
                          );
                        }

                        return filteredMovements.map(mov => (
                          <tr key={mov.id}>
                            <td>{formatDate(mov.created_at)}</td>
                            <td><strong style={{ color: 'var(--gold-light)' }}>{mov.flavors?.flavor_name}</strong></td>
                            <td><code className="batch-code-tag">{mov.batches?.batch_number}</code></td>
                            <td>{mov.shops?.shop_name || 'Central Warehouse'}</td>
                            <td>
                              <strong style={{ color: mov.quantity > 0 ? '#4bc0c0' : 'var(--accent)' }}>
                                {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} Tubs
                              </strong>
                            </td>
                            <td>
                              <span className={`status-dot-pill ${mov.type === 'delivered' ? 'active' : mov.type === 'dispatched' ? 'warning-orange' : 'inactive'}`}>
                                {mov.type.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{mov.notes}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="mobile-records-list mobile-only">
                  {(() => {
                    const filteredMovements = movements.filter(mov => {
                      const matchesSearch = mov.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        mov.flavors?.flavor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        mov.batches?.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        mov.shops?.shop_name?.toLowerCase().includes(searchQuery.toLowerCase());
                      return matchesSearch;
                    });

                    if (filteredMovements.length === 0) {
                      return (
                        <div className="mobile-empty-state">
                          No stock movements logged in the audit trail.
                        </div>
                      );
                    }

                    return filteredMovements.map(mov => {
                      const isExpanded = !!expandedStockMovementIds[mov.id];
                      return (
                        <div key={mov.id} className="mobile-record-card">
                          <div className="mobile-card-header" onClick={() => toggleStockMovementExpand(mov.id)}>
                            <div className="mobile-card-title-wrap">
                              <h3 className="mobile-card-title">{mov.flavors?.flavor_name}</h3>
                              <span className="time" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {formatDate(mov.created_at).split(',')[0]}
                              </span>
                            </div>
                            <div className="mobile-card-header-right">
                              <strong style={{ color: mov.quantity > 0 ? '#4bc0c0' : 'var(--accent)' }}>
                                {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} Tubs
                              </strong>
                              <ChevronDown className={`expand-chevron ${isExpanded ? 'rotated' : ''}`} size={16} />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mobile-card-details-expanded">
                              <div className="detail-row">
                                <span className="label">Date & Time:</span>
                                <span className="val">{formatDate(mov.created_at)}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Batch Code:</span>
                                <span className="val"><code className="batch-code-tag">{mov.batches?.batch_number}</code></span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Location:</span>
                                <span className="val">{mov.shops?.shop_name || 'Central Warehouse'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="label">Adjustment Type:</span>
                                <span className="val">
                                  <span className={`status-dot-pill ${mov.type === 'delivered' ? 'active' : mov.type === 'dispatched' ? 'warning-orange' : 'inactive'}`}>
                                    {mov.type.toUpperCase()}
                                  </span>
                                </span>
                              </div>
                              <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                <span className="label">Reference Notes:</span>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{mov.notes || 'No description provided.'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

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
                <div className="select-wrapper">
                  <Filter size={14} className="filter-icon" />
                  <select value={locationStockFilter} onChange={(e) => setLocationStockFilter(e.target.value)}>
                    <option value="All">All Stock Levels</option>
                    <option value="low_stock">{'Needs Reorder (<= 5 Tubs)'}</option>
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

            {/* DESKTOP TABLE VIEW */}
            <div className="admin-table-container desktop-only">
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

            {/* MOBILE CARD VIEW */}
            <div className="mobile-records-list mobile-only">
              {filteredLocationStock.length === 0 ? (
                <div className="mobile-empty-state">
                  No store stock records found. Stock is added here when orders are marked "DELIVERED".
                </div>
              ) : (
                filteredLocationStock.map(loc => {
                  const expiry = loc.batches ? new Date(loc.batches.expiry_date) : null;
                  const diffDays = expiry ? Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)) : null;
                  const isExpanded = !!expandedParlourStockIds[loc.id];

                  return (
                    <div key={loc.id} className="mobile-record-card">
                      <div className="mobile-card-header" onClick={() => toggleParlourStockExpand(loc.id)}>
                        <div className="mobile-card-title-wrap">
                          <span className="shop-code-badge">{loc.shops?.shop_code}</span>
                          <h3 className="mobile-card-title">{loc.shops?.shop_name}</h3>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>{loc.flavors?.flavor_name}</div>
                        </div>
                        <div className="mobile-card-header-right">
                          <strong style={{ color: 'var(--gold)' }}>{loc.stock_qty} Tubs</strong>
                          <ChevronDown className={`expand-chevron ${isExpanded ? 'rotated' : ''}`} size={16} />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mobile-card-details-expanded">
                          <div className="detail-row">
                            <span className="label">Flavor Name:</span>
                            <span className="val">{loc.flavors?.flavor_name} ({loc.flavors?.category})</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Batch #:</span>
                            <span className="val"><code className="batch-code-tag">{loc.batches?.batch_number || 'Unknown'}</code></span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Expiry Date:</span>
                            <span className={`val ${diffDays && diffDays <= 10 ? 'date-critical' : ''}`}>
                              {loc.batches ? formatDate(loc.batches.expiry_date).split(',')[0] : 'N/A'}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Last Updated:</span>
                            <span className="val">{formatDate(loc.last_updated)}</span>
                          </div>

                          <div className="mobile-card-actions-wrapper">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenAdjustStoreStockModal(loc)}>
                              Deduct / Adjust
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenReturnStockModal(loc)}>
                              Return Stock
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TABS 4: ANALYTICS HUB */}
        {activeTab === 'analytics' && (
          <div className="analytics-hub-tab fade-in-up">
            <div className="tab-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Business Intelligence & Analytics Hub</h2>
            </div>

            {/* Sub navigation */}
            <div className="sub-tabs-nav" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(212, 175, 55, 0.15)', marginBottom: '20px', paddingBottom: '10px' }}>
              <button 
                className={`sub-tab-btn ${selectedAnalyticsSubTab === 'performance' ? 'active' : ''}`}
                onClick={() => setSelectedAnalyticsSubTab('performance')}
                style={{
                  background: selectedAnalyticsSubTab === 'performance' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: selectedAnalyticsSubTab === 'performance' ? 'var(--gold)' : 'transparent',
                  color: selectedAnalyticsSubTab === 'performance' ? 'var(--gold)' : 'var(--text-muted)',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Partner Performance
              </button>
              <button 
                className={`sub-tab-btn ${selectedAnalyticsSubTab === 'flavors' ? 'active' : ''}`}
                onClick={() => setSelectedAnalyticsSubTab('flavors')}
                style={{
                  background: selectedAnalyticsSubTab === 'flavors' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: selectedAnalyticsSubTab === 'flavors' ? 'var(--gold)' : 'transparent',
                  color: selectedAnalyticsSubTab === 'flavors' ? 'var(--gold)' : 'var(--text-muted)',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Flavor Velocity & Sales
              </button>
              <button 
                className={`sub-tab-btn ${selectedAnalyticsSubTab === 'health' ? 'active' : ''}`}
                onClick={() => setSelectedAnalyticsSubTab('health')}
                style={{
                  background: selectedAnalyticsSubTab === 'health' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: selectedAnalyticsSubTab === 'health' ? 'var(--gold)' : 'transparent',
                  color: selectedAnalyticsSubTab === 'health' ? 'var(--gold)' : 'var(--text-muted)',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Inventory Health Overview
              </button>
            </div>

            {/* SUBTAB 1: PARTNER PERFORMANCE */}
            {selectedAnalyticsSubTab === 'performance' && (
              <div className="partner-analytics-view fade-in-up">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  
                  {/* Top Ordering Parlours */}
                  <div className="analytics-card" style={{ background: 'rgba(28, 8, 38, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ color: 'var(--gold)', marginBottom: '16px' }}>Top Ordering Parlours</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(() => {
                        const shopStats = shops.map(shop => {
                          const shopOrders = orders.filter(o => o.shop_id === shop.id && ['delivered', 'completed'].includes(o.status));
                          const totalTubs = shopOrders.reduce((sum, o) => sum + (o.order_items?.reduce((a, b) => a + b.quantity, 0) || 0), 0);
                          const avgOrderSize = shopOrders.length > 0 ? Math.round(totalTubs / shopOrders.length) : 0;
                          return { shop, totalTubs, avgOrderSize, orderCount: shopOrders.length };
                        }).sort((a, b) => b.totalTubs - a.totalTubs);

                        return shopStats.slice(0, 3).map((stat, idx) => (
                          <div key={stat.shop.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                            <div>
                              <strong style={{ color: '#fff' }}>#{idx+1} {stat.shop.shop_name}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.shop.location}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong style={{ color: '#4bc0c0' }}>{stat.totalTubs} Tubs</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.orderCount} restocks</div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Least Active Parlours */}
                  <div className="analytics-card" style={{ background: 'rgba(28, 8, 38, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Least Active Parlours</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(() => {
                        const shopStats = shops.map(shop => {
                          const shopOrders = orders.filter(o => o.shop_id === shop.id && ['delivered', 'completed'].includes(o.status));
                          const totalTubs = shopOrders.reduce((sum, o) => sum + (o.order_items?.reduce((a, b) => a + b.quantity, 0) || 0), 0);
                          return { shop, totalTubs, orderCount: shopOrders.length };
                        }).sort((a, b) => a.totalTubs - b.totalTubs);

                        return shopStats.slice(0, 3).map((stat, idx) => (
                          <div key={stat.shop.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                            <div>
                              <strong style={{ color: '#fff' }}>{stat.shop.shop_name}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {stat.shop.shop_code}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong style={{ color: 'var(--accent)' }}>{stat.totalTubs} Tubs</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.orderCount} orders</div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Restock Frequency & Volume */}
                  <div className="analytics-card" style={{ background: 'rgba(28, 8, 38, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ color: 'var(--gold-light)', marginBottom: '16px' }}>Volume Statistics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {(() => {
                        const totalCompletedOrders = orders.filter(o => ['delivered', 'completed'].includes(o.status));
                        const totalCompletedTubs = totalCompletedOrders.reduce((sum, o) => sum + (o.order_items?.reduce((a, b) => a + b.quantity, 0) || 0), 0);
                        const overallAvgOrder = totalCompletedOrders.length > 0 ? Math.round(totalCompletedTubs / totalCompletedOrders.length) : 0;
                        return (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Total Tubs Ordered:</span>
                              <strong>{totalCompletedTubs} Tubs</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Average Order Size:</span>
                              <strong>{overallAvgOrder} Tubs</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Active Parlours:</span>
                              <strong>{shops.filter(s => s.active).length} Shops</strong>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SUBTAB 2: FLAVOR VELOCITY & SALES */}
            {selectedAnalyticsSubTab === 'flavors' && (
              <div className="flavor-analytics-view fade-in-up">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                  
                  {/* Best Selling Flavor */}
                  <div className="metric-box" style={{ background: 'rgba(28, 8, 38, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Best Selling Flavor</div>
                    {(() => {
                      const sales = flavors.map(flavor => {
                        const total = orders.filter(o => ['delivered', 'completed'].includes(o.status))
                          .reduce((sum, o) => sum + (o.order_items?.filter(i => i.flavor_id === flavor.id).reduce((a, b) => a + b.quantity, 0) || 0), 0);
                        return { flavor, total };
                      }).sort((a, b) => b.total - a.total);

                      if (sales.length === 0 || sales[0].total === 0) return <strong>None yet</strong>;
                      return (
                        <>
                          <div style={{ fontSize: '1.4rem', color: 'var(--gold)', fontWeight: 'bold' }}>{sales[0].flavor.flavor_name}</div>
                          <span style={{ color: '#4bc0c0' }}>{sales[0].total} Tubs Ordered</span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Dormant / Low Demand */}
                  <div className="metric-box" style={{ background: 'rgba(28, 8, 38, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Dormant / Low Demand</div>
                    {(() => {
                      const sales = flavors.map(flavor => {
                        const total = orders.filter(o => ['delivered', 'completed'].includes(o.status))
                          .reduce((sum, o) => sum + (o.order_items?.filter(i => i.flavor_id === flavor.id).reduce((a, b) => a + b.quantity, 0) || 0), 0);
                        return { flavor, total };
                      }).sort((a, b) => a.total - b.total);

                      if (sales.length === 0) return <strong>None</strong>;
                      return (
                        <>
                          <div style={{ fontSize: '1.4rem', color: 'var(--accent)', fontWeight: 'bold' }}>{sales[0].flavor.flavor_name}</div>
                          <span style={{ color: 'var(--text-muted)' }}>{sales[0].total} Tubs Ordered</span>
                        </>
                      );
                    })()}
                  </div>

                  {/* Overstocked Flavor */}
                  <div className="metric-box" style={{ background: 'rgba(28, 8, 38, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Overstocked (Warehouse)</div>
                    {(() => {
                      const stockStats = getFlavorInventoryStats().sort((a, b) => b.available - a.available);
                      if (stockStats.length === 0 || stockStats[0].available === 0) return <strong>None</strong>;
                      return (
                        <>
                          <div style={{ fontSize: '1.4rem', color: 'var(--gold-light)', fontWeight: 'bold' }}>{stockStats[0].flavor.flavor_name}</div>
                          <span style={{ color: '#4bc0c0' }}>{stockStats[0].available} Tubs available</span>
                        </>
                      );
                    })()}
                  </div>

                </div>

                {/* DESKTOP TABLE VIEW */}
                <div className="admin-table-container desktop-only">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Flavor</th>
                        <th>Category</th>
                        <th>Total Volume Ordered</th>
                        <th>Warehouse On Hand</th>
                        <th>Reserved Stock</th>
                        <th>Sales Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flavors.map(flavor => {
                        const totalOrdered = orders.filter(o => ['delivered', 'completed'].includes(o.status))
                          .reduce((sum, o) => sum + (o.order_items?.filter(i => i.flavor_id === flavor.id).reduce((a, b) => a + b.quantity, 0) || 0), 0);
                        
                        const stats = getFlavorInventoryStats().find(s => s.flavor.id === flavor.id) || { available: 0, reserved: 0 };
                        let label = 'Steady';
                        if (totalOrdered >= 50) label = 'Best Seller';
                        else if (totalOrdered === 0) label = 'Dormant';
                        else if (stats.available > 100) label = 'Overstocked';

                        return (
                          <tr key={flavor.id}>
                            <td><strong>{flavor.flavor_name}</strong></td>
                            <td>{flavor.category}</td>
                            <td><strong>{totalOrdered} Tubs</strong></td>
                            <td>{stats.available} Tubs</td>
                            <td>{stats.reserved} Tubs</td>
                            <td>
                              <span className={`status-dot-pill ${label === 'Best Seller' ? 'active' : label === 'Dormant' ? 'inactive' : 'warning'}`}>
                                {label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="mobile-records-list mobile-only" style={{ marginTop: '16px' }}>
                  {flavors.map(flavor => {
                    const totalOrdered = orders.filter(o => ['delivered', 'completed'].includes(o.status))
                      .reduce((sum, o) => sum + (o.order_items?.filter(i => i.flavor_id === flavor.id).reduce((a, b) => a + b.quantity, 0) || 0), 0);
                    
                    const stats = getFlavorInventoryStats().find(s => s.flavor.id === flavor.id) || { available: 0, reserved: 0 };
                    let label = 'Steady';
                    if (totalOrdered >= 50) label = 'Best Seller';
                    else if (totalOrdered === 0) label = 'Dormant';
                    else if (stats.available > 100) label = 'Overstocked';

                    return (
                      <div key={flavor.id} className="mobile-record-card">
                        <div className="mobile-card-header" style={{ cursor: 'default' }}>
                          <div className="mobile-card-title-wrap">
                            <span className="category-badge">{flavor.category}</span>
                            <h3 className="mobile-card-title">{flavor.flavor_name}</h3>
                          </div>
                          <span className={`status-dot-pill ${label === 'Best Seller' ? 'active' : label === 'Dormant' ? 'inactive' : 'warning'}`}>
                            {label}
                          </span>
                        </div>
                        <div className="mobile-card-details-expanded" style={{ display: 'block', padding: '12px' }}>
                          <div className="detail-row">
                            <span className="label">Total Volume Ordered:</span>
                            <span className="val"><strong>{totalOrdered} Tubs</strong></span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Warehouse On Hand:</span>
                            <span className="val">{stats.available} Tubs</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Reserved Stock:</span>
                            <span className="val">{stats.reserved} Tubs</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* SUBTAB 3: INVENTORY HEALTH OVERVIEW */}
            {selectedAnalyticsSubTab === 'health' && (
              <div className="inventory-health-view fade-in-up" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                
                {/* Health Radial Gauge */}
                <div style={{ background: 'rgba(28, 8, 38, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '8px', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <h3 style={{ color: 'var(--gold)', marginBottom: '20px' }}>Warehouse Health Index</h3>
                  <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '8px solid rgba(212, 175, 55, 0.15)', borderTopColor: 'var(--gold)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{stats.inventoryHealthPct}%</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Calculated as the percentage of flavors in the warehouse maintaining a stock count above the safety threshold (20 tubs).
                  </p>
                </div>

                {/* Health Index Breakdown */}
                <div style={{ background: 'rgba(28, 8, 38, 0.4)', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '8px', padding: '24px' }}>
                  <h3 style={{ color: 'var(--gold-light)', marginBottom: '16px' }}>Stock Health Breakdown</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(() => {
                      const totalFlavors = flavors.length || 1;
                      const statsList = getFlavorInventoryStats();
                      const healthyCount = statsList.filter(f => f.available > 20).length;
                      const lowStockCount = statsList.filter(f => f.available > 0 && f.available <= 20).length;
                      const outCount = statsList.filter(f => f.available === 0).length;

                      const healthyPct = Math.round((healthyCount / totalFlavors) * 100);
                      const lowPct = Math.round((lowStockCount / totalFlavors) * 100);
                      const outPct = Math.round((outCount / totalFlavors) * 100);

                      return (
                        <>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span>Healthy Flavors (&gt; 20 tubs):</span>
                              <strong>{healthyCount} / {totalFlavors} ({healthyPct}%)</strong>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ background: '#4bc0c0', width: `${healthyPct}%`, height: '100%' }}></div>
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span>Low Stock Flavors (&lt;= 20 tubs):</span>
                              <strong>{lowStockCount} / {totalFlavors} ({lowPct}%)</strong>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ background: '#f59e0b', width: `${lowPct}%`, height: '100%' }}></div>
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span>Out of Stock (0 tubs):</span>
                              <strong>{outCount} / {totalFlavors} ({outPct}%)</strong>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ background: '#ef4444', width: `${outPct}%`, height: '100%' }}></div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

              </div>
            )}

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
              <h3>Adjust Stock: {adjustStockForm.flavor_name} ({adjustStockForm.batch_number})</h3>
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
