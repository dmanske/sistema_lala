-- Migration: Create client-photos storage bucket
-- Description: Creates a public bucket for storing client profile photos
-- Date: 2026-02-12

-- Create the storage bucket for client photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'client-photos',
    'client-photos',
    true,
    2097152, -- 2MB in bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload their own photos
CREATE POLICY "Users can upload client photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'client-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow authenticated users to update their own photos
CREATE POLICY "Users can update their client photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'client-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their client photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'client-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow public read access to all photos
CREATE POLICY "Public can view client photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'client-photos');
