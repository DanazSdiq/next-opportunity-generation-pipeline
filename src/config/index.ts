import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default {
  HEADLESS: process.env.HEADLESS || "",

  NEXT_OPPORTUNITY_SERVER_URL: process.env.NEXT_OPPORTUNITY_SERVER_URL || ""
};
