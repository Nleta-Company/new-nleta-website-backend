import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

@Injectable()
export class GalleryStorageService {
    private readonly supabase: SupabaseClient;
    private readonly bucket: string;

    constructor(private readonly config: ConfigService) {
        this.supabase = createClient(
            this.config.getOrThrow<string>('SUPABASE_URL'),
            this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
            },
        );

        this.bucket =
            this.config.get<string>('SUPABASE_GALLERY_BUCKET') || 'website';
    }

    async upload(
        file: Express.Multer.File,
        type: 'PHOTO' | 'VIDEO',
    ): Promise<{
        url: string;
        storageKey: string;
        mimeType: string;
        sizeBytes: number;
        thumbnailUrl: string | null;
    }> {
        try {
            const isImage = file.mimetype.startsWith('image/');
            const isVideo = file.mimetype.startsWith('video/');

            if (
                (type === 'PHOTO' && !isImage) ||
                (type === 'VIDEO' && !isVideo)
            ) {
                throw new Error('File type does not match gallery media type.');
            }

            const extension = extname(file.originalname).toLowerCase();
            const storageKey = `${type.toLowerCase()}/${randomUUID()}${extension}`;

            const { error } = await this.supabase.storage
                .from(this.bucket)
                .upload(storageKey, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            const { data } = this.supabase.storage
                .from("website")
                .getPublicUrl(storageKey);

            console.log("Bucket:", "website");
            console.log("Storage key:", storageKey);
            console.log("Public URL:", data.publicUrl);

            return {
                url: data.publicUrl,
                storageKey,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                // Video thumbnails require a separate thumbnail-generation process.
                thumbnailUrl: null,
            };
        } catch (error) {
            console.error('Supabase gallery upload error:', error);

            throw new InternalServerErrorException(
                'Media storage upload failed.',
            );
        }
    }

    async delete(storageKey: string, _type: 'PHOTO' | 'VIDEO') {
        try {
            const { error } = await this.supabase.storage
                .from(this.bucket)
                .remove([storageKey]);

            if (error) {
                throw error;
            }
        } catch {
            throw new InternalServerErrorException(
                'Could not delete media from storage.',
            );
        }
    }
}