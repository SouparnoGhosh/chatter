import express from "express";
import getAllMessagesRouter from "./get-messages.routes";
import editMessageRouter from "./edit-message.routes";
import createMessageRouter from "./create-message.routes";
import deleteMessageRouter from "./delete-message.routes";

const messageRouter = express.Router()

messageRouter.use("/", getAllMessagesRouter)
messageRouter.use("/", createMessageRouter)
messageRouter.use("/", editMessageRouter)
messageRouter.use("/", deleteMessageRouter)

export default messageRouter