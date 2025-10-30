require("dotenv").config();
const app = require("./src/app");
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateResponse = require("./src/server/ai-server");

const httpServer = createServer(app);
const FrontendUrl = process.env.FRONTENT_URL;



const io = new Server(httpServer, { 
  cors: {
    origin: FrontendUrl,
  },
});


const chatHistory = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });



socket.on("ai-message", async (data) => {
  console.log("AI message received:", data);
  try {
    chatHistory.push({
      role: "user",
      parts: [{ text: data }]
    });

    const response = await generateResponse(chatHistory);

    chatHistory.push({
      role: "model",
      parts: [{ text: response }]
    });


    socket.emit("ai-message-response", response);
  } catch (err) {
    console.error("AI error:", err);
    socket.emit("ai-message-response", "Sorry, I had trouble responding.");
  }
});


});



httpServer.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});
