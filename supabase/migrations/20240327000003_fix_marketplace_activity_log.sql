-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS marketplace_listings_activity_log_trigger ON marketplace_listings;

-- Create or replace the function
CREATE OR REPLACE FUNCTION handle_marketplace_activity() 
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_log (
            user_id,
            type,
            description,
            status
        ) VALUES (
            NEW.vendor_id,
            'marketplace',
            'Created new marketplace listing: ' || NEW.title,
            NEW.status
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- Only log if status changed
        IF OLD.status <> NEW.status THEN
            INSERT INTO activity_log (
                user_id,
                type,
                description,
                status
            ) VALUES (
                NEW.vendor_id,
                'marketplace',
                'Updated listing status for: ' || NEW.title,
                NEW.status
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO activity_log (
            user_id,
            type,
            description,
            status
        ) VALUES (
            OLD.vendor_id,
            'marketplace',
            'Deleted marketplace listing: ' || OLD.title,
            'deleted'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER marketplace_listings_activity_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON marketplace_listings
    FOR EACH ROW
    EXECUTE FUNCTION handle_marketplace_activity(); 