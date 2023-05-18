const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const fs = require("fs");
const { Server } = require("socket.io");
const config = require("./data.json");

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    console.log(`User with ID: ${socket.id} with message: ${data}`);
    console.log("user info updated === ", JSON.stringify(data));
    console.log("io.sockets.in(data.room) ==== ", io.sockets.in(data.room));
    socket.broadcast.emit("receive_message", data);
    // io.sockets.in(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

app.get("/posts", (req, res, next) => {
  res.json(config);
});

app.post("/posts", (req, res) => {
  const { title, id } = req.body;
  const index = config.findIndex((item) => item.id === id);
  const list = [
    ...config.slice(0, index),
    { ...config[index], title },
    ...config.slice(index + 1),
  ];
  // res.json(list);
  const fileData = JSON.stringify(list);
  fs.writeFile(`./data.json`, fileData, (err) => {
    if (err) console.log(err);
    else {
      console.log("File written successfully\n");
      // console.log("The written has the following contents:");
      // console.log(fs.readFileSync("./data.json", "utf8"));
    }
    res.json(list);
  });
  // <==== req.body will be a parsed JSON object
});

server.listen(3001, () => {
  console.log("Server Running");
});
