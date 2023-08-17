import axios from "axios";
import config from "../config";

export const instance = axios.create({
  baseURL: config.NEXT_OPPORTUNITY_SERVER_URL,
  headers: { "Content-Type": "application/json" }
});
