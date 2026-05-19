import { z } from "zod";

const envSchema = z.object({
  PORT: z.string(),
  NODE_ENV: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  ORS_API_KEY: z.string(),
  GEOAPIFY_API_KEY: z.string(),
});
const env = envSchema.parse(process.env);
export default env;
