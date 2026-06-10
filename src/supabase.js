import { createClient } from '@supabase/supabase-js';
import { flavors as FLAVOR_LIST } from './data/flavorData';

// Get Supabase keys from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Detect if we have real Supabase keys configured
export const isUsingRealSupabase =
  supabaseUrl &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

// Initialize real Supabase client if keys are provided
export const supabase = isUsingRealSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// HIGH-FIDELITY LOCAL DATABASE MOCK FALLBACK
// ==========================================

const BROADCAST_CHANNEL_NAME = 'nyathiyas_supabase_mock_realtime';
const broadcastChannel = typeof window !== 'undefined' ? new BroadcastChannel(BROADCAST_CHANNEL_NAME) : null;

// Initial Seeds
const DEFAULT_SHOPS = [
  {
    id: 'shop-colaba-uuid-1111',
    shop_code: 'SH-COL-01',
    shop_name: 'Nyathiyas Colaba Parlour',
    store_location: 'Sirsi, Karnataka 581401',
    owner_name: 'Nitesh Netravali',
    phone: '9380992619',
    email: 'colaba@nyathiyas.com',
    partner_code: 'NYA-COL-1860',
    route_slug: 'colaba',
    profile_image: '',
    store_banner: '',
    bio: 'Gourmet heritage parlour in the heart of Colaba.',
    secondary_phone: '+91 99999 88888',
    active: true,
    created_at: new Date('2026-05-01T10:00:00Z').toISOString()
  },
  {
    id: 'shop-bandra-uuid-2222',
    shop_code: 'SH-BAND-02',
    shop_name: 'Nyathiyas Bandra Premium',
    store_location: 'Sirsi, Karnataka 581401',
    owner_name: 'Nitesh Netravali',
    phone: '9380992619',
    email: 'bandra@nyathiyas.com',
    partner_code: 'NYA-BAN-1995',
    route_slug: 'bandra',
    profile_image: '',
    store_banner: '',
    bio: 'Sleek modern experience overlooking Bandstand, Bandra.',
    secondary_phone: '',
    active: true,
    created_at: new Date('2026-05-02T11:00:00Z').toISOString()
  },
  {
    id: 'shop-juhu-uuid-3333',
    shop_code: 'SH-JHU-03',
    shop_name: 'Nyathiyas Juhu Beach Lounge',
    store_location: 'Sirsi, Karnataka 581401',
    owner_name: 'Nitesh Netravali',
    phone: '9380992619',
    email: 'juhu@nyathiyas.com',
    partner_code: 'NYA-JUH-2024',
    route_slug: 'juhu',
    profile_image: '',
    store_banner: '',
    bio: 'Breezy coastal branch at Juhu Beach.',
    secondary_phone: '',
    active: true,
    created_at: new Date('2026-05-03T12:00:00Z').toISOString()
  }
];

const DEFAULT_FLAVORS = FLAVOR_LIST;

const DEFAULT_USERS = [
  {
    id: 'auth-user-admin',
    email: 'admin@nyathiyas.com',
    password: 'password',
    role: 'admin',
    display_name: 'Nyathiyas Admin Master',
    shop_id: null
  },
  {
    id: 'auth-user-colaba',
    email: 'colaba@nyathiyas.com',
    password: 'password',
    role: 'shopkeeper',
    display_name: 'Colaba Parlour Manager',
    shop_id: 'shop-colaba-uuid-1111'
  },
  {
    id: 'auth-user-bandra',
    email: 'bandra@nyathiyas.com',
    password: 'password',
    role: 'shopkeeper',
    display_name: 'Bandra Premium Manager',
    shop_id: 'shop-bandra-uuid-2222'
  },
  {
    id: 'auth-user-juhu',
    email: 'juhu@nyathiyas.com',
    password: 'password',
    role: 'shopkeeper',
    display_name: 'Juhu Beach Manager',
    shop_id: 'shop-juhu-uuid-3333'
  }
];

const DEFAULT_ORDERS = [
  {
    id: 'order-1001-uuid',
    shop_id: 'shop-colaba-uuid-1111',
    order_number: 'NY-1001',
    status: 'delivered',
    notes: 'Please ensure cold packaging is double insulated.',
    created_at: new Date('2026-05-20T14:30:00Z').toISOString(),
    updated_at: new Date('2026-05-20T18:00:00Z').toISOString()
  },
  {
    id: 'order-1002-uuid',
    shop_id: 'shop-bandra-uuid-2222',
    order_number: 'NY-1002',
    status: 'preparing',
    notes: 'Urgent weekend restocking.',
    created_at: new Date('2026-05-21T09:15:00Z').toISOString(),
    updated_at: new Date('2026-05-21T09:30:00Z').toISOString()
  },
  {
    id: 'order-1003-uuid',
    shop_id: 'shop-colaba-uuid-1111',
    order_number: 'NY-1003',
    status: 'pending',
    notes: '',
    created_at: new Date('2026-05-22T01:10:00Z').toISOString(),
    updated_at: new Date('2026-05-22T01:10:00Z').toISOString()
  }
];

const DEFAULT_ORDER_ITEMS = [
  {
    id: 'item-1',
    order_id: 'order-1001-uuid',
    flavor_id: 'flavor-belgian-biscoff',
    quantity: 20,
    allocations: [{ batch_id: 'batch-bis-1', batch_number: 'B-BIS-001', quantity: 20 }]
  },
  {
    id: 'item-2',
    order_id: 'order-1001-uuid',
    flavor_id: 'flavor-mango',
    quantity: 15,
    allocations: [{ batch_id: 'batch-mng-1', batch_number: 'B-MNG-001', quantity: 15 }]
  },
  {
    id: 'item-3',
    order_id: 'order-1002-uuid',
    flavor_id: 'flavor-avocado',
    quantity: 30,
    allocations: [
      { batch_id: 'batch-avo-1', batch_number: 'B-AVO-001', quantity: 10 },
      { batch_id: 'batch-avo-2', batch_number: 'B-AVO-002', quantity: 20 }
    ]
  },
  {
    id: 'item-4',
    order_id: 'order-1002-uuid',
    flavor_id: 'flavor-chilly-guava',
    quantity: 10,
    allocations: [{ batch_id: 'batch-cg-1', batch_number: 'B-CG-001', quantity: 10 }]
  },
  {
    id: 'item-5',
    order_id: 'order-1002-uuid',
    flavor_id: 'flavor-red-fig',
    quantity: 15,
    allocations: [{ batch_id: 'batch-fig-1', batch_number: 'B-FIG-001', quantity: 15 }]
  },
  {
    id: 'item-6',
    order_id: 'order-1003-uuid',
    flavor_id: 'flavor-belgian-biscoff',
    quantity: 10,
    allocations: [{ batch_id: 'batch-bis-1', batch_number: 'B-BIS-001', quantity: 10 }]
  },
  {
    id: 'item-7',
    order_id: 'order-1003-uuid',
    flavor_id: 'flavor-tender-coconut',
    quantity: 25,
    allocations: [{ batch_id: 'batch-coc-1', batch_number: 'B-COC-001', quantity: 25 }]
  }
];

