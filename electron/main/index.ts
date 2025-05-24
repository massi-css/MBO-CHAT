import { app, BrowserWindow, shell, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

// Store chunks until all parts are received
const fileChunks: {
  [key: string]: {
    chunks: { [key: number]: string };
    totalChunks: number;
    mimeType: string;
    filename: string;
  };
} = {};
import {
  initKafka,
  sendMessage,
  subscribe,
  shutdown,
  TOPICS,
  getActiveUsers,
} from "./services/kafka";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

// Kafka message handler
function handleKafkaMessage(topic: string, message: any) {
  // Handle chunked file messages
  if (message.type === "file" && message.content.isChunked) {
    const { fileId, chunkIndex, totalChunks, data, mimeType, filename } =
      message.content;

    // Initialize file entry if it doesn't exist
    if (!fileChunks[fileId]) {
      fileChunks[fileId] = {
        chunks: {},
        totalChunks,
        mimeType,
        filename,
      };
    }

    // Store this chunk
    fileChunks[fileId].chunks[chunkIndex] = data;

    // Check if we have all chunks
    const receivedChunks = Object.keys(fileChunks[fileId].chunks).length;

    if (receivedChunks === totalChunks) {
      // Reconstruct the complete file
      const sortedChunks = Array.from(
        { length: totalChunks },
        (_, i) => fileChunks[fileId].chunks[i]
      );

      // Combine all chunks
      const completeFile = {
        ...message,
        content: {
          data: sortedChunks.join(""),
          mimeType: fileChunks[fileId].mimeType,
          filename: fileChunks[fileId].filename,
          isChunked: false,
        },
      };

      // Delete the temporary chunks
      delete fileChunks[fileId];

      // Send the complete file to the renderer
      win?.webContents.send("kafka-message", { topic, message: completeFile });
    }
    // Don't send individual chunks to the renderer
    return;
  }

  // Handle regular messages
  win?.webContents.send("kafka-message", { topic, message });
}

// Initialize IPC handlers for Kafka
function initializeKafkaHandlers() {
  // Handle user login and Kafka initialization
  ipcMain.handle("kafka-init", async (_, username: string) => {
    const result = await initKafka(username);
    console.log("user joined", username, result);
    if (result.success) {
      // Subscribe to all topics
      await subscribe(Object.values(TOPICS), handleKafkaMessage);
      // Add global chat to the user's DM list
      if (result.dmList) {
        result.dmList.set("global", "global-chat");
      }
    }
    return result;
  });

  // Handle sending messages
  ipcMain.handle("send-message", async (_, { topic, message }) => {
    try {
      await sendMessage(topic, message);
      console.log("Message sent:", topic, message);
      return { success: true };
    } catch (error: any) {
      console.error("Failed to send message:", error);
      return { success: false, error: error.message };
    }
  });

  // Handle getting active users
  ipcMain.handle("get-active-users", async () => {
    try {
      const dmList = await getActiveUsers();
      // Always add global chat to the list
      dmList.set("global", "global-chat");
      return { success: true, dmList };
    } catch (error: any) {
      console.error("Failed to get active users:", error);
      const emptyList = new Map();
      emptyList.set("global", "global-chat");
      return { success: false, dmList: emptyList };
    }
  });
}

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      devTools: true,
      webSecurity: true,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Initialize Kafka handlers after window creation
  initializeKafkaHandlers();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  // Shutdown Kafka connections before quitting
  shutdown().finally(() => {
    if (process.platform !== "darwin") app.quit();
  });
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// Listen for count messages from renderer
ipcMain.on("count", (event, arg) => {
  console.log("count", arg);
  win?.webContents.send("message", `Received count: ${arg}`);
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
