import imageCompression from 'browser-image-compression';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 2;
const COMPRESSION_THRESHOLD_MB = 1;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImage(file: File): ImageValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato inválido. Use JPG, PNG ou WebP.',
    };
  }
  
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.`,
    };
  }
  
  return { valid: true };
}

export async function compressImage(file: File): Promise<File> {
  // Only compress if file is larger than threshold
  if (file.size <= COMPRESSION_THRESHOLD_MB * 1024 * 1024) {
    return file;
  }
  
  const options = {
    maxSizeMB: COMPRESSION_THRESHOLD_MB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
}

export function generateUniqueFileName(originalName: string): string {
  const extension = originalName.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}.${extension}`;
}
