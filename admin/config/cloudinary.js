const cloudinary = require('cloudinary').v2;

    // Configuration
    cloudinary.config({ 
        cloud_name: 'dolafjnsm', 
        api_key: '866934494327319', 
        api_secret: 'vwMkwi_k7zzhCy0km5dhr3GdGC4' // Click 'View API Keys' above to copy your API secret
    });
module.exports = cloudinary