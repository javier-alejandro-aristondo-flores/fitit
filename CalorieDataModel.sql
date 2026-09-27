-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For semantic food item similarity matching

-- Enums
CREATE TYPE meal_type_enum AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE logged_via_enum AS ENUM ('text_prompt', 'barcode', 'photo_ai', 'manual');
CREATE TYPE unit_type_enum AS ENUM ('g', 'ml', 'oz', 'serving', 'unit');

-------------------------------------------------------------------------------
-- 1. USER PROFILE & NUTRITIONAL BASELINES
-------------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    daily_calorie_target INT NOT NULL DEFAULT 2000,
    protein_target_g INT,
    carbs_target_g INT,
    fat_target_g INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------------------------------
-- 2. FOOD ITEM LIBRARY (MASTER TABLE)
-------------------------------------------------------------------------------
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    barcode VARCHAR(50),
    serving_size_amount NUMERIC(8, 2) NOT NULL DEFAULT 100,
    serving_size_unit unit_type_enum NOT NULL DEFAULT 'g',
    
    -- Macronutrients per serving
    calories NUMERIC(8, 2) NOT NULL,
    protein_g NUMERIC(8, 2) DEFAULT 0,
    carbs_g NUMERIC(8, 2) DEFAULT 0,
    fat_g NUMERIC(8, 2) DEFAULT 0,
    fiber_g NUMERIC(8, 2) DEFAULT 0,
    
    -- Micronutrients & secondary metrics stored as JSONB
    micros JSONB DEFAULT '{}'::jsonb,
    
    -- Embedding vector for semantic natural language lookup (e.g., 1536 dims for OpenAI embeddings)
    embedding vector(1536),
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast text and vector search
CREATE INDEX idx_food_items_name ON food_items (name);
CREATE INDEX idx_food_items_barcode ON food_items (barcode) WHERE barcode IS NOT NULL;

-------------------------------------------------------------------------------
-- 3. MEAL LOGS (CONTAINER)
-------------------------------------------------------------------------------
CREATE TABLE meal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type meal_type_enum NOT NULL,
    logged_via logged_via_enum NOT NULL DEFAULT 'manual',
    logged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_notes TEXT
);

-- Composite index for fast AI context window retrieval of recent meals
CREATE INDEX idx_meal_logs_user_date ON meal_logs (user_id, logged_at DESC);

-------------------------------------------------------------------------------
-- 4. LOGGED FOOD ITEMS (JOIN TABLE WITH HISTORICAL SNAPSHOT)
-------------------------------------------------------------------------------
CREATE TABLE logged_food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID NOT NULL REFERENCES meal_logs(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id) ON DELETE SET NULL,
    
    -- Serving multiplier (e.g., 1.5 x 100g serving)
    quantity NUMERIC(8, 2) NOT NULL DEFAULT 1.0,
    
    -- Historical Snapshot: Calculated at insert time to ensure historic accuracy
    calories_consumed NUMERIC(8, 2) NOT NULL,
    protein_consumed_g NUMERIC(8, 2) NOT NULL,
    carbs_consumed_g NUMERIC(8, 2) NOT NULL,
    fat_consumed_g NUMERIC(8, 2) NOT NULL,
    
    -- AI metadata
    confidence_score NUMERIC(3, 2) DEFAULT 1.00, -- e.g., 0.85 if photo AI is uncertain
    is_verified BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_logged_food_items_meal ON logged_food_items (meal_id);

-------------------------------------------------------------------------------
-- 5. DAILY AGGREGATIONS (FAST AI CONTEXT RETRIEVAL)
-------------------------------------------------------------------------------
CREATE TABLE daily_nutritional_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    
    total_calories NUMERIC(8, 2) DEFAULT 0,
    total_protein_g NUMERIC(8, 2) DEFAULT 0,
    total_carbs_g NUMERIC(8, 2) DEFAULT 0,
    total_fat_g NUMERIC(8, 2) DEFAULT 0,
    
    calorie_target_at_date INT NOT NULL,
    
    CONSTRAINT unique_user_date UNIQUE (user_id, log_date)
);


CREATE INDEX idx_daily_summaries_user_date ON daily_nutritional_summaries (user_id, log_date DESC);