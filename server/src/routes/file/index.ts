import express from "express";
import fileDeleteRouter from "./fileDelete.routes";
import fileDownloadRouter from "./fileDownload.routes";
import fileUploadRouter from "./fileUpload.routes";

const fileRouter = express.Router();

fileRouter.use("/", fileUploadRouter);
fileRouter.use("/", fileDownloadRouter);
fileRouter.use("/", fileDeleteRouter);

export default fileRouter;
