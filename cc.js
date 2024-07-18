const AWS = require('aws-sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK
const s3 = new AWS.S3({
    accessKeyId: '0083f54a410e4856e5e8',
    secretAccessKey: 'FD1mEDNDTMZjo8LqeGjD3TibcPTXaHcfLmdWsBF1',
    region: 'idn',
    endpoint: 'https://nos.jkt-1.neo.id'
});

// Function to fetch image from URL and upload to S3
const uploadImageToS3 = async (imageUrl, bucketName, key) => {
    try {
        // Fetch the image
        const response = await axios({
            url: imageUrl,
            responseType: 'stream'
        });

        // Upload to S3
        const uploadParams = {
            Bucket: bucketName,
            Key: key,
            Body: response.data,
            ContentType: response.headers['content-type']
        };

        s3.upload(uploadParams, (err, data) => {
            if (err) {
                console.error('Error uploading image:', err);
            } else {
                console.log('Successfully uploaded image:', data.Location);
            }
        });
    } catch (error) {
        console.error('Error fetching image:', error);
    }
};

// Example usage
// const imageUrl = 'https://5ln1h5525y2q.kentut.xyz/data/75107410/7/9db17231f5f92f07576385d7a72fb8d2/yNzp06bwrmnokxT8I5WnhSZl0PXrpGeaY6RFNsSe.jpg'; // Replace with your image URL
// const bucketName = 'komik'; // Replace with your S3 bucket name
// const key = '9db17231f5f92f07576385d7a72fb8d2/yNzp06bwrmnokxT8I5WnhSZl0PXrpGeaY6RFNsSe.jpg'; // Replace with your desired S3 key

return uploadImageToS3();