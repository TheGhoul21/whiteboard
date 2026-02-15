# Install Whiteboard Desktop

The desktop app is built with **Tauri**. It's lightweight, fast, and optimized for screen recording.

## 1. Download

Visit the [GitHub Releases page](https://github.com/TheGhoul21/whiteboard/releases) and grab the installer for your system:

- **macOS:** `whiteboard-macos-universal.dmg` (Works on both Intel and M1/M2/M3)
- **Windows:** `whiteboard-windows-x64.msi`
- **Linux:** `whiteboard-linux-x64.AppImage`

---

## 2. Quick Install

::: tabs

== macOS
1. Open the `.dmg` file.
2. Drag **Whiteboard** to your **Applications** folder.
3. **Crucial:** Right-click the app and choose **Open** the first time (to bypass Apple's unsigned app warning).

== Windows
1. Run the `.msi` installer.
2. Follow the 3-step wizard.
3. Launch from the Start Menu.

== Linux
1. Right-click the `.AppImage` → **Properties** → **Permissions**.
2. Check **"Allow executing file as program"**.
3. Double-click to run.

:::

---

## 3. First Launch Checklist

Once you open the app, ensure everything is ready for recording:

1. **Open Presentation Window:** Click the button in the bottom-right.
2. **Test Sync:** Draw something in the main window; it should appear instantly in the second one.
3. **OBS Setup:**
   - Add a **Window Capture** source in OBS.
   - Select the **"Whiteboard - Presentation"** window.
   - You now have a clean recording area without any toolbars!

---

## Troubleshooting

- **"App is damaged" (macOS):** Run `xattr -cr /Applications/Whiteboard.app` in your terminal.
- **Windows Defender:** Click "More info" → "Run anyway".
- **Linux missing libraries:** Install `libwebkit2gtk-4.1-0` and `libayatana-appindicator3-1`.

[Set up OBS Integration →](/desktop/obs-integration)
