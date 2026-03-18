/**
 * Cloudinary URL Optimization Utility
 * Mengoptimalkan gambar untuk menghemat bandwidth dan storage
 */

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'limit' | 'fill' | 'fit' | 'scale';
  gravity?: 'auto' | 'face' | 'center';
}

/**
 * Mengoptimalkan URL Cloudinary dengan parameter kompresi dan resize
 * @param originalUrl - URL asli dari Cloudinary
 * @param options - Opsi optimasi gambar
 * @returns URL yang sudah dioptimalkan
 */
export function optimizeCloudinaryUrl(
  originalUrl: string, 
  options: CloudinaryOptions = {}
): string {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  const {
    width = 800,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    gravity = 'auto'
  } = options;

  // Cari posisi '/upload/' dalam URL
  const uploadIndex = originalUrl.indexOf('/upload/');
  if (uploadIndex === -1) return originalUrl;

  // Split URL menjadi bagian sebelum dan sesudah '/upload/'
  const baseUrl = originalUrl.substring(0, uploadIndex + 8); // +8 untuk '/upload/'
  const imagePath = originalUrl.substring(uploadIndex + 8);

  // Buat parameter optimasi
  const params = [];
  
  // Format dan quality optimization (WAJIB untuk hemat bandwidth)
  params.push(`f_${format}`);
  params.push(`q_${quality === 'auto' ? 'auto:good' : quality}`); // Use auto:good instead of auto
  
  // Resize parameters
  if (width) params.push(`w_${width}`);
  if (height) params.push(`h_${height}`);
  params.push(`c_${crop}`);
  
  // Gravity untuk smart cropping
  if (gravity !== 'center') params.push(`g_${gravity}`);

  // Gabungkan parameter
  const optimizedParams = params.join(',');
  
  return `${baseUrl}${optimizedParams}/${imagePath}`;
}

/**
 * Preset optimasi untuk berbagai use case
 */
export const CloudinaryPresets = {
  // Profile photos - kecil, bulat, kualitas tinggi
  profile: (url: string) => optimizeCloudinaryUrl(url, {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    quality: 90, // Higher quality for profile photos
    format: 'auto'
  }),

  // Profile photos for detail popup - larger, higher quality
  profileDetail: (url: string) => optimizeCloudinaryUrl(url, {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face',
    quality: 95, // Ultra high quality for detail view
    format: 'auto'
  }),

  // Blog thumbnails - medium size, kualitas bagus
  blogThumbnail: (url: string) => optimizeCloudinaryUrl(url, {
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'auto',
    quality: 85, // Good quality for thumbnails
    format: 'auto'
  }),

  // Blog content images - large but optimized, kualitas tinggi
  blogContent: (url: string) => optimizeCloudinaryUrl(url, {
    width: 1200,
    crop: 'limit',
    quality: 90, // High quality for blog content
    format: 'auto'
  }),

  // Member cards - medium size, kualitas bagus
  memberCard: (url: string) => optimizeCloudinaryUrl(url, {
    width: 300,
    height: 225,
    crop: 'fill',
    gravity: 'face',
    quality: 85, // Good quality for member cards
    format: 'auto'
  }),

  // Gallery images - optimized for viewing, kualitas tinggi
  gallery: (url: string) => optimizeCloudinaryUrl(url, {
    width: 800,
    height: 600,
    crop: 'limit',
    quality: 90, // High quality for gallery
    format: 'auto'
  }),

  // High quality preset for important images
  highQuality: (url: string) => optimizeCloudinaryUrl(url, {
    width: 1200,
    crop: 'limit',
    quality: 95, // Very high quality
    format: 'auto'
  })
};

/**
 * Extract public_id from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns public_id or null
 */
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  try {
    // Extract public_id from URL
    // Format: https://res.cloudinary.com/cloud/image/upload/v123456/folder/image.jpg
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) {
      return null;
    }

    // Get everything after version (v123456) or directly after upload
    let publicIdPart = '';
    const afterUpload = parts.slice(uploadIndex + 1);
    
    // Skip version if exists (starts with 'v' followed by numbers)
    const startIndex = afterUpload[0] && /^v\d+$/.test(afterUpload[0]) ? 1 : 0;
    publicIdPart = afterUpload.slice(startIndex).join('/');
    
    // Remove file extension
    return publicIdPart.replace(/\.[^/.]+$/, '');
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Promise<boolean> - Success status
 */
export async function deleteCloudinaryImage(publicId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/cloudinary-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

/**
 * Validasi ukuran file sebelum upload
 * @param file - File yang akan diupload
 * @param maxSizeMB - Maksimal ukuran dalam MB (default: 1MB)
 * @returns boolean
 */
export function validateFileSize(file: File, maxSizeMB: number = 1): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Compress image di client-side sebelum upload
 * @param file - File gambar
 * @param maxWidth - Lebar maksimal
 * @param quality - Kualitas kompresi (0-1)
 * @returns Promise<Blob>
 */
export function compressImage(
  file: File, 
  maxWidth: number = 1200, 
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to compress image'));
        }
      }, 'image/jpeg', quality);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}