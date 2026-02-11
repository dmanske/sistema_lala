/**
 * Storage helper for client photos
 * 
 * Bucket: client-photos
 * Path convention: {tenantId}/{clientId}/avatar.{ext}
 */

import { createClient } from '@/lib/supabase/client';

const BUCKET = 'client-photos';

export type UploadResult = {
    url: string;
    path: string;
};

async function getTenantId(): Promise<string> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        throw new Error('Failed to fetch user profile for tenant context');
    }

    return profile.tenant_id;
}

/**
 * Upload a client photo to Supabase Storage
 */
export async function uploadClientPhoto(
    clientId: string,
    file: File,
    tenantId?: string
): Promise<UploadResult> {
    const supabase = createClient();

    // Resolve tenantId if not provided
    const resolvedTenantId = tenantId || await getTenantId();

    // Get file extension
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowedExts.includes(ext)) {
        throw new Error(`Formato não suportado: .${ext}. Use: ${allowedExts.join(', ')}`);
    }

    // Max 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error('Imagem muito grande. Máximo: 5MB');
    }

    const path = `${resolvedTenantId}/${clientId}/avatar.${ext}`;

    // Delete old photo if exists
    await supabase.storage.from(BUCKET).remove([path]);

    // Upload new photo
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type,
        });

    if (error) throw new Error(`Erro ao enviar foto: ${error.message}`);

    // Get public URL
    const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

    return {
        url: data.publicUrl,
        path,
    };
}

/**
 * Delete a client photo from Supabase Storage
 */
export async function deleteClientPhoto(
    clientId: string,
    tenantId?: string
): Promise<void> {
    const supabase = createClient();

    // Resolve tenantId if not provided
    const resolvedTenantId = tenantId || await getTenantId();

    // Try to remove all possible extensions
    const paths = ['jpg', 'jpeg', 'png', 'webp'].map(
        ext => `${resolvedTenantId}/${clientId}/avatar.${ext}`
    );

    const { error } = await supabase.storage
        .from(BUCKET)
        .remove(paths);

    if (error) {
        // Non-fatal: photo may not exist
        console.warn('Failed to delete client photo:', error.message);
    }
}

/**
 * Get the public URL for a client photo
 * Note: If you need to construct this manually without async tenant fetch, pass tenantId explicitly.
 */
export function getClientPhotoUrl(
    clientId: string,
    ext: string = 'jpg',
    tenantId: string
): string {
    const supabase = createClient();
    // Cannot default to anything safe synchronously. Caller must provide tenantId.
    // If tenantId is missing, url will be invalid/incomplete path which is safer than wrong tenant.
    const path = `${tenantId}/${clientId}/avatar.${ext}`;

    const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

    return data.publicUrl;
}
