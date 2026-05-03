/**
 * Media Compression Utilities
 * Compresses images and videos before upload to reduce file size
 */

/**
 * Compress an image file
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width (default 1920)
 * @param {number} maxHeight - Maximum height (default 1080)
 * @param {number} quality - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Convert file to base64 with size limit
 * @param {File} file - The file to convert
 * @param {number} maxSizeMB - Maximum size in MB (default 10)
 * @returns {Promise<string>} Base64 encoded string
 */
export const fileToBase64 = (file, maxSizeMB = 10) => {
  return new Promise((resolve, reject) => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    
    if (file.size > maxSize) {
      reject(new Error(`File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`));
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Get video duration
 * @param {File} file - The video file
 * @returns {Promise<number>} Duration in seconds
 */
export const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    
    video.onerror = () => reject(new Error('Failed to load video'));
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Validate and prepare video file
 * @param {File} file - The video file
 * @param {number} maxSizeMB - Maximum size in MB (default 50)
 * @param {number} maxDurationSeconds - Maximum duration in seconds (default 120)
 * @returns {Promise<File>} Validated video file
 */
export const validateVideo = async (file, maxSizeMB = 50, maxDurationSeconds = 120) => {
  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`Video file is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${maxSizeMB}MB. Please use a shorter or lower quality video.`);
  }
  
  // Check duration
  try {
    const duration = await getVideoDuration(file);
    if (duration > maxDurationSeconds) {
      throw new Error(`Video is too long (${Math.floor(duration)}s). Maximum duration is ${maxDurationSeconds}s.`);
    }
  } catch (error) {
    console.warn('Could not check video duration:', error);
    // Continue anyway if we can't check duration
  }
  
  return file;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
