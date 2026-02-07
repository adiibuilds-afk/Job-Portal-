const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const LOGO_SIZE = 80;

/**
 * Downloads an image, resizes it to a square (with white background padding),
 * and saves it as a WebP file.
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

        const uploadDir = path.join(__dirname, '../../public/uploads/logos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const slugifiedName = companyName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 30);

        const filename = `${slugifiedName}-${Date.now()}.webp`;
        const filePath = path.join(uploadDir, filename);

        await sharp(response.data)
            .resize(LOGO_SIZE, LOGO_SIZE, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .webp({ quality: 80 })
            .toFile(filePath);

        return `/uploads/logos/${filename}`;
    } catch (error) {
        console.error(`   ❌ Logo processing failed: ${error.message}`);
        return null;
    }
};

module.exports = { downloadAndProcessLogo };
