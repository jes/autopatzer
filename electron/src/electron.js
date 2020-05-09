const { app, BrowserWindow } = require("electron");

const path = require("path");
const url = require("url");

const startUrl =
  process.env.ELECTRON_START_URL ||
  url.format({
    pathname: path.join(__dirname, "/../build/index.html"),
    protocol: "file:",
    slashes: true,
  });

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 480,
    frame: true,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
    },
    fullscreen: process.env.ELECTRON_FULLSCREEN == '1' ? true : false,
  });

  mainWindow.loadURL(startUrl);

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
};

app.allowRendererProcessReuse = true;

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});
