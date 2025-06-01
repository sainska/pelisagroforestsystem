-- Check if columns exist before adding them
DO $$ 
BEGIN 
    -- Add location_preference if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'plot_applications' 
                  AND column_name = 'location_preference') THEN
        ALTER TABLE plot_applications ADD COLUMN location_preference text;
    END IF;

    -- Add farming_experience if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'plot_applications' 
                  AND column_name = 'farming_experience') THEN
        ALTER TABLE plot_applications ADD COLUMN farming_experience text;
    END IF;

    -- Add intended_use if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'plot_applications' 
                  AND column_name = 'intended_use') THEN
        ALTER TABLE plot_applications ADD COLUMN intended_use text;
    END IF;

    -- Add has_equipment if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'plot_applications' 
                  AND column_name = 'has_equipment') THEN
        ALTER TABLE plot_applications ADD COLUMN has_equipment boolean DEFAULT false;
    END IF;

    -- Add application_score if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'plot_applications' 
                  AND column_name = 'application_score') THEN
        ALTER TABLE plot_applications ADD COLUMN application_score integer DEFAULT 0;
    END IF;

    -- Create index if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                  WHERE tablename = 'plot_applications' 
                  AND indexname = 'idx_plot_applications_score') THEN
        CREATE INDEX idx_plot_applications_score ON plot_applications(application_score);
    END IF;

END $$; 