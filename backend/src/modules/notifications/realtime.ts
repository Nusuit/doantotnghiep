import { Server } from "socket.io";

let io: Server | null = null;

export function initNotificationServer(server: any) {
  io = new Server(server, {
    cors: { origin: process.env.ALLOWED_ORIGINS?.split(",") },
  });
}

export function sendNotification(userId: string, message: string) {
  if (io) io.to(userId).emit("notification", message);
}
