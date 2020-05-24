const Room = require("./models/room");
const Chatter = require("./models/chatter");
const User = require("./models/user");
const Message = require("./models/message");

module.exports = function (socket) {
  socket.on("signin", async (data) => {
    const chatters = await Chatter.find({ user: data.user });
    const roomIds = chatters.map((chatter) => chatter.room);
    const rooms = await Room.aggregate([
      { $match: { _id: { $in: roomIds } } },
      {
        $lookup: {
          from: Message.collection.name,
          localField: "_id",
          foreignField: "room",
          as: Message.collection.name,
        },
      },
    ]);
    for (const room of rooms) {
      if (room.isPrivate) {
        const counterpart = await Chatter.findOne(
          {
            room: room._id,
            user: { $ne: data.user },
          },
          "user"
        ).populate("user");
        room.counterpart = counterpart.user._id;
        room.name = counterpart.user.name;
      }
      room.pointer = chatters.find(
        (chatter) =>
          chatter.room.equals(room._id) && chatter.user.equals(data.user)
      ).pointer;
    }
    socket.emit("load", rooms);
    rooms.forEach((room) => socket.join(room._id));
    socket.join(data.user);
  });

  socket.on("contact", async (data) => {
    const room = new Room({
      name: null,
      isPrivate: true,
    });
    room.save();
    Chatter.create({ room: room._id, user: data.from });
    Chatter.create({ room: room._id, user: data.to });
    const userFrom = await User.findById(data.from);
    const userTo = await User.findById(data.to);
    socket.emit("contact", {
      _id: room._id,
      isPrivate: room.isPrivate,
      name: userTo.name,
      counterpart: data.to,
      messages: [],
      pointer: -1,
    });
    socket.to(data.to).emit("contact", {
      _id: room._id,
      isPrivate: room.isPrivate,
      name: userFrom.name,
      counterpart: data.from,
      messages: [],
      pointer: -1,
    });
  });

  socket.on("join", (data) => {
    socket.join(data._id);
  });

  socket.on("message", (data) => {
    const message = new Message(data);
    message.save();
    socket.emit("message", message);
    socket.to(data.room).emit("message", message);
  });

  socket.on("read", (data) => {
    Chatter.findOneAndUpdate(
      { room: data.room, user: data.user },
      { pointer: data.pointer }
    ).exec();
  });
};
