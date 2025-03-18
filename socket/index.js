const { Server } = require("socket.io");

const initializeSocket = () => {
  const io = new Server(3002, {
    cors: {
      origin: ["https://kku-client.vercel.app", "http://localhost:3000","https://www.kkublogging.com","https://kkublogging.com"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  let onlineUsers = [];

  io.on("connection", (socket) => {
    console.log("new connection", socket.id);

    // เรียกการเชื่อมต่อ
    socket.on("addNewUser", (userId) => {
      !onlineUsers.some((user) => user.userId === userId) &&
        onlineUsers.push({
          userId,
          socketId: socket.id
        });
      io.emit("getOnlineUsers", onlineUsers);
    });

    // เพิ่มข้อความ
    socket.on("sendMessage", (message) => {
      const recipientUser = onlineUsers.find((user) => user.userId === message.recipientId);

      if (recipientUser) {
        const formattedMessage = {
          ...message,
          senderId: message.senderId,
          recipientId: message.recipientId,
          chatId: message.chatId,
          text: message.text,
          createdAt: new Date(),
          isFromSender: false
        };

        io.to(recipientUser.socketId).emit("getMessage", formattedMessage);

        io.to(recipientUser.socketId).emit("getNotification", {
          senderId: message.senderId,
          chatId: message.chatId,
          text: message.text,
          isRead: false,
          createdAt: new Date()
        });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      io.emit("getOnlineUsers", onlineUsers);
    });
  });
};

initializeSocket()