const DEFAULT_ORDER_HISTORY = [
  { id: 'h-1', order_id: 'order-1001-uuid', status: 'pending', changed_by: 'auth-user-colaba', changed_at: new Date('2026-05-20T14:30:00Z').toISOString() },
  { id: 'h-2', order_id: 'order-1001-uuid', status: 'accepted', changed_by: 'auth-user-admin', changed_at: new Date('2026-05-20T15:00:00Z').toISOString() },
  { id: 'h-3', order_id: 'order-1001-uuid', status: 'preparing', changed_by: 'auth-user-admin', changed_at: new Date('2026-05-20T15:15:00Z').toISOString() },
  { id: 'h-4', order_id: 'order-1001-uuid', status: 'dispatched', changed_by: 'auth-user-admin', changed_at: new Date('2026-05-20T17:00:00Z').toISOString() },
  { id: 'h-5', order_id: 'order-1001-uuid', status: 'delivered', changed_by: 'auth-user-admin', changed_at: new Date('2026-05-20T18:00:00Z').toISOString() },
  { id: 'h-6', order_id: 'order-1002-uuid', status: 'pending', changed_by: 'auth-user-bandra', changed_at: new Date('2026-05-21T09:15:00Z').toISOString() },
  { id: 'h-7', order_id: 'order-1002-uuid', status: 'accepted', changed_by: 'auth-user-admin', changed_at: new Date('2026-05-21T09:25:00Z').toISOString() },
  { id: 'h-8', order_id: 'order-1002-uuid', status: 'preparing', changed_by: 'auth-user-admin', changed_at: new Date('2026-05-21T09:30:00Z').toISOString() },
  { id: 'h-9', order_id: 'order-1003-uuid', status: 'pending', changed_by: 'auth-user-colaba', changed_at: new Date('2026-05-22T01:10:00Z').toISOString() }
];

const DEFAULT_BATCHES = [
  {
    id: 'batch-mng-1',
    batch_number: 'B-MNG-001',
    flavor_id: 'flavor-mango',
    manufactured_date: '2026-05-10T00:00:00Z',
    expiry_date: '2026-06-18T00:00:00Z', // Expiring soon
    quantity_received: 150,
    stock_on_hand: 80,
    stock_allocated: 0,
    stock_remaining: 80,
    unit: 'Tub (5L)',
    min_order_qty: 5,
    reorder_point: 40,
    status: 'active'
  },
  {
    id: 'batch-mng-2',
    batch_number: 'B-MNG-002',
    flavor_id: 'flavor-mango',
    manufactured_date: '2026-05-20T00:00:00Z',
    expiry_date: '2026-07-25T00:00:00Z',
    quantity_received: 200,
    stock_on_hand: 200,
    stock_allocated: 0,
    stock_remaining: 200,
    unit: 'Tub (5L)',
    min_order_qty: 5,
    reorder_point: 40,
    status: 'active'
  },
  {
    id: 'batch-avo-1',
    batch_number: 'B-AVO-001',
    flavor_id: 'flavor-avocado',
    manufactured_date: '2026-05-12T00:00:00Z',
    expiry_date: '2026-06-15T00:00:00Z', // Expiring extremely soon
    quantity_received: 80,
    stock_on_hand: 12,
    stock_allocated: 10, // allocated to Order 1002
    stock_remaining: 2,
    unit: 'Tub (5L)',
    min_order_qty: 5,
    reorder_point: 20,
    status: 'active'
  },
  {
    id: 'batch-avo-2',
    batch_number: 'B-AVO-002',
    flavor_id: 'flavor-avocado',
    manufactured_date: '2026-05-25T00:00:00Z',
    expiry_date: '2026-08-10T00:00:00Z',
    quantity_received: 100,
    stock_on_hand: 100,
    stock_allocated: 20, // allocated to Order 1002
    stock_remaining: 80,
    unit: 'Tub (5L)',
    min_order_qty: 5,
    reorder_point: 20,
    status: 'active'
  },
  {
    id: 'batch-bis-1',
    batch_number: 'B-BIS-001',
    flavor_id: 'flavor-belgian-biscoff',
    manufactured_date: '2026-05-08T00:00:00Z',
    expiry_date: '2026-06-28T00:00:00Z',
    quantity_received: 120,
    stock_on_hand: 18,
    stock_allocated: 10, // allocated to Order 1003
    stock_remaining: 8,
    unit: 'Tub (5L)',
    min_order_qty: 5,
    reorder_point: 25, // Low Stock!
    status: 'active'
  },
  {
    id: 'batch-coc-1',
    batch_number: 'B-COC-001',
    flavor_id: 'flavor-tender-coconut',
    manufactured_date: '2026-05-15T00:00:00Z',
    expiry_date: '2026-07-15T00:00:00Z',
    quantity_received: 150,
    stock_on_hand: 25,
    stock_allocated: 25, // allocated to Order 1003
    stock_remaining: 0,
    unit: 'Tub (5L)',
    min_order_qty: 5,
    reorder_point: 30, // Low Stock!
    status: 'active'
  },
  {
    id: 'batch-cg-1',
    batch_number: 'B-CG-001',
    flavor_id: 'flavor-chilly-guava',
    manufactured_date: '2026-05-10T00:00:00Z',
    expiry_date: '2026-06-25T00:00:00Z',
    quantity_received: 80,
    stock_on_hand: 15,
    stock_allocated: 10, // allocated to Order 1002
    stock_remaining: 5,
    unit: 'Tub (5L)',
    min_order_qty: 5,
    reorder_point: 20, // Low Stock!
    status: 'active'
  },
  {
    id: 'batch-fig-1',
    batch_number: 'B-FIG-001',
    flavor_id: 'flavor-red-fig',
    manufactured_date: '2026-05-09T00:00:00Z',
    expiry_date: '2026-06-22T00:00:00Z',
    quantity_received: 60,
    stock_on_hand: 15,
    stock_allocated: 15, // allocated to Order 1002
    stock_remaining: 0,
    unit: 'Tub (5L)',
    min_order_qty: 5,
    reorder_point: 20, // Low Stock!
    status: 'active'
  },
  {
    id: 'batch-wtm-1',
    batch_number: 'B-WTM-001',
    flavor_id: 'flavor-watermelon',
    manufactured_date: '2026-05-10T00:00:00Z',
    expiry_date: '2026-06-16T00:00:00Z', // Expiring soon
    quantity_received: 50,
    stock_on_hand: 8,
    stock_allocated: 0,
    stock_remaining: 8,
    unit: 'Tub (5L)',
    min_order_qty: 5,
    reorder_point: 15, // Low Stock!
    status: 'active'
  }
];

