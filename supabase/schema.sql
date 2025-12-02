-- ============================================
-- MoneyLog Database Schema for Supabase
-- ============================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Transactions Table (가계부 내역)
-- ============================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    content TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL DEFAULT '기타',
    memo TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_category ON public.transactions(category);

-- ============================================
-- 2. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own transactions
CREATE POLICY "Users can view own transactions"
    ON public.transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can only insert their own transactions
CREATE POLICY "Users can insert own transactions"
    ON public.transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own transactions
CREATE POLICY "Users can update own transactions"
    ON public.transactions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own transactions
CREATE POLICY "Users can delete own transactions"
    ON public.transactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 3. Updated_at Trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 4. Storage Bucket for Receipts
-- ============================================
-- Run this in Supabase Dashboard > Storage > Create new bucket
-- Bucket name: receipts
-- Public bucket: false (private)

-- Storage RLS Policies (run in SQL Editor after creating bucket)

-- Policy: Allow authenticated users to upload receipts
CREATE POLICY "Users can upload receipts"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'receipts' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Allow users to view their own receipts
CREATE POLICY "Users can view own receipts"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'receipts' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Allow users to delete their own receipts
CREATE POLICY "Users can delete own receipts"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'receipts' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================
-- 5. Recurring Transactions Table (고정 수입/지출)
-- ============================================
CREATE TABLE public.recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    content TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL DEFAULT '기타',
    day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
    memo TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_recurring_transactions_user_id ON public.recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_type ON public.recurring_transactions(type);
CREATE INDEX idx_recurring_transactions_is_active ON public.recurring_transactions(is_active);

-- Enable RLS on recurring_transactions table
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own recurring transactions
CREATE POLICY "Users can view own recurring transactions"
    ON public.recurring_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can only insert their own recurring transactions
CREATE POLICY "Users can insert own recurring transactions"
    ON public.recurring_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own recurring transactions
CREATE POLICY "Users can update own recurring transactions"
    ON public.recurring_transactions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own recurring transactions
CREATE POLICY "Users can delete own recurring transactions"
    ON public.recurring_transactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER set_recurring_updated_at
    BEFORE UPDATE ON public.recurring_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 6. Categories Reference (Optional)
-- ============================================
-- Default categories for reference:
-- 지출: 식비, 교통, 쇼핑, 문화/여가, 의료, 교육, 주거, 통신, 보험, 구독, 기타
-- 수입: 월급, 용돈, 부수입, 이자, 배당, 기타
