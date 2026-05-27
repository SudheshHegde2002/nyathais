-- ==========================================
-- NYATHIYAS MULTI-PORTAL ORDERING SYSTEM SCHEMA
-- ==========================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create CUSTOM TYPES
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'dispatched', 'delivered');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'shopkeeper');
    END IF;
END $$;

-- 2. Create SHOPS Table
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_code TEXT UNIQUE NOT NULL,
    shop_name TEXT NOT NULL,
    store_location TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create PROFILES Table (Linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'shopkeeper',
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create FLAVORS Table (Catalog)
CREATE TABLE IF NOT EXISTS public.flavors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flavor_name TEXT NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL, -- e.g., 'Signature', 'Classic', 'Exotic'
    active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create ORDERS Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create ORDER ITEMS Table (Pivot table for flavors ordered)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    flavor_id UUID NOT NULL REFERENCES public.flavors(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create ORDER STATUS HISTORY Table (Audit trail)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by admins and owner" ON public.profiles
    FOR SELECT TO authenticated USING (
        auth.uid() = id OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Profiles can be updated by admins and owner" ON public.profiles
    FOR UPDATE TO authenticated USING (
        auth.uid() = id OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Shops Policies
CREATE POLICY "Shops are viewable by admins and assigned shopkeepers" ON public.shops
    FOR SELECT TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
        id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Shops are manageable by admins" ON public.shops
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Flavors Policies
CREATE POLICY "Flavors are viewable by authenticated users" ON public.flavors
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Flavors are manageable by admins" ON public.flavors
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Orders Policies
CREATE POLICY "Orders are viewable by admins and respective shopkeepers" ON public.orders
    FOR SELECT TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
        shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Orders can be placed by shopkeepers and admins" ON public.orders
    FOR INSERT TO authenticated WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
        shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Orders are manageable by admins" ON public.orders
    FOR UPDATE TO authenticated USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Order Items Policies
CREATE POLICY "Order items are viewable by admins and respective shopkeepers" ON public.order_items
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND (
                (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
                o.shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
            )
        )
    );

CREATE POLICY "Order items can be placed by shopkeepers and admins" ON public.order_items
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND (
                (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
                o.shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
            )
        )
    );

-- Order Status History Policies
CREATE POLICY "Order status history is viewable by admins and respective shopkeepers" ON public.order_status_history
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND (
                (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR
                o.shop_id = (SELECT shop_id FROM public.profiles WHERE id = auth.uid())
            )
        )
    );

CREATE POLICY "Order status history can be inserted by anyone authenticated" ON public.order_status_history
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);


-- ==========================================
-- AUTOMATION TRIGGERS
-- ==========================================

-- Trigger to automatically create a profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role public.user_role := 'shopkeeper';
    assigned_shop_id UUID := NULL;
    meta_role TEXT;
BEGIN
    meta_role := new.raw_user_meta_data->>'role';
    IF meta_role = 'admin' THEN
        default_role := 'admin'::public.user_role;
    END IF;
    
    -- Extract optional shop_id from metadata if present
    IF new.raw_user_meta_data->>'shop_id' IS NOT NULL THEN
        assigned_shop_id := (new.raw_user_meta_data->>'shop_id')::UUID;
    END IF;

    INSERT INTO public.profiles (id, display_name, role, shop_id)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'display_name', new.email),
        default_role,
        assigned_shop_id
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to record status history changes
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF old.status IS NULL OR old.status <> new.status THEN
        INSERT INTO public.order_status_history (order_id, status, changed_by)
        VALUES (
            new.id,
            new.status,
            auth.uid()
        );
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_order_status_changed
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_change();


-- ==========================================
-- SEED DATA (INITIAL VALUES)
-- ==========================================

-- Insert Default Shops
INSERT INTO public.shops (shop_code, shop_name, store_location, owner_name, phone, email) VALUES
('SH-COL-01', 'Nyathiyas Colaba Parlour', 'Gateway of India Promenade, Colaba, Mumbai', 'Rajesh Sharma', '+91 98200 12345', 'colaba@nyathiyas.com'),
('SH-BAND-02', 'Nyathiyas Bandra Premium', 'Carter Road Bandstand, Bandra West, Mumbai', 'Priya Kapoor', '+91 98199 54321', 'bandra@nyathiyas.com'),
('SH-JHU-03', 'Nyathiyas Juhu Beach Lounge', 'Juhu Tara Road, Opposite JW Marriott, Juhu, Mumbai', 'Vikram Malhotra', '+91 98211 98765', 'juhu@nyathiyas.com')
ON CONFLICT (shop_code) DO NOTHING;

-- Insert Premium Flavors
INSERT INTO public.flavors (flavor_name, category, active, notes, image_url) VALUES
('Royal Saffron Pistachio', 'Signature', true, 'Pure Kashmiri saffron infused with roasted Iranian pistachios.', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80'),
('Midnight Dark Chocolate Kakao', 'Classic', true, '85% Venezuelan dark cocoa with flakes of Belgian gourmet dark chocolate.', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80'),
('Kesar Pista Shrikhand Swirl', 'Signature', true, 'A traditional cardamon-rich shrikhand base marble-swirled with pistachio cream.', 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop&q=80'),
('Alfonso Mango Nectar Cream', 'Signature', true, 'Sun-ripened Ratnagiri Alfonso mango pulp blended into velvety organic cream.', 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=500&auto=format&fit=crop&q=80'),
('Madagascar Bourbon Vanilla', 'Classic', true, 'Whole Madagascar vanilla bean caviar speckles in double-churned custard cream.', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&auto=format&fit=crop&q=80'),
('Roasted Almond & Fig Confit', 'Exotic', true, 'Slow-cooked Turkish figs paired with dry-roasted California almond slivers.', 'https://images.unsplash.com/photo-1534706936960-85aa4b13d86c?w=500&auto=format&fit=crop&q=80')
ON CONFLICT DO NOTHING;
