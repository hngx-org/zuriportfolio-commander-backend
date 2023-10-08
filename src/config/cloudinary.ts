import { v2 as cloudinary } from "cloudinary";
import ENV from "./env";

const mediaUploadLib = cloudinary.config({
  cloud_name: ENV.cloudinary.name,
  api_key: ENV.cloudinary.apiKey,
  api_secret: ENV.cloudinary.apiSecret,
});

export default mediaUploadLib;