const DEFAULT_STOCK_BY_LOCATION = [
  {
    id: 'loc-1',
    shop_id: 'shop-colaba-uuid-1111',
    flavor_id: 'flavor-belgian-biscoff',
    batch_id: 'batch-bis-1',
    stock_qty: 20, // Delivered from Order NY-1001
    last_updated: '2026-05-20T18:00:00Z'
  },
  {
    id: 'loc-2',
    shop_id: 'shop-colaba-uuid-1111',
    flavor_id: 'flavor-mango',
    batch_id: 'batch-mng-1',
    stock_qty: 15, // Delivered from Order NY-1001
    last_updated: '2026-05-20T18:00:00Z'
  },
  {
    id: 'loc-3',
    shop_id: 'shop-bandra-uuid-2222',
    flavor_id: 'flavor-mango',
    batch_id: 'batch-mng-1',
    stock_qty: 10,
    last_updated: '2026-05-18T12:00:00Z'
  }
];

const DEFAULT_STOCK_MOVEMENTS = [
  {
    id: 'move-1',
    flavor_id: 'flavor-mango',
    batch_id: 'batch-mng-1',
    shop_id: null,
    quantity: 150,
    type: 'received',
    notes: 'Initial production batch received at master warehouse',
    created_at: '2026-05-10T08:00:00Z'
  },
  {
    id: 'move-2',
    flavor_id: 'flavor-mango',
    batch_id: 'batch-mng-1',
    shop_id: 'shop-colaba-uuid-1111',
    quantity: -15,
    type: 'dispatched',
    notes: 'Dispatched from warehouse for Order NY-1001',
    created_at: '2026-05-20T17:00:00Z'
  },
  {
    id: 'move-3',
    flavor_id: 'flavor-mango',
    batch_id: 'batch-mng-1',
    shop_id: 'shop-colaba-uuid-1111',
    quantity: 15,
    type: 'delivered',
    notes: 'Delivered at Colaba Parlour for Order NY-1001',
    created_at: '2026-05-20T18:00:00Z'
  },
  {
    id: 'move-4',
    flavor_id: 'flavor-belgian-biscoff',
    batch_id: 'batch-bis-1',
    shop_id: null,
    quantity: 120,
    type: 'received',
    notes: 'Initial production batch received at master warehouse',
    created_at: '2026-05-08T09:00:00Z'
  },
  {
    id: 'move-5',
    flavor_id: 'flavor-belgian-biscoff',
    batch_id: 'batch-bis-1',
    shop_id: 'shop-colaba-uuid-1111',
    quantity: -20,
    type: 'dispatched',
    notes: 'Dispatched from warehouse for Order NY-1001',
    created_at: '2026-05-20T17:00:00Z'
  },
  {
    id: 'move-6',
    flavor_id: 'flavor-belgian-biscoff',
    batch_id: 'batch-bis-1',
    shop_id: 'shop-colaba-uuid-1111',
    quantity: 20,
    type: 'delivered',
    notes: 'Delivered at Colaba Parlour for Order NY-1001',
    created_at: '2026-05-20T18:00:00Z'
  }
];

