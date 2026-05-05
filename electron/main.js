const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');

let mainWindow;
let phpServer;

function startPhpServer() {
    const backendPath = path.join(__dirname, '..', 'backend');
    
    // Start Laravel server using the local PHP runtime
    phpServer = spawn('php', ['artisan', 'serve', '--port=8000'], {
        cwd: backendPath,
        shell: true
    });

    phpServer.stdout.on('data', (data) => {
        console.log(`PHP: ${data}`);
    });

    phpServer.stderr.on('data', (data) => {
        console.error(`PHP Error: ${data}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // For simplicity in this local tool
        },
        icon: path.join(__dirname, 'icon.png')
    });

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    startPhpServer();

    const opts = {
        resources: ['http://127.0.0.1:8000'],
        timeout: 30000,
    };

    // Wait for Laravel to be ready before showing the window
    waitOn(opts)
        .then(() => {
            createWindow();
        })
        .catch((err) => {
            console.error('Error waiting for PHP server:', err);
            app.quit();
        });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        if (phpServer) phpServer.kill();
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

process.on('exit', () => {
    if (phpServer) phpServer.kill();
});
