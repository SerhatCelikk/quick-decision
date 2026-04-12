-- ============================================================
-- Migration: 20260412000004_storage.sql
-- Description: Supabase Storage bucket configuration for media assets
-- ============================================================

-- Create storage bucket for game assets (category icons, level badges, avatars)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'game-assets',
    'game-assets',
    TRUE,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for user avatars (private until user makes it public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    TRUE,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Storage RLS Policies
-- ============================================================

-- game-assets: public read access
CREATE POLICY "game_assets_public_read"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'game-assets');

-- game-assets: only service role can upload/update/delete
CREATE POLICY "game_assets_service_write"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'game-assets'
        AND auth.role() = 'service_role'
    );

CREATE POLICY "game_assets_service_update"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'game-assets'
        AND auth.role() = 'service_role'
    );

CREATE POLICY "game_assets_service_delete"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'game-assets'
        AND auth.role() = 'service_role'
    );

-- avatars: public read
CREATE POLICY "avatars_public_read"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');

-- avatars: authenticated users can upload their own avatar
-- File path convention: avatars/{user_id}/avatar.{ext}
CREATE POLICY "avatars_user_upload"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "avatars_user_update"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "avatars_user_delete"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );
