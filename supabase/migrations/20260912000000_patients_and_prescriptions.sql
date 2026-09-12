-- ArogyaFlow Migration: Patients Table & Prescriptions History Setup (20260912000000)

-- 1. Table: patients
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    age INT DEFAULT 35,
    gender TEXT DEFAULT 'Male',
    prior_history TEXT DEFAULT 'None',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns to tokens table
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS patient_phone TEXT;
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS doctor_notes TEXT;
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS prescription_text TEXT;

-- 3. Add Foreign Key relationship line between tokens and patients
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_tokens_patient_phone'
    ) THEN
        ALTER TABLE tokens 
        ADD CONSTRAINT fk_tokens_patient_phone 
        FOREIGN KEY (patient_phone) 
        REFERENCES patients(phone) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. Composite Index for fast patient token querying
CREATE INDEX IF NOT EXISTS idx_tokens_patient_phone ON tokens(patient_phone, status);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- 4. Enable Row-Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Allow public read access to patients" ON patients;
CREATE POLICY "Allow public read access to patients" ON patients FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write access to patients" ON patients;
CREATE POLICY "Allow public write access to patients" ON patients FOR ALL USING (true);

-- 6. Supabase Realtime Replication for patients
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
