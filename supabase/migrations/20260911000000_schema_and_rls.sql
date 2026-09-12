-- ArogyaFlow SQL Migration: Schema & RLS Setup (AF-002)

-- 1. Create Enum Types (if not existing)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'token_status') THEN
        CREATE TYPE token_status AS ENUM ('waiting', 'in-consultation', 'completed', 'skipped');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'triage_level') THEN
        CREATE TYPE triage_level AS ENUM ('routine', 'priority', 'express');
    END IF;
END $$;

-- 2. Table: doctors
CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,                       -- e.g. 'doc_general_medicine_104'
    name TEXT NOT NULL,                        -- e.g. 'Dr. Anjali Sharma'
    department TEXT NOT NULL,                  -- e.g. 'General Medicine'
    room_number TEXT NOT NULL,                 -- e.g. 'Room 104'
    current_token INT DEFAULT 0,               -- Token currently inside room
    velocity_factor FLOAT DEFAULT 1.0,         -- Pace multiplier (>1.0 slower, <1.0 faster)
    emergency_delay INT DEFAULT 0,             -- Accumulated emergency delay in minutes
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: tokens
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_number INT NOT NULL,                 -- Sequential: 61, 62, 63...
    doctor_id TEXT REFERENCES doctors(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,                -- e.g. 'Ramesh Kumar'
    chief_complaint TEXT NOT NULL,             -- e.g. 'Blood pressure follow-up'
    triage_level triage_level DEFAULT 'routine',
    predicted_mins INT NOT NULL DEFAULT 8,     -- AI prediction or fallback (mins)
    status token_status DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    consultation_started_at TIMESTAMPTZ,
    consultation_completed_at TIMESTAMPTZ
);

-- 4. Composite Index for fast queue querying
CREATE INDEX IF NOT EXISTS idx_tokens_doctor_status ON tokens(doctor_id, status, token_number);

-- 5. Enable Row-Level Security (RLS)
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Allow public read access to doctors" ON doctors;
CREATE POLICY "Allow public read access to doctors" ON doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to tokens" ON tokens;
CREATE POLICY "Allow public read access to tokens" ON tokens FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write access to doctors" ON doctors;
CREATE POLICY "Allow write access to doctors" ON doctors FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow write access to tokens" ON tokens;
CREATE POLICY "Allow write access to tokens" ON tokens FOR ALL USING (true);

-- 7. Supabase Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE doctors;
ALTER PUBLICATION supabase_realtime ADD TABLE tokens;
