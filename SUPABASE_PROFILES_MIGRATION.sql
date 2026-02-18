-- Migration to add extended profile fields to the profiles table
-- Run this in your Supabase SQL Editor

-- Step 1: Add new columns to the profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS address_street TEXT,
ADD COLUMN IF NOT EXISTS address_city TEXT,
ADD COLUMN IF NOT EXISTS address_state TEXT,
ADD COLUMN IF NOT EXISTS address_zip TEXT,
ADD COLUMN IF NOT EXISTS address_country TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Step 2: Add comments to document the columns
COMMENT ON COLUMN profiles.bio IS 'User biography or about section';
COMMENT ON COLUMN profiles.address_street IS 'Street address';
COMMENT ON COLUMN profiles.address_city IS 'City';
COMMENT ON COLUMN profiles.address_state IS 'State or province';
COMMENT ON COLUMN profiles.address_zip IS 'ZIP or postal code';
COMMENT ON COLUMN profiles.address_country IS 'Country';
COMMENT ON COLUMN profiles.company IS 'Company name';
COMMENT ON COLUMN profiles.job_title IS 'Job title';
COMMENT ON COLUMN profiles.date_of_birth IS 'Date of birth';
COMMENT ON COLUMN profiles.gender IS 'Gender (Male, Female, Other, Prefer not to say)';

-- Step 3: Create an index on date_of_birth for potential age-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_date_of_birth ON profiles(date_of_birth);

-- Step 4: Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'profiles'
ORDER BY 
    ordinal_position;

-- Expected output should show all the new columns added to the profiles table
