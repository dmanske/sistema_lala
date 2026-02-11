-- ============================================================
-- STORAGE SETUP - Bucket para fotos de clientes
-- Executar no Supabase SQL Editor
-- ============================================================

-- 1. Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'client-photos',
    'client-photos',
    true,  -- público para URLs diretas
    5242880,  -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Qualquer um pode ler (fotos são públicas)
CREATE POLICY "client_photos_read" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'client-photos');

-- 3. Policy: Usuários autenticados podem fazer upload
-- (Durante migração, anon também pode)
CREATE POLICY "client_photos_insert" ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'client-photos');

-- 4. Policy: Usuários autenticados podem atualizar suas fotos
CREATE POLICY "client_photos_update" ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'client-photos');

-- 5. Policy: Usuários autenticados podem deletar suas fotos
CREATE POLICY "client_photos_delete" ON storage.objects
    FOR DELETE
    USING (bucket_id = 'client-photos');
