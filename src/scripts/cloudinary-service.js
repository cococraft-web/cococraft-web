/**
 * COCO CRAFT EXPORTS — CLOUDINARY MEDIA SERVICE
 * Handles client-side direct uploads to Cloudinary and registers metadata in Firestore
 */

import { saveDocument, deleteDocument, getCloudinarySettings } from './firebase-service.js';

// Production Cloudinary credentials via environment variables
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

export const DEFAULT_CLOUDINARY_CONFIG = {
  cloudName: env.VITE_CLOUDINARY_CLOUD_NAME || 'xbs3vpz1',
  uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET || 'Cococrafts',
  folder: env.VITE_CLOUDINARY_FOLDER || 'Coco/Images'
};

/**
 * Fetch current Cloudinary configuration from Firestore or fallback
 */
export async function getActiveCloudinaryConfig() {
  try {
    const saved = await getCloudinarySettings();
    if (saved && saved.cloudName && saved.uploadPreset) {
      return saved;
    }
  } catch (_) {}
  return DEFAULT_CLOUDINARY_CONFIG;
}

/**
 * Validate media file before upload
 */
export function validateMediaFile(file, allowedTypes = ['image', 'video']) {
  if (!file) return { valid: false, error: 'No file selected.' };

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    return { valid: false, error: 'Unsupported file format. Please upload an image (JPG, PNG, WebP) or video (MP4, WebM).' };
  }

  if (isImage && !allowedTypes.includes('image')) {
    return { valid: false, error: 'Images not allowed for this field.' };
  }

  if (isVideo && !allowedTypes.includes('video')) {
    return { valid: false, error: 'Videos not allowed for this field.' };
  }

  // Max 10MB for images, 100MB for videos
  const maxImageBytes = 10 * 1024 * 1024;
  const maxVideoBytes = 100 * 1024 * 1024;

  if (isImage && file.size > maxImageBytes) {
    return { valid: false, error: 'Image exceeds maximum limit of 10 MB.' };
  }

  if (isVideo && file.size > maxVideoBytes) {
    return { valid: false, error: 'Video exceeds maximum limit of 100 MB.' };
  }

  return { valid: true, resourceType: isVideo ? 'video' : 'image' };
}

/**
 * Upload asset to Cloudinary and store metadata in Firestore
 */
export async function uploadToCloudinary(file, onProgress = null) {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const config = await getActiveCloudinaryConfig();
  const resourceType = validation.resourceType;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  if (config.folder) {
    formData.append('folder', config.folder);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          const assetData = {
            cloudinaryPublicId: res.public_id,
            secureUrl: res.secure_url,
            resourceType: res.resource_type,
            format: res.format,
            width: res.width || 0,
            height: res.height || 0,
            fileSize: res.bytes,
            originalFilename: file.name,
            duration: res.duration || null,
            createdAtIso: new Date().toISOString()
          };

          // Store asset in Firestore 'media' collection
          const savedDoc = await saveDocument('media', null, assetData, true);
          assetData.id = savedDoc.id;

          resolve(assetData);
        } catch (parseErr) {
          reject(new Error('Failed to parse Cloudinary response: ' + parseErr.message));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || 'Cloudinary upload failed'));
        } catch (_) {
          reject(new Error(`Upload failed with status code ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during media upload. Check Cloudinary settings.'));
    };

    xhr.send(formData);
  });
}
