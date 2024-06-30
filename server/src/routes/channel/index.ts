import express from "express";
import createChannelRouter from "./create-channel.routes";
import channelInfoForMemberRouter from "./channel-info.routes";
import addUserRouter from "./add-member.routes";
import listChannelsRouter from "./list-channels.routes";
import userlistRouter from "./get-user-names.routes";
import getChannelNameRouter from "./get-channel-name.routes";
import leaveChannelRouter from "./leave-channel.routes";
import makeAdminRouter from "./make-admin.routes";
import removeAdminRouter from "./remove-admin.routes";
import removeMemberRouter from "./remove-member.routes";
import isAdminRouter from "./is-user-admin.routes";

const channelRouter = express.Router();

channelRouter.use("/", addUserRouter);
channelRouter.use("/", channelInfoForMemberRouter);
channelRouter.use("/", createChannelRouter);
channelRouter.use("/", getChannelNameRouter);
channelRouter.use("/", isAdminRouter);
channelRouter.use("/", leaveChannelRouter);
channelRouter.use("/", listChannelsRouter);
channelRouter.use("/", makeAdminRouter);
channelRouter.use("/", removeAdminRouter);
channelRouter.use("/", removeMemberRouter);
channelRouter.use("/", userlistRouter);

export default channelRouter;
