import express from "express";
import SearchUserstoAddRouter from "./user-search-for-channel.routes";

const searchRouter = express.Router();

searchRouter.use("/", SearchUserstoAddRouter);

export default searchRouter;
