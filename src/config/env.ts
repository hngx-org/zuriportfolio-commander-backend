import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const ENV = {
  jwtSecret: process.env.JWT_SECRET,
  clientUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://x.com`,
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

export default ENV;
