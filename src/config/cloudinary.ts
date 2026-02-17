import { v2 as cloudinary } from "cloudinary";
import config from "./config.env";
import logger from "./winston";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});
logger.info("Cloudinary configured successfully", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

export default cloudinary;
