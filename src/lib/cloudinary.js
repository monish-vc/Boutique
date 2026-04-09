/**
 * Cloudinary image upload helper.
 * Uses the unsigned upload API — no backend or SDK required.
 *
 * Required env vars:
 *   VITE_CLOUDINARY_CLOUD_NAME  — your Cloudinary cloud name
 *   VITE_CLOUDINARY_UPLOAD_PRESET — an unsigned upload preset created in your Cloudinary dashboard
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads a File object to Cloudinary and returns the secure HTTPS URL.
 * @param {File} file - The image file to upload
 * @param {object} [options]
 * @param {string} [options.folder] - Optional Cloudinary folder to store images in
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
export async function uploadToCloudinary(file, { folder = 'boutique/products' } = {}) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Missing Cloudinary environment variables. ' +
      'Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Cloudinary upload failed (${res.status})`);
  }

  const data = await res.json();
  return data.secure_url; // full HTTPS URL, ready to store in the DB
}
