import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';

// ============================================
// FILE UPLOAD TYPES
// ============================================

export interface Upload {
    id: string;
    user_id: string;
    filename: string;
    file_url: string;
    file_size: number;
    file_type: string;
    thumbnail_url?: string;
    created_at: string;
}

export interface UploadProgress {
    progress: number;
    status: 'uploading' | 'processing' | 'complete' | 'error';
    error?: string;
}

// ============================================
// STORAGE SERVICE
// ============================================

const STORAGE_BUCKET = 'design-uploads';
const AVATARS_BUCKET = 'avatars';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB for avatars
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'image/svg+xml',
    // Design files
    'application/postscript', // AI files
    'image/vnd.adobe.photoshop', // PSD files
];

export const storageService = {
    /**
     * Upload a file to Supabase Storage
     */
    async uploadFile(
        file: File | Blob,
        userId: string,
        onProgress?: (progress: number) => void
    ): Promise<Upload | null> {
        try {
            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
            }

            // Validate file type
            const fileType = file.type;
            if (!ALLOWED_TYPES.includes(fileType)) {
                throw new Error('File type not supported. Please upload PDF, JPG, PNG, AI, or PSD files.');
            }

            // Generate unique filename
            const fileExt = file.name?.split('.').pop() || 'file';
            const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(fileName);

            // Save upload record to database
            const { data: uploadRecord, error: dbError } = await supabase
                .from('uploads')
                .insert({
                    user_id: userId,
                    filename: file.name || 'Untitled',
                    file_url: urlData.publicUrl,
                    file_size: file.size,
                    file_type: fileType,
                })
                .select()
                .single();

            if (dbError) throw dbError;

            return uploadRecord;
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        }
    },

    /**
     * Get all uploads for a user
     */
    async getUserUploads(userId: string): Promise<Upload[]> {
        try {
            const { data, error } = await supabase
                .from('uploads')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching uploads:', error);
            return [];
        }
    },

    /**
     * Delete an upload
     */
    async deleteUpload(uploadId: string, fileUrl: string): Promise<boolean> {
        try {
            // Extract file path from URL
            const urlParts = fileUrl.split('/');
            const filePath = urlParts.slice(-2).join('/'); // userId/filename

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove([filePath]);

            if (storageError) throw storageError;

            // Delete from database
            const { error: dbError } = await supabase
                .from('uploads')
                .delete()
                .eq('id', uploadId);

            if (dbError) throw dbError;

            return true;
        } catch (error) {
            console.error('Error deleting upload:', error);
            return false;
        }
    },

    /**
     * Link upload(s) to an order
     */
    async linkUploadsToOrder(orderId: string, uploadIds: string[]): Promise<boolean> {
        try {
            const orderUploads = uploadIds.map(uploadId => ({
                order_id: orderId,
                upload_id: uploadId,
            }));

            const { error } = await supabase
                .from('order_uploads')
                .insert(orderUploads);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error linking uploads to order:', error);
            return false;
        }
    },

    /**
     * Get uploads for an order
     */
    async getOrderUploads(orderId: string): Promise<Upload[]> {
        try {
            const { data, error } = await supabase
                .from('order_uploads')
                .select(`
          upload_id,
          uploads (*)
        `)
                .eq('order_id', orderId);

            if (error) throw error;

            // Extract uploads from the nested structure
            return data?.map((item: any) => item.uploads).filter(Boolean) || [];
        } catch (error) {
            console.error('Error fetching order uploads:', error);
            return [];
        }
    },

    /**
     * Validate file before upload
     */
    validateFile(file: File): { valid: boolean; error?: string } {
        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
            };
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return {
                valid: false,
                error: 'File type not supported. Please upload PDF, JPG, PNG, AI, or PSD files.',
            };
        }

        return { valid: true };
    },

    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Upload profile avatar image
     */
    async uploadAvatar(
        imageUri: string,
        userId: string,
        oldAvatarUrl?: string | null
    ): Promise<string | null> {
        try {
            console.log('Starting avatar upload for URI:', imageUri);

            // Read the image file using expo-file-system (better for React Native)
            let arrayBuffer: ArrayBuffer;
            let mimeType: string;
            
            try {
                // Get file info first
                const fileInfo = await FileSystem.getInfoAsync(imageUri);
                if (!fileInfo.exists) {
                    throw new Error('Image file not found');
                }
                
                console.log('File info:', fileInfo);

                // Read file as base64
                const base64 = await FileSystem.readAsStringAsync(imageUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                
                // Determine MIME type from URI extension
                const extension = imageUri.split('.').pop()?.toLowerCase().split('?')[0];
                mimeType = extension === 'png' ? 'image/png' : 
                          extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : 
                          'image/jpeg'; // default to jpeg
                
                // Convert base64 to ArrayBuffer (React Native compatible)
                const binaryString = atob(base64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                arrayBuffer = bytes.buffer;
                
                console.log('Image loaded successfully. Size:', arrayBuffer.byteLength, 'Type:', mimeType);
            } catch (fileError: any) {
                console.error('File read error:', fileError);
                throw new Error(`Failed to read image: ${fileError.message}. Please try selecting the image again.`);
            }

            // Validate size
            if (arrayBuffer.byteLength > MAX_AVATAR_SIZE) {
                throw new Error(`Image size exceeds ${MAX_AVATAR_SIZE / 1024 / 1024}MB limit`);
            }

            // Validate type
            if (!mimeType.startsWith('image/')) {
                throw new Error('Please select a valid image file');
            }

            // Delete old avatar if exists
            if (oldAvatarUrl) {
                try {
                    const oldPath = oldAvatarUrl.split('/').pop();
                    if (oldPath) {
                        console.log('Deleting old avatar:', oldPath);
                        await supabase.storage
                            .from(AVATARS_BUCKET)
                            .remove([`${userId}/${oldPath}`]);
                    }
                } catch (deleteError) {
                    console.warn('Failed to delete old avatar:', deleteError);
                    // Continue with upload even if delete fails
                }
            }

            // Generate unique filename
            const fileExt = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
            const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
            console.log('Uploading to:', fileName);

            // Upload to Supabase Storage using ArrayBuffer (React Native compatible)
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(AVATARS_BUCKET)
                .upload(fileName, arrayBuffer, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: mimeType,
                });

            if (uploadError) {
                console.error('Supabase upload error:', uploadError);
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            console.log('Upload successful:', uploadData);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(AVATARS_BUCKET)
                .getPublicUrl(fileName);

            console.log('Avatar uploaded successfully. URL:', urlData.publicUrl);
            return urlData.publicUrl;
        } catch (error: any) {
            console.error('Avatar upload error:', error);
            // Provide user-friendly error messages
            if (error.message.includes('Network request failed')) {
                throw new Error('Network error. Please check your internet connection and try again.');
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('Could not load image. Please try selecting the image again.');
            }
            throw error;
        }
    },

    /**
     * Delete avatar from storage
     */
    async deleteAvatar(avatarUrl: string, userId: string): Promise<boolean> {
        try {
            const fileName = avatarUrl.split('/').pop();
            if (!fileName) return false;

            const { error } = await supabase.storage
                .from(AVATARS_BUCKET)
                .remove([`${userId}/${fileName}`]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Delete avatar error:', error);
            return false;
        }
    },
};
