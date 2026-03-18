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
  params.push(`q_${quality}`);
  
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
  // Profile photos - kecil, bulat
  profile: (url: string) => optimizeCloudinaryUrl(url, {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto'
  }),

  // Blog thumbnails - medium size
  blogThumbnail: (url: string) => optimizeCloudinaryUrl(url, {
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto'
  }),

  // Blog content images - large but optimized
  blogContent: (url: string) => optimizeCloudinaryUrl(url, {
    width: 1200,
    crop: 'limit',
    quality: 'auto',
    format: 'auto'
  }),

  // Member cards - medium size
  memberCard: (url: string) => optimizeCloudinaryUrl(url, {
    width: 300,
    height: 225,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'auto'
  }),

  // Gallery images - optimized for viewing
  gallery: (url: string) => optimizeCloudinaryUrl(url, {
    width: 800,
    height: 600,
    crop: 'limit',
    quality: 'auto',
    format: 'auto'
  })
};

/**
 * Validasi ukuran file sebelum upload
 * @param file - File yang akan diupload
 * @param maxSizeMB - Maksimal ukuran dalam MB (default: 2MB)
 * @returns boolean
 */
export function validateFileSize(file: File, maxSizeMB: number = 2): boolean {
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