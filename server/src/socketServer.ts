import { Server, Socket } from "socket.io";
import { Express } from "express";

type Message = {
  _id: string;
  content: string;
  timestamp: string;
  user: string;
  username: string;
  channel: string;
  isNotification: boolean;
  file: {
    _id: string;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
  };
  deleted: boolean;
};

export default function socketServer(app: Express, httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  /* Listen for new connections */
  io.on("connection", (socket: Socket) => {
    console.log(`[Websocket] A user has connected.`);
    /* Listen for join-room events */
    socket.on("join-room", ({ channelId }) => {
      socket.join(channelId);
      console.log(`[Websocket] A user has joined channel ${channelId}.`);
    });

    /* Listen for new messages */
    socket.on("new-message", (data: Message) => {
      const { channel } = data;
      console.log(`[Websocket] Received new message in channel ${channel}.`);
      socket.to(channel).emit("new-message", data);
      /* Also send the message to the sender */
      socket.emit("new-message", data);
      console.log(
        `[Websocket] Sent new message to all clients online in channel ${channel}.`
      );
    });

    /* Listen for add-member events */
    socket.on("add-member", (data) => {
      const { channel, newMember } = data;
      console.log(
        `[Websocket] Received add-member event for new member ${newMember} in channel ${channel}.`
      );
      // socket.to(channel).emit("add-member", data);
      socket.emit("add-member", data);
      /* Also send the message to the sender */
      socket.emit("add-member", data);
      console.log(
        `[Websocket] Sent add-member event to all clients online in channel ${channel}.`
      );
    });

    /* Listen for make-admin events */
    socket.on("make-admin", (data) => {
      const { channel, newAdmin } = data;
      console.log(
        `[Websocket] Received make-admin event for new admin ${newAdmin} in channel ${channel}.`
      );
      socket.to(channel).emit("make-admin", data);
      /* Also send the message to the sender */
      socket.emit("make-admin", data);
      console.log(
        `[Websocket] Sent make-admin event to all clients online in channel ${channel}.`
      );
    });

    /* Listen for remove-admin events */
    socket.on("remove-admin", (data) => {
      const { channel, removedAdmin } = data;
      console.log(
        `[Websocket] Received remove-admin event for new admin ${removedAdmin} in channel ${channel}.`
      );
      socket.to(channel).emit("remove-admin", data);
      /* Also send the message to the sender */
      socket.emit("remove-admin", data);
      console.log(
        `[Websocket] Sent remove-admin event to all clients online in channel ${channel}.`
      );
    });

    /* Listen for remove-member events */
    socket.on("remove-member", (data) => {
      const { channel, removedMember } = data;
      console.log(
        `[Websocket] Received remove-member event for removed member ${removedMember} in channel ${channel}.`
      );
      socket.to(channel).emit("remove-member", data);
      /* Also send the message to the sender */
      socket.emit("remove-member", data);
      console.log(
        `[Websocket] Sent remove-member event to all clients online in channel ${channel}.`
      );
    });

    /* Listen for delete messages */
    socket.on("delete-message", (data) => {
      const { channelId, messageId } = data;
      console.log(
        `[Websocket] Received delete message in channel ${channelId}.`
      );
      socket.to(channelId).emit("delete-message", messageId);
      /* Also send the message to the sender */
      socket.emit("delete-message", messageId);
      console.log(
        `[Websocket] Sent delete message to all clients online in channel ${channelId}.`
      );
    });

    /* Listen for leave-room events */
    socket.on("leave-room", ({ channelId }) => {
      socket.leave(channelId);
      console.log(`[Websocket] A user has left channel ${channelId}.`);
    });

    /* Listen for disconnections */
    socket.on("disconnect", () => {
      console.log(`[Websocket] A user has disconnected.`);
    });
  });
}
