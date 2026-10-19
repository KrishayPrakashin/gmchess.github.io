# Grandmaster Chess: Cross-Platform Build & Distribution Guide

Grandmaster Chess is built on a shared TypeScript + React codebase that compiles into native packages for Web, Android, iOS, Windows, macOS, and Linux.

---

## 1. Web & Progressive Web App (PWA)

### Production Build
```bash
npm run build
```
The output directory is `/dist`. This contains the pre-bundled HTML, JS, CSS, and the auto-generated Service Worker (`sw.js`) and Web App Manifest configured via `vite-plugin-pwa`.

### Web Hosting & PWA Installation
- Upload `/dist` to any static host (Cloud Run, Firebase Hosting, Vercel, Netlify, Cloudflare Pages, AWS S3 / CloudFront).
- **HTTPS is required** by Chromium, iOS Safari, Edge, and Firefox for Service Worker registration and PWA installation.
- Users can install the app directly via the in-app "Install App" button or the browser install prompt.

---

## 2. Android (APK & Google Play AAB)

Android packaging uses **Capacitor** to wrap the responsive web client into a native Android Studio project.

### Prerequisites
- Java JDK 17+
- Android Studio with Android SDK (API Level 33+)

### Build Steps
```bash
# 1. Install Capacitor dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Build production web bundle
npm run build

# 3. Initialize and sync Android project
npx cap add android
npx cap sync android

# 4. Open in Android Studio
npx cap open android
```

### Generating APK and Release Bundle:
In Android Studio:
1. Go to **Build ➔ Generate Signed Bundle / APK**.
2. Select **Android App Bundle** (for Google Play) or **APK** (for direct sideloading).
3. Select your keystore certificate and click **Build Release**.

---

## 3. iOS & iPadOS (Xcode Project & App Store IPA)

### Prerequisites
- macOS machine (required by Apple for iOS toolchains)
- Xcode 15+
- Apple Developer Account with active Signing Certificate & Provisioning Profile

### Build Steps
```bash
# 1. Install Capacitor iOS package
npm install @capacitor/ios

# 2. Build web bundle & generate iOS project
npm run build
npx cap add ios
npx cap sync ios

# 3. Open in Xcode
npx cap open ios
```

### Signing and Archive in Xcode:
1. Select the `App` target and your Apple Team in **Signing & Capabilities**.
2. Set the Bundle Identifier (`com.grandmaster.chess`).
3. Select device target **Any iOS Device (arm64)**.
4. Go to **Product ➔ Archive** to build the signed `.ipa` file for TestFlight and App Store submission.

---

## 4. Windows Desktop (.msi / .exe)

### Option A: Tauri (Recommended, ultra-fast & lightweight)
```bash
# Requires Rust & Visual Studio C++ Build Tools
npm install -D @tauri-apps/cli
npm run tauri build
```
Outputs `.msi` and `.exe` installers in `src-tauri/target/release/bundle/msi/`.

### Option B: Electron
```bash
npm install -D electron electron-builder
npx electron-builder --win
```

---

## 5. macOS Desktop (.dmg / .app)

### Tauri Build:
```bash
npm run tauri build
```
Creates Universal Binary `.dmg` supporting both Apple Silicon (M1/M2/M3/M4) and Intel x64.

*Note for macOS distribution:* App distribution outside the Mac App Store requires Apple Developer ID signing and notarization via `xcrun notarytool`.

---

## 6. Linux Desktop (.AppImage / .deb)

### Tauri Build:
```bash
sudo apt update && sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget file libssl-dev libgtk-3-dev
npm run tauri build
```
Produces `.AppImage` and `.deb` packages in `src-tauri/target/release/bundle/`.

---

## 7. Engine & Offline Architecture
- **Rules Engine:** Standard chess rules executed strictly via `chess.js` (en passant, 3-fold repetition, 50-move rule, stalemate, king safety, castling invariants).
- **Computer Opponent:** Minimax with Alpha-Beta Pruning, PeSTO piece-square evaluation tables, quiescence search, and MVV-LVA move ordering.
- **Audio:** Browser Web Audio API procedural synthesis (zero missing audio files, works 100% offline).
- **Data:** IndexedDB & LocalStorage persistence with automatic fallbacks.
