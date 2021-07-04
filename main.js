const {app, BrowserWindow, Menu, MenuItem, Tray} = require('electron')
const {autoUpdater} = require('electron-updater')

if (!app.requestSingleInstanceLock()) {
    console.log('Failed to require single instance lock. Currently running instance has been notified of this.')
    app.quit()
    process.exit(0) // So no errors or flashing occurs
}

let win;
let tray;
let isQuiting;

function startup() {
    autoUpdater.checkForUpdatesAndNotify();

    win = new BrowserWindow({
        width: 800,
        height: 450,
        icon: __dirname + '/784761219299016744.png',
        title: "Test",
        show: false,
        backgroundColor: "#424242",
        webPreferences: {
            enableRemoteModule: false,
            contextIsolation: true
        }
    })
    win.onerror = (err) => {
        console.log(err)
    }

    const menu = new Menu();
    menu.append(new MenuItem({
        label: "Close",
        accelerator: "Alt+F4",
        click: () => {
            win.close()
        },
        visible: false
    }))
    menu.append(new MenuItem({
        label: "Debug",
        accelerator: "F12",
        click: () => {
            win.webContents.openDevTools()
            win.setResizable(true)
        },
        visible: false
    }))

    tray = new Tray('784761219299016744.png')
    tray.setToolTip('Test')
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Show App', click: function () {
                win.show();
            }
        },
        {
            label: 'Quit', click: function () {
                isQuiting = true;
                app.quit();
            }
        }
    ]));
    tray.on('click', () => {
        win.show();
    })

    win.setMenu(menu)
    win.setMenuBarVisibility(false)
    win.setResizable(false)

    win.loadFile('index.html').then(() =>
        win.webContents.executeJavaScript(`document.getElementById('version').innerText = '${app.getVersion()}'`)
    )

    // region Events
    win.on('close', event => {
        if (!isQuiting) {
            event.preventDefault();
            win.hide();
            event.returnValue = false;
        }
    });
    win.on('closed', () => {
        win = null
    })
    // endregion
}

// noinspection JSCheckFunctionSignatures
app.on('ready', startup)

app.on('before-quit', () => {
    isQuiting = true;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        startup()
    }
})

app.on('second-instance', (event, argv, _) => {
    console.log(`second-instance called with:\n${argv}`)
    if (!win.isVisible())
        win.show()
    if (win.isMinimized())
        win.restore()
    win.focus()
})