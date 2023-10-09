// import cloudinary from 'cloudinary';
const cloudinary = require('cloudinary').v2;
import ENV from './env';

const clurdinary = cloudinary.config({
  cloud_name: ENV.cloudinary.name,
  api_key: ENV.cloudinary.apiKey,
  api_secret: ENV.cloudinary.apiSecret,
});

export default clurdinary;
