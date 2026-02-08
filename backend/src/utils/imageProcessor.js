const axios = require('axios');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;

const LOGO_SIZE = 80;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Downloads an image, resizes it, and uploads to Cloudinary.
 * Returns the secure_url.
 */
const downloadAndProcessLogo = async (imageUrl, companyName = 'company') => {
    try {
        if (!imageUrl || !imageUrl.startsWith('http')) return null;

        console.log(`   📥 Processing logo: ${imageUrl}`);
        
        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer',
            timeout: 10000
        });

        const slugifiedName = companyName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 30);

        // Resize
        const buffer = await sharp(response.data)
            .resize(LOGO_SIZE, LOGO_SIZE, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .webp({ quality: 80 })
            .toBuffer();

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'job_portal_logos',
                    public_id: `${slugifiedName}-${Date.now()}`,
                    resource_type: 'image',
                    format: 'webp'
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        console.log(`   ✅ Logo uploaded to Cloudinary: ${uploadResult.secure_url}`);
        return uploadResult.secure_url;

    } catch (error) {
        console.error(`   ❌ Logo processing failed: ${error.message}`);
        // Fallback or just return null
        return null; 
    }
};

module.exports = { downloadAndProcessLogo };
