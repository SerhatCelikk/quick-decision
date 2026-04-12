-- ============================================================
-- Migration: 20260412000003_auth_hooks.sql
-- Description: Auth hooks to sync auth.users with public.users
-- ============================================================

-- Function to handle new user creation
-- Called automatically when a user signs up (including anonymous)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    generated_username TEXT;
BEGIN
    -- Generate a default username if none provided
    generated_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        'player_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)
    );

    INSERT INTO public.users (id, email, username, is_anonymous)
    VALUES (
        NEW.id,
        NEW.email,
        generated_username,
        COALESCE((NEW.raw_user_meta_data->>'is_anonymous')::BOOLEAN, NEW.is_anonymous, FALSE)
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.users WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users delete
CREATE OR REPLACE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_deleted();
