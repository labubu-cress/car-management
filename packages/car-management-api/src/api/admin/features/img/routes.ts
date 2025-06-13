import { Hono } from "hono";
import * as controller from "./controller";

const img = new Hono();

img.get("/upload-token", controller.getUploadToken);

export default img;
