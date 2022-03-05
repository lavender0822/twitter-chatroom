const { User, Chatroom } = require("../models");

let numUsers = 0;
let onlineUser = [];

module.exports = (server) => {
  const io = require("socket.io")(server);

  // 連線錯誤監聽
  io.on("connect_error", (err, next) => {
    console.log(`connect_error due to ${err.message}`);
    next(err);
  });

  // 連線監聽
  io.on("connection", (socket) => {
    // 監聽使用者加入
    socket.on("addUser", async (user) => {
      try {
        socket.user = user;
        // 過濾在線使用者
        const userIdList = onlineUser.map((user) => {
          return user.id;
        });

        // 若使用者不在名單則加入名單
        if (!userIdList.includes(user.id)) {
          onlineUser.push(user);
        }

        ++numUsers;
        // 給自己發送在線人數與名單
        socket.emit("onlineUser", { numUsers, onlineUser });
        // 廣播
        socket.broadcast.emit("userJoin", socket.user);

        const crMsgs = await Chatroom.findAll({
          raw: true,
          nest: true,
          include: [
            { model: User, attributes: ["id", "name", "account", "avatar"] },
          ],
          order: [["createdAt", "ASC"]],
        });
        io.to(socket.id).emit("historyMessage", crMsgs);
      } catch (err) {
        next(err);
      }
    });

    // 公開訊息監聽
    socket.on("sendMessage", async (crMsg) => {
      try {
        // 前端傳來的訊息為空 return
        if (!crMsg.content) return;
        // 取得 sender id
        const senderId = socket.user.id;
        if (!senderId) return;

        const { content } = msg;
        // 新訊息放進資料庫
        let chatroom = await Chatroom.create({
          UserId,
          content,
        });
        const { id } = chatroom;
        chatroom = chatroom.toJSON();
        chatroom = await chatroom.findByPk(id, {
          raw: true,
          nest: true,
          include: [
            {
              model: User,
              attributes: ["id", "name", "account", "avatar"],
            },
          ],
        });

        // 傳新訊息給所有人
        io.sockets.emit("newMessage", message);
      } catch (err) {
        console.log(err);
      }
    });

    // 離線監聽
    socket.on("leavingChatroom", () => {
      // 離開時減少聊天室人數並發送給網頁
      onlineUser = onlineUser.filter((user) => user.id !== socket.user.id);
      io.emit("onlineUser", onlineUser);
      io.emit("userLeave", socket.user);
      console.log("a user left chatroom");
    });
    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  });
};
