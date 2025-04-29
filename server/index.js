import express from "express";
import { Server } from "socket.io";
import { ACTIONS } from "./Actions.js";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const server = createServer(app);

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://coding-capsule.onrender.com"],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
};

io.on("connection", (socket) => {
  // console.log('Socket connected', socket.id);
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    // notify that new user join
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // sync the code
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });
  // when new user join the room all the code which are there are also shows on that persons editor
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // leave room
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    // leave all the room
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const JUDGE0_API =
  "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";

const LANGUAGE_MAP = {
  javascript: 63,
  python: 71,
  c: 50,
  cpp: 54,
  java: 62,
  typescript: 74,
  ruby: 72,
  go: 60,
  php: 68,
};

app.post("/compile", async (req, res) => {
  let { language } = req.body;
  let { code } = req.body;

  if (!language) {
    language = "javascript";
  }

  //Judge0 always compiles Java code like javac Main.java internally, so we need to normalize
  function normalizeJavaCode(code) {
    //Match the class name using regex
    const match = code.match(/class\s+([A-Za-z_]\w*)\s*/);
    if (match) {
      const originalClass = match[1];
      // Replace class name with 'Main'
      return code.replace(new RegExp(`\\b${originalClass}\\b`, "g"), "Main");
    }
    return code; // if no class found, return as-is
  }
  if (language === "java") {
    code = normalizeJavaCode(code);
  }

  const languageId = LANGUAGE_MAP[language];

  if (!languageId) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  try {
    const submission = await fetch(JUDGE0_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": "6b0195e3d8mshdf7be554565bd24p1a0709jsn225ea4fef34e",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
      }),
    });

    const submissionData = await submission.json();

    return res.json({
      output: submissionData.stdout || submissionData.stderr,
      error: submissionData.compile_output || null,
      status: submissionData.status.description,
    });
  } catch (err) {
    console.error("Error compiling code:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
