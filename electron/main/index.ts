import { app, BrowserWindow, shell, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import {
  initKafka,
  sendMessage,
  subscribe,
  shutdown,
  TOPICS,
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
