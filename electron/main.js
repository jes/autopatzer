const { app, BrowserWindow } = require('electron');

app.on('ready', function() {
    var mainWindow = new BrowserWindow({
        show: false,
    });
    mainWindow.setFullScreen(true);
    mainWindow.loadFile('index.html');
    mainWindow.show();
});
