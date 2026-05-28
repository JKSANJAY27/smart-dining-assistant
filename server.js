const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Attach Socket.io server with CORS configured
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socket/io", // Custom path to avoid page conflicts
  });

  const activeUsers = new Map(); // socket.id -> { tableId, name }

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join Table Room
    socket.on("join-table", ({ tableId, name }) => {
      const room = `table:${tableId}`;
      socket.join(room);
      
      activeUsers.set(socket.id, { tableId, name });
      console.log(`👤 Guest "${name}" joined room: ${room}`);

      // Broadcast active user list to the room
      const usersInRoom = Array.from(activeUsers.values())
        .filter((u) => u.tableId === tableId)
        .map((u) => u.name);

      io.to(room).emit("table-users", usersInRoom);
      
      // Notify others
      socket.to(room).emit("user-joined", { name });
    });

    // Sync Cart Actions
    socket.on("cart-item-changed", ({ tableId, action, item, cart }) => {
      const room = `table:${tableId}`;
      console.log(`🛒 Cart change [${action}] in ${room} by socket ${socket.id}`);
      
      // Broadcast cart sync event to all OTHER clients in the room
      socket.to(room).emit("cart-synced", { action, item, cart });
    });

    // Handle Disconnection
    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        const { tableId, name } = user;
        const room = `table:${tableId}`;
        activeUsers.delete(socket.id);
        
        console.log(`❌ Client disconnected: ${name} (${socket.id})`);

        const usersInRoom = Array.from(activeUsers.values())
          .filter((u) => u.tableId === tableId)
          .map((u) => u.name);

        // Update room user list
        io.to(room).emit("table-users", usersInRoom);
        socket.to(room).emit("user-left", { name });
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Smart Dining Server listening at http://${hostname}:${port}`);
  });
});
