// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Document = require("./Document");

const app = express();
app.use(cors());
const server = http.createServer(app);

// Define a basic GET route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// MongoDB connection and Socket.IO logic...
mongoose.connect("mongodb://localhost:27017/realtime-doc", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

const findOrCreateDocument = async (id) => {
  if (!id) return;
  const doc = await Document.findById(id);
  if (doc) return doc;
  return await Document.create({ _id: id, data: "" });
};

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