// Helper to initialize and retrieve local storage database
const getLocalDB = () => {
  if (typeof window === 'undefined') return {};

  let db = {
    shops: JSON.parse(localStorage.getItem('nyathiyas_shops')),
    flavors: JSON.parse(localStorage.getItem('nyathiyas_flavors')),
    users: JSON.parse(localStorage.getItem('nyathiyas_users')),
    orders: JSON.parse(localStorage.getItem('nyathiyas_orders')),
    order_items: JSON.parse(localStorage.getItem('nyathiyas_order_items')),
    order_status_history: JSON.parse(localStorage.getItem('nyathiyas_order_history')),
    currentUser: JSON.parse(localStorage.getItem('nyathiyas_current_user')),
    batches: JSON.parse(localStorage.getItem('nyathiyas_batches')),
    stock_by_location: JSON.parse(localStorage.getItem('nyathiyas_stock_by_location')),
    stock_movements: JSON.parse(localStorage.getItem('nyathiyas_stock_movements'))
  };

  let initialized = false;

  const hasOldShops = db.shops && (
    db.shops.some(s => s.owner_name === 'Rajesh Sharma' || s.store_location.includes('Gateway')) ||
    db.shops.some(s => !s.hasOwnProperty('partner_code'))
  );
  if (!db.shops || hasOldShops) {
    localStorage.setItem('nyathiyas_shops', JSON.stringify(DEFAULT_SHOPS));
    db.shops = DEFAULT_SHOPS;
    localStorage.removeItem('nyathiyas_current_user');
    db.currentUser = null;
    initialized = true;
  }

  const hasOldFlavors = db.flavors && db.flavors.some(f => f.id === 'flavor-saffron-1');
  if (!db.flavors || hasOldFlavors) {
    localStorage.setItem('nyathiyas_flavors', JSON.stringify(DEFAULT_FLAVORS));
    db.flavors = DEFAULT_FLAVORS;
    localStorage.setItem('nyathiyas_order_items', JSON.stringify(DEFAULT_ORDER_ITEMS));
    db.order_items = DEFAULT_ORDER_ITEMS;
    initialized = true;
  }

  if (!db.users) { localStorage.setItem('nyathiyas_users', JSON.stringify(DEFAULT_USERS)); db.users = DEFAULT_USERS; initialized = true; }
  if (!db.orders) { localStorage.setItem('nyathiyas_orders', JSON.stringify(DEFAULT_ORDERS)); db.orders = DEFAULT_ORDERS; initialized = true; }
  if (!db.order_items && !initialized) { localStorage.setItem('nyathiyas_order_items', JSON.stringify(DEFAULT_ORDER_ITEMS)); db.order_items = DEFAULT_ORDER_ITEMS; initialized = true; }
  if (!db.order_status_history) { localStorage.setItem('nyathiyas_order_history', JSON.stringify(DEFAULT_ORDER_HISTORY)); db.order_status_history = DEFAULT_ORDER_HISTORY; initialized = true; }

  // New stock tracking tables
  if (!db.batches) {
    localStorage.setItem('nyathiyas_batches', JSON.stringify(DEFAULT_BATCHES));
    db.batches = DEFAULT_BATCHES;
    initialized = true;
  }
  if (!db.stock_by_location) {
    localStorage.setItem('nyathiyas_stock_by_location', JSON.stringify(DEFAULT_STOCK_BY_LOCATION));
    db.stock_by_location = DEFAULT_STOCK_BY_LOCATION;
    initialized = true;
  }
  if (!db.stock_movements) {
    localStorage.setItem('nyathiyas_stock_movements', JSON.stringify(DEFAULT_STOCK_MOVEMENTS));
    db.stock_movements = DEFAULT_STOCK_MOVEMENTS;
    initialized = true;
  }

  return db;
};

