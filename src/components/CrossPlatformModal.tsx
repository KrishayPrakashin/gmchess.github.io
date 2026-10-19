import React, { useState } from 'react';
import { X, Smartphone, Monitor, Globe, Terminal, ShieldCheck, Download, ExternalLink } from 'lucide-react';

interface CrossPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrossPlatformModal: React.FC<CrossPlatformModalProps> = ({ isOpen, onClose }) => {
  const [activePlatform, setActivePlatform] = useState<'pwa' | 'android' | 'ios' | 'desktop'>('pwa');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Cross-Platform Ecosystem & Packaging
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              One unified TypeScript/React codebase distributed across 6 major platforms
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector */}
        <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActivePlatform('pwa')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activePlatform === 'pwa'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web (PWA)</span>
          </button>
          <button
            onClick={() => setActivePlatform('android')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activePlatform === 'android'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActivePlatform('ios')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activePlatform === 'ios'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iOS / iPad</span>
          </button>
          <button
            onClick={() => setActivePlatform('desktop')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activePlatform === 'desktop'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Win / Mac / Linux</span>
          </button>
        </div>

        {/* Platform Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-300 font-sans">
          {activePlatform === 'pwa' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="font-bold text-emerald-400 mb-1">Active & Ready in Browser</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Grandmaster Chess is compiled with a full Web App Manifest, auto-updating service worker, and offline precaching via <code className="text-amber-300">vite-plugin-pwa</code>.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-white">Installation Instructions:</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong>Desktop Chrome / Edge:</strong> Click the "Install App" button in the top navigation or the browser address bar icon.</li>
                  <li><strong>Android Chrome:</strong> Tap "Install App" or "Add to Home Screen".</li>
                  <li><strong>iOS Safari:</strong> Tap Share ➔ "Add to Home Screen".</li>
                </ul>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400">
                # Production Web Build:<br />
                <span className="text-amber-400">npm run build</span>
              </div>
            </div>
          )}

          {activePlatform === 'android' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-amber-300 mb-1">Capacitor Android Packaging</h4>
                <p className="text-slate-400 text-xs">
                  Packages the responsive web client directly into a native Android Studio project with full offline hardware acceleration and touch gestures.
                </p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <p className="text-slate-500"># 1. Install Capacitor CLI & Core</p>
                <p className="text-amber-300">npm install @capacitor/core @capacitor/cli @capacitor/android</p>
                <p className="text-slate-500 mt-2"># 2. Build web assets & sync</p>
                <p className="text-amber-300">npm run build && npx cap add android && npx cap sync</p>
                <p className="text-slate-500 mt-2"># 3. Open in Android Studio & Generate APK / AAB</p>
                <p className="text-amber-300">npx cap open android</p>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Note: Building an unsigned APK or Google Play AAB requires the Android SDK / Android Studio on your local development machine.
              </p>
            </div>
          )}

          {activePlatform === 'ios' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-amber-300 mb-1">Capacitor iOS (iPhone & iPad) Packaging</h4>
                <p className="text-slate-400 text-xs">
                  Native iOS Xcode project packaging supporting iPhone safe areas, iPad split-view, and haptic touch.
                </p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <p className="text-slate-500"># 1. Add iOS native platform</p>
                <p className="text-amber-300">npm install @capacitor/ios</p>
                <p className="text-amber-300">npm run build && npx cap add ios && npx cap sync</p>
                <p className="text-slate-500 mt-2"># 2. Open in Xcode</p>
                <p className="text-amber-300">npx cap open ios</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-slate-300 text-[11px]">
                <strong>Apple Signing Requirement:</strong> iOS compilation, simulator testing, and App Store IPA generation requires macOS with Xcode and an active Apple Developer Certificate.
              </div>
            </div>
          )}

          {activePlatform === 'desktop' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-amber-300 mb-1">Desktop Apps via Tauri / Electron</h4>
                <p className="text-slate-400 text-xs">
                  High-performance desktop binaries for Windows (.msi / .exe), macOS (.dmg / .app), and Linux (.AppImage / .deb) with native menu integration and window state persistence.
                </p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <p className="text-slate-500"># Option A: Lightweight Tauri Build (Rust-backed, tiny ~8MB installer)</p>
                <p className="text-amber-300">npm run tauri build</p>
                <p className="text-slate-500 mt-2"># Option B: Electron Cross-Compiler</p>
                <p className="text-amber-300">npx electron-builder --win --mac --linux</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-[11px] text-slate-500 font-mono">
            Shared Engine · Chess.js · Web Audio API · IndexedDB
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
