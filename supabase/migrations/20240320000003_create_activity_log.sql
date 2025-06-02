-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    related_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    type text NOT NULL CHECK (type IN ('application', 'report', 'marketplace', 'message')),
    description text NOT NULL,
    status text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX activity_log_user_id_idx ON activity_log(user_id);
CREATE INDEX activity_log_related_user_id_idx ON activity_log(related_user_id);
CREATE INDEX activity_log_created_at_idx ON activity_log(created_at DESC);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own activity"
    ON activity_log FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id 
        OR auth.uid() = related_user_id
        OR EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (role = 'NNECFA Admin' OR role = 'NNECFA Official')
        )
    );

-- Create function to automatically log activities
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
    activity_type text;
    activity_description text;
    related_id uuid;
BEGIN
    -- Determine activity type and description based on the table and operation
    CASE TG_TABLE_NAME
        WHEN 'plot_applications' THEN
            activity_type := 'application';
            IF TG_OP = 'INSERT' THEN
                activity_description := 'Submitted new plot application';
            ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
                activity_description := 'Plot application status changed to ' || NEW.status;
                -- For status updates, related_user_id would be the officer who reviewed it
                related_id := NEW.reviewed_by;
            END IF;
            
        WHEN 'crop_reports' THEN
            activity_type := 'report';
            IF TG_OP = 'INSERT' THEN
                activity_description := 'Submitted new crop report';
            ELSIF TG_OP = 'UPDATE' THEN
                activity_description := 'Updated crop report';
            END IF;
            
        WHEN 'marketplace_listings' THEN
            activity_type := 'marketplace';
            IF TG_OP = 'INSERT' THEN
                activity_description := 'Created new marketplace listing: ' || NEW.title;
            ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
                activity_description := 'Updated marketplace listing status: ' || NEW.title;
            END IF;
    END CASE;

    -- Only insert if we have an activity to log
    IF activity_description IS NOT NULL THEN
        INSERT INTO activity_log (
            user_id,
            related_user_id,
            type,
            description,
            status,
            metadata
        ) VALUES (
            CASE TG_OP
                WHEN 'INSERT' THEN NEW.user_id
                WHEN 'UPDATE' THEN NEW.user_id
                ELSE OLD.user_id
            END,
            related_id,
            activity_type,
            activity_description,
            CASE 
                WHEN TG_TABLE_NAME = 'plot_applications' THEN NEW.status
                WHEN TG_TABLE_NAME = 'marketplace_listings' THEN NEW.status
                ELSE NULL
            END,
            jsonb_build_object(
                'table', TG_TABLE_NAME,
                'operation', TG_OP,
                'record_id', NEW.id
            )
        );
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for activity logging
CREATE TRIGGER log_plot_applications_activity
    AFTER INSERT OR UPDATE
    ON plot_applications
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_crop_reports_activity
    AFTER INSERT OR UPDATE
    ON crop_reports
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_marketplace_listings_activity
    AFTER INSERT OR UPDATE
    ON marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Add location column to marketplace_listings table
ALTER TABLE marketplace_listings
ADD COLUMN location text NOT NULL DEFAULT ''; 