const saveLocalDB = (key, data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// ==========================================
// UNIFIED DATASERVICE API (SUPABASE OR MOCK)
// ==========================================

export const supabaseService = {
  // --- AUTH SERVICES ---

  // Sign In
  signIn: async (email, password) => {
    if (isUsingRealSupabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Get profile for role checking
      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*, shops(*)')
        .eq('id', data.user.id)
        .single();

      if (pError) throw pError;
      return { user: data.user, profile };
    } else {
      // Mock Auth Sign In
      const db = getLocalDB();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (!user) {
        throw new Error('Invalid email or password credentials.');
      }

      const sessionUser = {
        id: user.id,
        email: user.email,
        user_metadata: {
          display_name: user.display_name,
          role: user.role,
          shop_id: user.shop_id
        }
      };

      const shop = user.shop_id ? db.shops.find(s => s.id === user.shop_id) : null;
      const profile = {
        id: user.id,
        role: user.role,
        shop_id: user.shop_id,
        display_name: user.display_name,
        created_at: new Date().toISOString(),
        shops: shop
      };

      saveLocalDB('nyathiyas_current_user', { user: sessionUser, profile });
      return { user: sessionUser, profile };
    }
  },

  // Get Current Session User
  getCurrentUser: async () => {
    if (isUsingRealSupabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*, shops(*)')
        .eq('id', user.id)
        .single();

      return { user, profile };
    } else {
      const db = getLocalDB();
      if (!db.currentUser) return null;
      if (db.currentUser.profile && db.currentUser.profile.shop_id) {
        const shop = db.shops.find(s => s.id === db.currentUser.profile.shop_id);
        db.currentUser.profile.shops = shop || null;
      }
      return db.currentUser;
    }
  },

  // Sign Out
  signOut: async () => {
    if (isUsingRealSupabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nyathiyas_current_user');
      }
    }
  },

  // --- SHOPS SERVICES ---

  getShops: async () => {
    if (isUsingRealSupabase) {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('shop_name', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      const db = getLocalDB();
      return db.shops.filter(s => s.active);
    }
  },

  getAllShopsAdmin: async () => {
    if (isUsingRealSupabase) {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      const db = getLocalDB();
      return db.shops;
    }
  },

  createShop: async (shopData) => {
    if (isUsingRealSupabase) {
      const { data, error } = await supabase
        .from('shops')
        .insert([shopData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const db = getLocalDB();
      const newShop = {
        id: `shop-${Math.random().toString(36).substr(2, 9)}`,
        ...shopData,
        active: true,
        created_at: new Date().toISOString()
      };

      db.shops.unshift(newShop);
      saveLocalDB('nyathiyas_shops', db.shops);

      // Also register a default mock user for this shop
      const email = `${shopData.shop_code.toLowerCase()}@nyathiyas.com`;
      const newUser = {
        id: `auth-user-${shopData.shop_code.toLowerCase()}`,
        email: email,
        password: 'password',
        role: 'shopkeeper',
        display_name: `${shopData.shop_name} Manager`,
        shop_id: newShop.id
      };
      db.users.push(newUser);
      saveLocalDB('nyathiyas_users', db.users);

      return newShop;
    }
  },

  updateShop: async (id, shopData) => {
    if (isUsingRealSupabase) {
      const { data, error } = await supabase
        .from('shops')
        .update(shopData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const db = getLocalDB();
      const index = db.shops.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Shop not found.');

      db.shops[index] = { ...db.shops[index], ...shopData };
      saveLocalDB('nyathiyas_shops', db.shops);
      return db.shops[index];
    }
  },

  // --- FLAVORS SERVICES ---

  getFlavors: async (onlyActive = true) => {
    if (isUsingRealSupabase) {
      let query = supabase.from('flavors').select('*').order('flavor_name', { ascending: true });
      if (onlyActive) {
        query = query.eq('active', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      const db = getLocalDB();
      const flavorList = onlyActive ? db.flavors.filter(f => f.active) : db.flavors;

      // Annotate each flavor with aggregated stock details from batches
      return flavorList.map(flavor => {
        const flavorBatches = db.batches.filter(b => b.flavor_id === flavor.id && b.status === 'active' && new Date(b.expiry_date) > new Date());
        const stock_on_hand = flavorBatches.reduce((sum, b) => sum + b.stock_on_hand, 0);
        const stock_allocated = flavorBatches.reduce((sum, b) => sum + b.stock_allocated, 0);
        const stock_remaining = flavorBatches.reduce((sum, b) => sum + b.stock_remaining, 0);
        const next_expiry = flavorBatches.length > 0
          ? flavorBatches.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))[0].expiry_date
          : null;
        const reorder_point = flavorBatches.length > 0 ? flavorBatches[0].reorder_point : (flavor.reorder_point || 15);
        const unit = flavorBatches.length > 0 ? flavorBatches[0].unit : (flavor.unit || 'Tub (5L)');
        const min_order_qty = flavorBatches.length > 0 ? flavorBatches[0].min_order_qty : (flavor.minOrder || 5);

        return {
          ...flavor,
          stock_on_hand,
          stock_allocated,
          stock_remaining,
          next_expiry,
          reorder_point,
          unit,
          min_order_qty
        };
      });
    }
  },

  createFlavor: async (flavorData) => {
    if (isUsingRealSupabase) {
      const { data, error } = await supabase
        .from('flavors')
        .insert([flavorData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const db = getLocalDB();
      const newFlavor = {
        id: `flavor-${Math.random().toString(36).substr(2, 9)}`,
        active: true,
        ...flavorData,
        created_at: new Date().toISOString()
      };

      db.flavors.unshift(newFlavor);
      saveLocalDB('nyathiyas_flavors', db.flavors);
      return newFlavor;
    }
  },

  updateFlavor: async (id, flavorData) => {
    if (isUsingRealSupabase) {
      const { data, error } = await supabase
        .from('flavors')
        .update(flavorData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const db = getLocalDB();
      const index = db.flavors.findIndex(f => f.id === id);
      if (index === -1) throw new Error('Flavor not found.');

      db.flavors[index] = { ...db.flavors[index], ...flavorData };
      saveLocalDB('nyathiyas_flavors', db.flavors);
      return db.flavors[index];
    }
  },

  // --- ORDERS SERVICES ---

  getOrders: async (filters = {}) => {
    if (isUsingRealSupabase) {
      let query = supabase
        .from('orders')
        .select('*, shops(*), order_items(*, flavors(*))')
        .order('created_at', { ascending: false });

      if (filters.shop_id) {
        query = query.eq('shop_id', filters.shop_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      const db = getLocalDB();
      let filteredOrders = [...db.orders];

      if (filters.shop_id) {
        filteredOrders = filteredOrders.filter(o => o.shop_id === filters.shop_id);
      }
      if (filters.status) {
        filteredOrders = filteredOrders.filter(o => o.status === filters.status);
      }

      // Map relations
      const result = filteredOrders.map(order => {
        const shop = db.shops.find(s => s.id === order.shop_id);
        const items = db.order_items
          .filter(item => item.order_id === order.id)
          .map(item => {
            const flavor = db.flavors.find(f => f.id === item.flavor_id);
            return { ...item, flavors: flavor };
          });
        return {
          ...order,
          shops: shop,
          order_items: items
        };
      });

      // Sort by created_at desc
      return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  createOrder: async (shopId, items, notes = '') => {
    if (isUsingRealSupabase) {
      // 1. Generate Order Number
      const rand = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `NY-${rand}`;

      // 2. Insert Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          shop_id: shopId,
          order_number: orderNumber,
          status: 'pending',
          notes
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Insert Order Items
      const orderItems = items.map(item => ({
        order_id: order.id,
        flavor_id: item.flavor_id,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Return complete order
      return order;
    } else {
      const db = getLocalDB();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `NY-${rand}`;
      const orderId = `order-${Math.random().toString(36).substr(2, 9)}-uuid`;

      const newOrder = {
        id: orderId,
        shop_id: shopId,
        order_number: orderNumber,
        status: 'pending',
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newItems = [];
      const updatedBatches = [...db.batches];
      const newMovements = [];

      for (const item of items) {
        const flavorId = item.flavor_id;
        const requestedQty = item.quantity;

        // FEFO allocation logic: Active, unexpired batches sorted by expiry_date ASC
        const activeBatchesForFlavor = updatedBatches
          .filter(b => b.flavor_id === flavorId && b.status === 'active' && new Date(b.expiry_date) > new Date())
          .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

        let allocatedQty = 0;
        const allocations = [];

        for (const batch of activeBatchesForFlavor) {
          const remainingInBatch = batch.stock_on_hand - batch.stock_allocated;
          if (remainingInBatch <= 0) continue;

          const needed = requestedQty - allocatedQty;
          const toAllocate = Math.min(needed, remainingInBatch);

          if (toAllocate > 0) {
            batch.stock_allocated += toAllocate;
            batch.stock_remaining = batch.stock_on_hand - batch.stock_allocated;
            allocations.push({
              batch_id: batch.id,
              batch_number: batch.batch_number,
              quantity: toAllocate
            });

            allocatedQty += toAllocate;

            // Record allocation movement
            newMovements.push({
              id: `move-${Math.random().toString(36).substr(2, 9)}`,
              flavor_id: flavorId,
              batch_id: batch.id,
              shop_id: shopId,
              quantity: toAllocate, // show amount reserved
              type: 'allocated',
              notes: `Allocated to pending order ${orderNumber}`,
              created_at: new Date().toISOString()
            });
          }

          if (allocatedQty >= requestedQty) break;
        }

        const deficit = requestedQty - allocatedQty;
        if (deficit > 0) {
          allocations.push({
            batch_id: 'unallocated',
            batch_number: 'N/A (Backordered)',
            quantity: deficit
          });
        }

        newItems.push({
          id: `item-${Math.random().toString(36).substr(2, 9)}`,
          order_id: orderId,
          flavor_id: flavorId,
          quantity: requestedQty,
          allocations: allocations,
          created_at: new Date().toISOString()
        });
      }

      db.orders.unshift(newOrder);
      db.order_items.push(...newItems);
      db.batches = updatedBatches;
      db.stock_movements.push(...newMovements);

      const historyId = `history-${Math.random().toString(36).substr(2, 9)}`;
      const newHistory = {
        id: historyId,
        order_id: orderId,
        status: 'pending',
        changed_by: db.currentUser?.user.id || 'auth-user-colaba',
        changed_at: new Date().toISOString()
      };
      db.order_status_history.push(newHistory);

      saveLocalDB('nyathiyas_orders', db.orders);
      saveLocalDB('nyathiyas_order_items', db.order_items);
      saveLocalDB('nyathiyas_batches', db.batches);
      saveLocalDB('nyathiyas_stock_movements', db.stock_movements);
      saveLocalDB('nyathiyas_order_history', db.order_status_history);

      // Broadcast update for realtime Simulation
      if (broadcastChannel) {
        broadcastChannel.postMessage({ event: 'INSERT', table: 'orders', record: newOrder });
      }

      return newOrder;
    }
  },

  updateOrderStatus: async (orderId, newStatus) => {
    if (isUsingRealSupabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const db = getLocalDB();
      const orderIndex = db.orders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) throw new Error('Order not found.');

      const order = db.orders[orderIndex];
      const oldStatus = order.status;

      if (oldStatus === newStatus) return order;

      order.status = newStatus;
      order.updated_at = new Date().toISOString();

      const orderItems = db.order_items.filter(item => item.order_id === orderId);
      const updatedBatches = [...db.batches];
      const updatedStockByLoc = [...db.stock_by_location];
      const newMovements = [];

      const isPreDispatched = (status) => ['pending', 'accepted', 'preparing'].includes(status);

      // Transition Logic
      if (isPreDispatched(oldStatus) && newStatus === 'dispatched') {
        // Physically deduct stock from master batches (leaves the warehouse)
        for (const item of orderItems) {
          if (!item.allocations) continue;
          for (const alloc of item.allocations) {
            if (alloc.batch_id === 'unallocated') continue;
            const batch = updatedBatches.find(b => b.id === alloc.batch_id);
            if (batch) {
              batch.stock_on_hand = Math.max(0, batch.stock_on_hand - alloc.quantity);
              batch.stock_allocated = Math.max(0, batch.stock_allocated - alloc.quantity);
              batch.stock_remaining = batch.stock_on_hand - batch.stock_allocated;

              newMovements.push({
                id: `move-${Math.random().toString(36).substr(2, 9)}`,
                flavor_id: item.flavor_id,
                batch_id: batch.id,
                shop_id: order.shop_id,
                quantity: -alloc.quantity,
                type: 'dispatched',
                notes: `Dispatched from warehouse for Order ${order.order_number}`,
                created_at: new Date().toISOString()
              });
            }
          }
        }
      }

      if (oldStatus === 'dispatched' && newStatus === 'delivered') {
        // Stock arrives at location
        for (const item of orderItems) {
          if (!item.allocations) continue;
          for (const alloc of item.allocations) {
            if (alloc.batch_id === 'unallocated') continue;

            const existingLocStock = updatedStockByLoc.find(
              l => l.shop_id === order.shop_id && l.flavor_id === item.flavor_id && l.batch_id === alloc.batch_id
            );

            if (existingLocStock) {
              existingLocStock.stock_qty += alloc.quantity;
              existingLocStock.last_updated = new Date().toISOString();
            } else {
              updatedStockByLoc.push({
                id: `loc-${Math.random().toString(36).substr(2, 9)}`,
                shop_id: order.shop_id,
                flavor_id: item.flavor_id,
                batch_id: alloc.batch_id,
                stock_qty: alloc.quantity,
                last_updated: new Date().toISOString()
              });
            }

            newMovements.push({
              id: `move-${Math.random().toString(36).substr(2, 9)}`,
              flavor_id: item.flavor_id,
              batch_id: alloc.batch_id,
              shop_id: order.shop_id,
              quantity: alloc.quantity,
              type: 'delivered',
              notes: `Received at store for Order ${order.order_number}`,
              created_at: new Date().toISOString()
            });
          }
        }
      }

      if (isPreDispatched(oldStatus) && (newStatus === 'cancelled' || newStatus === 'rejected')) {
        // Release allocations back to remaining
        for (const item of orderItems) {
          if (!item.allocations) continue;
          for (const alloc of item.allocations) {
            if (alloc.batch_id === 'unallocated') continue;
            const batch = updatedBatches.find(b => b.id === alloc.batch_id);
            if (batch) {
              batch.stock_allocated = Math.max(0, batch.stock_allocated - alloc.quantity);
              batch.stock_remaining = batch.stock_on_hand - batch.stock_allocated;

              newMovements.push({
                id: `move-${Math.random().toString(36).substr(2, 9)}`,
                flavor_id: item.flavor_id,
                batch_id: batch.id,
                shop_id: order.shop_id,
                quantity: -alloc.quantity,
                type: 'returned', // Reversing allocation reservation
                notes: `Allocation released due to Order ${order.order_number} cancellation`,
                created_at: new Date().toISOString()
              });
            }
          }
        }
      }

      if (oldStatus === 'delivered' && (newStatus === 'cancelled' || newStatus === 'rejected')) {
        // Reverse delivery (deduct from location, return to warehouse on hand)
        for (const item of orderItems) {
          if (!item.allocations) continue;
          for (const alloc of item.allocations) {
            if (alloc.batch_id === 'unallocated') continue;

            const existingLocStock = updatedStockByLoc.find(
              l => l.shop_id === order.shop_id && l.flavor_id === item.flavor_id && l.batch_id === alloc.batch_id
            );

            if (existingLocStock) {
              existingLocStock.stock_qty = Math.max(0, existingLocStock.stock_qty - alloc.quantity);
              existingLocStock.last_updated = new Date().toISOString();
            }

            const batch = updatedBatches.find(b => b.id === alloc.batch_id);
            if (batch) {
              batch.stock_on_hand += alloc.quantity;
              batch.stock_remaining = batch.stock_on_hand - batch.stock_allocated;

              newMovements.push({
                id: `move-${Math.random().toString(36).substr(2, 9)}`,
                flavor_id: item.flavor_id,
                batch_id: batch.id,
                shop_id: order.shop_id,
                quantity: alloc.quantity,
                type: 'returned',
                notes: `Returned to warehouse from store due to Order ${order.order_number} cancellation`,
                created_at: new Date().toISOString()
              });
            }
          }
        }
      }

      // Add to status history
      const newHistory = {
        id: `history-${Math.random().toString(36).substr(2, 9)}`,
        order_id: orderId,
        status: newStatus,
        changed_by: db.currentUser?.user.id || 'auth-user-admin',
        changed_at: new Date().toISOString()
      };
      db.order_status_history.push(newHistory);

      db.batches = updatedBatches;
      db.stock_by_location = updatedStockByLoc;

      saveLocalDB('nyathiyas_orders', db.orders);
      saveLocalDB('nyathiyas_order_history', db.order_status_history);
      saveLocalDB('nyathiyas_batches', db.batches);
      saveLocalDB('nyathiyas_stock_by_location', db.stock_by_location);
      saveLocalDB('nyathiyas_stock_movements', db.stock_movements);

      // Broadcast update for realtime Simulation
      if (broadcastChannel) {
        broadcastChannel.postMessage({ event: 'UPDATE', table: 'orders', record: order });
      }

      return order;
    }
  },

  getOrderHistory: async (orderId) => {
    if (isUsingRealSupabase) {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('changed_at', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      const db = getLocalDB();
      const history = db.order_status_history.filter(h => h.order_id === orderId);
      return history.sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at));
    }
  },

  // --- BATCH MANAGEMENT SERVICES ---

  getBatches: async (filters = {}) => {
    const db = getLocalDB();
    let result = [...db.batches];

    if (filters.flavor_id) {
      result = result.filter(b => b.flavor_id === filters.flavor_id);
    }
    if (filters.status) {
      result = result.filter(b => b.status === filters.status);
    }

    // Map flavor details to batches
    return result.map(batch => {
      const flavor = db.flavors.find(f => f.id === batch.flavor_id);
      return {
        ...batch,
        flavors: flavor
      };
    }).sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date)); // Sort by earliest expiry (FEFO)
  },

  createBatch: async (batchData) => {
    const db = getLocalDB();
    const newBatch = {
      id: `batch-${Math.random().toString(36).substr(2, 9)}`,
      stock_allocated: 0,
      stock_remaining: Number(batchData.quantity_received),
      stock_on_hand: Number(batchData.quantity_received),
      status: 'active',
      unit: batchData.unit || 'Tub (5L)',
      min_order_qty: Number(batchData.min_order_qty) || 5,
      reorder_point: Number(batchData.reorder_point) || 15,
      ...batchData,
      quantity_received: Number(batchData.quantity_received)
    };

    db.batches.unshift(newBatch);
    
    // Record movement (received)
    const newMovement = {
      id: `move-${Math.random().toString(36).substr(2, 9)}`,
      flavor_id: batchData.flavor_id,
      batch_id: newBatch.id,
      shop_id: null,
      quantity: Number(batchData.quantity_received),
      type: 'received',
      notes: `Batch ${batchData.batch_number} manufactured/received: ${batchData.notes || ''}`,
      created_at: new Date().toISOString()
    };
    db.stock_movements.push(newMovement);

    saveLocalDB('nyathiyas_batches', db.batches);
    saveLocalDB('nyathiyas_stock_movements', db.stock_movements);
    return newBatch;
  },

  updateBatch: async (id, batchData) => {
    const db = getLocalDB();
    const index = db.batches.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Batch not found.');

    const oldBatch = db.batches[index];
    const updatedBatch = {
      ...oldBatch,
      ...batchData,
      quantity_received: Number(batchData.quantity_received || oldBatch.quantity_received),
      stock_on_hand: Number(batchData.stock_on_hand !== undefined ? batchData.stock_on_hand : oldBatch.stock_on_hand),
      min_order_qty: Number(batchData.min_order_qty !== undefined ? batchData.min_order_qty : oldBatch.min_order_qty),
      reorder_point: Number(batchData.reorder_point !== undefined ? batchData.reorder_point : oldBatch.reorder_point)
    };

    updatedBatch.stock_remaining = updatedBatch.stock_on_hand - updatedBatch.stock_allocated;
    db.batches[index] = updatedBatch;

    saveLocalDB('nyathiyas_batches', db.batches);
    return updatedBatch;
  },

  deleteBatch: async (id) => {
    const db = getLocalDB();
    db.batches = db.batches.filter(b => b.id !== id);
    saveLocalDB('nyathiyas_batches', db.batches);
    return true;
  },

  adjustBatchStock: async (id, quantityChange, type = 'adjustment', notes = '') => {
    const db = getLocalDB();
    const index = db.batches.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Batch not found.');

    const batch = db.batches[index];
    batch.stock_on_hand = Math.max(0, batch.stock_on_hand + Number(quantityChange));
    batch.stock_remaining = batch.stock_on_hand - batch.stock_allocated;

    // Record movement
    const newMovement = {
      id: `move-${Math.random().toString(36).substr(2, 9)}`,
      flavor_id: batch.flavor_id,
      batch_id: batch.id,
      shop_id: null,
      quantity: Number(quantityChange),
      type,
      notes: notes || `Manual stock adjustment: ${quantityChange} units`,
      created_at: new Date().toISOString()
    };
    db.stock_movements.push(newMovement);

    saveLocalDB('nyathiyas_batches', db.batches);
    saveLocalDB('nyathiyas_stock_movements', db.stock_movements);
    return batch;
  },

  // --- LOCATION STOCK SERVICES ---

  getStockByLocation: async (shopId = null) => {
    const db = getLocalDB();
    let result = [...db.stock_by_location];

    if (shopId) {
      result = result.filter(l => l.shop_id === shopId);
    }

    return result.map(loc => {
      const shop = db.shops.find(s => s.id === loc.shop_id);
      const flavor = db.flavors.find(f => f.id === loc.flavor_id);
      const batch = db.batches.find(b => b.id === loc.batch_id);

      return {
        ...loc,
        shops: shop,
        flavors: flavor,
        batches: batch
      };
    });
  },

  adjustLocationStock: async (shopId, flavorId, batchId, quantityChange, type = 'adjustment', notes = '') => {
    const db = getLocalDB();
    const index = db.stock_by_location.findIndex(
      l => l.shop_id === shopId && l.flavor_id === flavorId && l.batch_id === batchId
    );

    let record;
    if (index !== -1) {
      db.stock_by_location[index].stock_qty = Math.max(0, db.stock_by_location[index].stock_qty + Number(quantityChange));
      db.stock_by_location[index].last_updated = new Date().toISOString();
      record = db.stock_by_location[index];
    } else {
      record = {
        id: `loc-${Math.random().toString(36).substr(2, 9)}`,
        shop_id: shopId,
        flavor_id: flavorId,
        batch_id: batchId,
        stock_qty: Math.max(0, Number(quantityChange)),
        last_updated: new Date().toISOString()
      };
      db.stock_by_location.push(record);
    }

    // Record movement
    const newMovement = {
      id: `move-${Math.random().toString(36).substr(2, 9)}`,
      flavor_id: flavorId,
      batch_id: batchId,
      shop_id: shopId,
      quantity: Number(quantityChange),
      type,
      notes: notes || `Location stock adjustment: ${quantityChange} units`,
      created_at: new Date().toISOString()
    };
    db.stock_movements.push(newMovement);

    saveLocalDB('nyathiyas_stock_by_location', db.stock_by_location);
    saveLocalDB('nyathiyas_stock_movements', db.stock_movements);
    return record;
  },

  returnStockToWarehouse: async (shopId, flavorId, batchId, quantity, notes = '') => {
    const db = getLocalDB();

    // 1. Deduct from store location
    const locIndex = db.stock_by_location.findIndex(
      l => l.shop_id === shopId && l.flavor_id === flavorId && l.batch_id === batchId
    );
    if (locIndex === -1) throw new Error('No stock record found at this store location.');
    if (db.stock_by_location[locIndex].stock_qty < quantity) {
      throw new Error(`Insufficient stock at location. Available: ${db.stock_by_location[locIndex].stock_qty}`);
    }

    db.stock_by_location[locIndex].stock_qty -= Number(quantity);
    db.stock_by_location[locIndex].last_updated = new Date().toISOString();

    // 2. Add back to warehouse batch
    const batchIndex = db.batches.findIndex(b => b.id === batchId);
    if (batchIndex !== -1) {
      db.batches[batchIndex].stock_on_hand += Number(quantity);
      db.batches[batchIndex].stock_remaining = db.batches[batchIndex].stock_on_hand - db.batches[batchIndex].stock_allocated;
    }

    // 3. Record movements
    const moveLoc = {
      id: `move-${Math.random().toString(36).substr(2, 9)}`,
      flavor_id: flavorId,
      batch_id: batchId,
      shop_id: shopId,
      quantity: -Number(quantity),
      type: 'returned',
      notes: `Returned to warehouse: ${notes}`,
      created_at: new Date().toISOString()
    };
    const moveWh = {
      id: `move-${Math.random().toString(36).substr(2, 9)}`,
      flavor_id: flavorId,
      batch_id: batchId,
      shop_id: null,
      quantity: Number(quantity),
      type: 'returned',
      notes: `Received return from store: ${notes}`,
      created_at: new Date().toISOString()
    };

    db.stock_movements.push(moveLoc, moveWh);

    saveLocalDB('nyathiyas_stock_by_location', db.stock_by_location);
    saveLocalDB('nyathiyas_batches', db.batches);
    saveLocalDB('nyathiyas_stock_movements', db.stock_movements);

    return true;
  },

  // --- STOCK MOVEMENT SERVICES ---

  getStockMovements: async (filters = {}) => {
    const db = getLocalDB();
    let result = [...db.stock_movements];

    if (filters.flavor_id) {
      result = result.filter(m => m.flavor_id === filters.flavor_id);
    }
    if (filters.batch_id) {
      result = result.filter(m => m.batch_id === filters.batch_id);
    }
    if (filters.shop_id) {
      result = result.filter(m => m.shop_id === filters.shop_id);
    }
    if (filters.type) {
      result = result.filter(m => m.type === filters.type);
    }

    return result.map(move => {
      const shop = db.shops.find(s => s.id === move.shop_id);
      const flavor = db.flavors.find(f => f.id === move.flavor_id);
      const batch = db.batches.find(b => b.id === move.batch_id);

      return {
        ...move,
        shops: shop,
        flavors: flavor,
        batches: batch
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Latest first
  },

  // --- REALTIME SUBSCRIPTIONS ---

  subscribeToOrders: (callback) => {
    if (isUsingRealSupabase) {
      // Connect to real Supabase Realtime channel
      const channel = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          callback(payload);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Mock Realtime using BroadcastChannel + DOM Custom Events
      const handleMessage = (e) => {
        if (e.data && e.data.table === 'orders') {
          callback({
            eventType: e.data.event,
            new: e.data.record
          });
        }
      };

      if (broadcastChannel) {
        broadcastChannel.addEventListener('message', handleMessage);
      }

      // Custom event listener for local actions in the same tab
      const handleLocalEvent = (e) => {
        callback(e.detail);
      };
      window.addEventListener('nyathiyas_local_order_change', handleLocalEvent);

      return () => {
        if (broadcastChannel) {
          broadcastChannel.removeEventListener('message', handleMessage);
        }
        window.removeEventListener('nyathiyas_local_order_change', handleLocalEvent);
      };
    }
  },

  // Trigger local change event (useful for single tab updates)
  triggerLocalOrderChange: (event, record) => {
    if (!isUsingRealSupabase && typeof window !== 'undefined') {
      const e = new CustomEvent('nyathiyas_local_order_change', {
        detail: {
          eventType: event,
          new: record
        }
      });
      window.dispatchEvent(e);

      // Also broadcast to other tabs
      if (broadcastChannel) {
        broadcastChannel.postMessage({ event, table: 'orders', record });
      }
    }
  }
};
