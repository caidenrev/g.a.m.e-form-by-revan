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
 * Get optimized URL with custom quality
 * @param url - Original Cloudinary URL
 * @param quality - Quality level: 'low' | 'medium' | 'high' | 'ultra'
 * @param width - Optional width
 */
export function getOptimizedUrl(
  url: string, 
  quality: 'low' | 'medium' | 'high' | 'ultra' = 'medium',
  width?: number
): string {
  const qualityMap = {
    low: 60,
    medium: 80,
    high: 90,
    ultra: 95
  };

  return optimizeCloudinaryUrl(url, {
    width: width || 800,
    crop: 'limit',
    quality: qualityMap[quality],
    format: 'auto'
  });
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