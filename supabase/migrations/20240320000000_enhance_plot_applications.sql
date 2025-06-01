-- Add new columns to plot_applications table
ALTER TABLE plot_applications
ADD COLUMN location_preference text,
ADD COLUMN farming_experience text,
ADD COLUMN intended_use text,
ADD COLUMN has_equipment boolean DEFAULT false,
ADD COLUMN farm_group_id uuid REFERENCES farm_groups(id),
ADD COLUMN application_score integer DEFAULT 0;

-- Create an index on application_score for faster sorting
CREATE INDEX idx_plot_applications_score ON plot_applications(application_score);

-- Add a trigger to automatically calculate application score
CREATE OR REPLACE FUNCTION calculate_application_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Base score starts at 0
    NEW.application_score := 0;
    
    -- Add points for complete information
    IF NEW.location_preference IS NOT NULL THEN
        NEW.application_score := NEW.application_score + 10;
    END IF;
    
    IF NEW.farming_experience IS NOT NULL AND length(NEW.farming_experience) > 100 THEN
        NEW.application_score := NEW.application_score + 20;
    END IF;
    
    IF NEW.intended_use IS NOT NULL THEN
        NEW.application_score := NEW.application_score + 10;
    END IF;
    
    IF NEW.has_equipment = true THEN
        NEW.application_score := NEW.application_score + 15;
    END IF;
    
    -- Add points for detailed reason
    IF length(NEW.reason) > 200 THEN
        NEW.application_score := NEW.application_score + 25;
    ELSIF length(NEW.reason) > 100 THEN
        NEW.application_score := NEW.application_score + 15;
    END IF;
    
    -- Add points for farm group association
    IF NEW.farm_group_id IS NOT NULL THEN
        NEW.application_score := NEW.application_score + 20;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to calculate score before insert or update
CREATE TRIGGER tr_calculate_application_score
    BEFORE INSERT OR UPDATE ON plot_applications
    FOR EACH ROW
    EXECUTE FUNCTION calculate_application_score();

-- Add comments for documentation
COMMENT ON COLUMN plot_applications.location_preference IS 'Preferred location for the plot';
COMMENT ON COLUMN plot_applications.farming_experience IS 'Description of applicant''s farming experience';
COMMENT ON COLUMN plot_applications.intended_use IS 'Intended use of the plot (crops, agroforestry, mixed, other)';
COMMENT ON COLUMN plot_applications.has_equipment IS 'Whether the applicant has access to farming equipment';
COMMENT ON COLUMN plot_applications.farm_group_id IS 'Associated farm group ID';
COMMENT ON COLUMN plot_applications.application_score IS 'Automatically calculated application score based on provided information'; 