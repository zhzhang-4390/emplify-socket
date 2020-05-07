const express = require("express");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const listener = require("./chatService");
if (process.env.NODE_ENV !== "production") {
  require("dotenv/config");
}

const app = express();
const port = process.env.PORT;

const server = app.listen(port, () =>
  console.log(`Emplify socket listening on port ${port}`)
);
const io = socketIO(server);
io.on("connection", listener);

mongoose.connect(
  process.env.DB_CONNECTION,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Emplify DB connected");
    }
  }
);
