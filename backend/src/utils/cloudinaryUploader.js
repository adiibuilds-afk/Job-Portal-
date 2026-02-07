const cloudinary = require('cloudinary').v2;
const axios = require('axios');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image from URL to Cloudinary
 * @param {string} imageUrl - URL of the image to upload
 * @param {string} companyName - Company name for folder organization
 * @returns {string|null} - Cloudinary URL or null on failure
 */
const uploadToCloudinary = async (imageUrl, companyName = 'company') => {
    try {
        if (!imageUrl || !imageUrl.startsWith('http')) return null;

        console.log(`   ☁️  Uploading to Cloudinary: ${imageUrl.substring(0, 50)}...`);

        // Slugify company name for public_id
        const slugifiedName = companyName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 30);

        const publicId = `jobgrid/logos/${slugifiedName}-${Date.now()}`;

        // Upload directly from URL
        const result = await cloudinary.uploader.upload(imageUrl, {
            public_id: publicId,
            folder: 'jobgrid/logos',
            transformation: [
                { width: 80, height: 80, crop: 'pad', background: 'white' },
                { quality: 'auto', fetch_format: 'auto' }
            ],
            resource_type: 'image'
        });

        console.log(`   ✅ Cloudinary upload success: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error(`   ❌ Cloudinary upload failed: ${error.message}`);
        return null;
    }
};

module.exports = { uploadToCloudinary };
