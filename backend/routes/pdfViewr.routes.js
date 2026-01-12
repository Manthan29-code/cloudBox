// server.js or routes/pdf.js
const express = require('express');
const router = express.Router();
const axios = require('axios'); // npm install axios
const { verifyJWT } = require("../middleware/auth.middleware")

router.get('/api/proxy-pdf', verifyJWT ,  async (req, res) => {
    try {
        const { url } = req.query;

        // Validate URL (security measure)
        if (!url) {
            return res.status(400).json({ error: 'PDF URL is required' });
        }

        try {
            new URL(url)
        } catch {
            return res.status(400).json({ error: 'Invalid URL' })
        }

        // Fetch the PDF from the external server
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer', // Important for binary data
            timeout: 30000, // 30 second timeout
            headers: {
                'User-Agent': 'Mozilla/5.0' // Some servers require this
            }
        });

        if (response.headers['content-disposition']) {
            res.set(
                'Content-Disposition',
                response.headers['content-disposition']
            )
        }


        // Set proper headers for PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': response.data.length,
            // 'Access-Control-Allow-Origin': '*', // Allow all origins
            // 'Access-Control-Allow-Methods': 'GET',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        });

        // Send the PDF data
        res.send(response.data);

    } catch (error) {
        console.error('Proxy error:', error.message);

        if (error.response) {
            // The external server responded with an error
            res.status(error.response.status).json({
                error: `External server error: ${error.response.statusText}`
            });
        } else if (error.request) {
            // Request was made but no response received
            res.status(504).json({
                error: 'Unable to reach the PDF server'
            });
        } else {
            // Something else went wrong
            res.status(500).json({
                error: `Proxy error: ${error.message}`
            });
        }
    }
});

module.exports = router;