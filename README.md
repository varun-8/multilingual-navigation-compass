# 🧭 Multilingual Cyber Compass Application

![Expo SDK 57](https://img.shields.io/badge/Expo-SDK_57-black?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript)
![EAS Build](https://img.shields.io/badge/EAS_Build-Ready-000000?style=for-the-badge&logo=expo)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A commercial-grade real physical sensor compass application built with **React Native**, **TypeScript**, **Expo SDK 57**, and **Native Motion Sensors**. 

Designed with a sleek **Cyber Glassmorphic UI**, **Dynamic Adaptive Filtering**, **Artificial Horizon Level Reticle**, and full **Multilingual Support** (**English**, **Tamil - தமிழ்**, **Hindi - हिन्दी**).

---

## 🌟 Key Features

* **⚡ Physical Motion Sensors**: Directly processes hardware `Magnetometer` & `Accelerometer` data from iOS and Android devices.
* **🎯 Level Bubble & Artificial Horizon Reticle**: Integrated central pitch/roll target bubble that locks emerald green when level ($\le 5^\circ$) for maximum heading precision.
* **🚀 Dynamic Adaptive Velocity-Scaling Filter**: Dynamically scales smoothing alpha ($\alpha = 0.06 \to 0.35$) to ensure zero micro-jitter when holding still while delivering instant, zero-lag response during rapid turns.
* **📐 3D Tilt Compensation**: Computes Roll ($\phi$) and Pitch ($\theta$) gravity vectors to calculate tilt-compensated heading even when holding the device at an angle.
* **🌍 True North vs Magnetic North**: Calculates real-time magnetic declination via device GPS location and World Magnetic Model (WMM) formulas.
* **🌐 Multilingual UI Engine**: Full native translations for **English**, **Tamil (தமிழ்)**, and **Hindi (हिन्दी)** with instant bottom-sheet locale switching and persistent preferences.
* **🔒 Target Bearing Lock**: Lock a target heading angle and monitor real-time angular drift delta (`+24°`, `-10°`).
* **📍 Telemetry & Location Card**: Tabular readout of Latitude, Longitude, Altitude, Declination, and Accuracy with single-tap clipboard copy and native share.
* **🎨 Cyber Glassmorphic Design**: Modern dark mode (`#070A11`) & light mode with glowing cyan accents (`#38BDF8`), neon crimson North markers (`#FF3B30`), and tabular typography (`tabular-nums`).
* **🔄 Interactive Figure-8 Calibration**: Real-time sensor health evaluation with an animated 3D lemniscate guide for recalibration.

---

## 🛠 Tech Stack & Architecture

* **Framework**: React Native / Expo SDK 57 (Continuous Native Generation - CNG)
* **Language**: TypeScript 6.0 (Strict Type Safety)
* **Animation & Rendering**: React Native SVG, Reanimated 4, React Native Worklets
* **Sensors**: `expo-sensors` (Magnetometer, Accelerometer)
* **Location**: `expo-location`
* **Navigation**: `@react-navigation/native-stack`
* **Build System**: Expo Application Services (EAS Cloud) with ProGuard/R8 Minification

### Directory Structure

```text
src/
├── components/
│   ├── CompassDial.tsx           # Multi-tier SVG dial with 120 ticks, degree labels & level reticle
│   ├── CompassNeedle.tsx         # Tactical top sight pointer with glowing index mark
│   ├── HeadingDisplay.tsx        # High-impact tabular degree display & telemetry pills
│   ├── HeadingLockBar.tsx        # Target bearing lock bar & live delta indicator
│   ├── LocationCard.tsx          # GPS location card with tabular coordinates, copy & share
│   ├── SensorStatus.tsx          # Real-time sensor health & calibration alert banner
│   ├── AccuracyIndicator.tsx     # Sensor accuracy badge (High / Medium / Low)
│   ├── LanguageBottomSheet.tsx   # Modal bottom sheet for language selection
│   └── CalibrationVisualizer.tsx # Animated figure-eight visual calibration guide
│
├── screens/
│   ├── CompassScreen.tsx         # Main dashboard screen
│   ├── SettingsScreen.tsx        # Reference mode, theme, language, & developer debug panel
│   ├── CalibrationScreen.tsx     # Figure-eight sensor calibration walkthrough
│   └── AboutScreen.tsx           # App info, privacy, and sensor specifications
│
├── hooks/
│   ├── useCompass.ts             # Reactive hook for physical heading, reference mode, & lock state
│   ├── useLocation.ts            # Reactive hook for GPS coordinates & magnetic declination
│   ├── useLanguage.ts            # Multilingual state & i18n persistence hook
│   └── useTheme.ts               # Light / Dark theme state hook
│
├── services/
│   ├── compassService.ts         # Adaptive low-pass sensor loop & lifecycle management
│   ├── locationService.ts        # GPS watcher & magnetic declination calculation
│   ├── permissionService.ts      # Native permission status & request handlers
│   └── storageService.ts         # Persistent preferences storage with AsyncStorage
│
├── utils/
│   ├── angleUtils.ts             # Shortest arc 359° ↔ 0° angle interpolation & normalization
│   ├── directionUtils.ts         # 8-sector cardinal mapping (N, NE, E, SE, S, SW, W, NW)
│   ├── sensorUtils.ts            # 3D vector tilt-compensation math & accuracy evaluation
│   └── geomagneticUtils.ts       # Magnetic declination calculator
│
├── i18n/                         # Localization dictionaries (en, ta, hi)
├── navigation/                   # React Navigation stack navigator
└── theme/                        # Cyber dark/light color tokens & typography
```

---

## 📉 Minimal App Footprint & Optimization

The application is engineered for maximum performance and minimal install size:

* **Continuous Native Generation (CNG)**: Native iOS and Android binaries are constructed cleanly on EAS Cloud servers via `app.json` config plugins without bloated native source trees in git.
* **ProGuard & R8 Shrinking**: Tree-shakes unused Java/Kotlin code and strips unused native symbols via `expo-build-properties`:
  ```json
  [
    "expo-build-properties",
    {
      "android": {
        "enableProguardInReleaseBuilds": true,
        "enableShrinkResourcesInReleaseBuilds": true
      }
    }
  ]
  ```
* **Resource Stripping**: Removes unused XML drawables and unreferenced native asset bundles.
* **Hermes Bytecode Engine**: Pre-compiles JavaScript source into compact bytecode binaries for minimal RAM usage and rapid startup.
* **Downscaled Asset Pipeline**: Asset images (`icon.png`, `adaptive-icon.png`, `splash.png`) are compressed for a total upload footprint under **1 MB**.

---

## ⚡ Quickstart & Local Setup

### Prerequisites

* Node.js v18+
* npm or yarn
* Physical iOS / Android device with Expo Go (SDK 57) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/varun-8/multilingual-navigation-compass.git
   cd multilingual-navigation-compass
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run project diagnostics:
   ```bash
   npx expo-doctor
   ```

4. Verify TypeScript compilation:
   ```bash
   npm run ts:check
   ```

---

## 📱 Running on Physical Devices

> ⚠️ **Important**: Physical mobile sensors (`Magnetometer` & `Accelerometer`) are present on physical mobile hardware. Mobile emulators/simulators do not emulate physical magnetic fields. Always test on a physical phone.

### Running with Expo Go

1. Open a terminal in the project directory and start the dev server:
   ```bash
   npx expo start --tunnel -c
   ```
2. Open **Expo Go** on your physical device:
   - **Android**: Scan the terminal QR code using the Expo Go app.
   - **iOS**: Scan the terminal QR code using the iOS Camera app.
3. Grant Location and Sensor permissions when prompted.

---

## ☁️ Expo EAS Cloud Build (Android & iOS)

### 1. EAS Login & Setup
Authenticate with your Expo account:
```bash
npx eas login
```

### 2. Android Standalone APK (Preview Profile)
Generate a downloadable `.apk` to test directly on your physical Android device:
```bash
npm run build:apk
# Or using EAS CLI directly:
npx eas build --platform android --profile preview
```

### 3. Android Store Release (Production AAB)
Generate an optimized Android App Bundle (`.aab`) for Google Play Store publishing:
```bash
npm run build:prod
# Or using EAS CLI directly:
npx eas build --platform android --profile production
```

### 4. Check Cloud Build Status
Monitor your builds online anytime at:
[Expo EAS Project Dashboard](https://expo.dev/accounts/varuunnnnn/projects/multilanguage-compass)

---

## 🚀 Pushing Changes to GitHub

To sync all latest commits, EAS build configurations, asset optimizations, and documentation to your GitHub repository:

```bash
# 1. View pending local commits
git status

# 2. Push commits to GitHub master branch
git push origin master
```

Once pushed, all updates will instantly reflect on your GitHub repository page at:
`https://github.com/varun-8/multilingual-navigation-compass`

---

## 🧮 Physics & Sensor Math

### Tilt Compensation

Raw magnetometer readings ($m_x, m_y, m_z$) skew when the device is tilted. The application normalizes the gravity vector ($a_x, a_y, a_z$) from the Accelerometer to calculate Roll ($\phi$) and Pitch ($\theta$):

$$\phi = \arctan2(a_y, a_z)$$

$$\theta = \arctan2(-a_x, \sqrt{a_y^2 + a_z^2})$$

The tilt-compensated magnetic vector components ($X_h, Y_h$) are computed via:

$$X_h = m_x \cos\theta + m_y \sin\phi \sin\theta + m_z \cos\phi \sin\theta$$

$$Y_h = m_y \cos\phi - m_z \sin\phi$$

The tilt-compensated magnetic azimuth ($\psi$) is then:

$$\psi = \text{toDegrees}(\arctan2(-Y_h, X_h)) \pmod{360}$$

### Dynamic Velocity-Scaling Smoothing Filter

To eliminate jitter while maintaining instantaneous responsiveness, the smoothing factor $\alpha$ dynamically scales based on angular velocity:

$$\Delta\theta = |(\theta_{\text{raw}} - \theta_{\text{smoothed}} + 540) \pmod{360} - 180|$$

$$\alpha_{\text{adaptive}} = \max(0.06, \min(0.35, \frac{\Delta\theta}{45}))$$

---

## 🔒 Permissions Overview

### Android (`app.json` / Config Plugin)
- `HIGH_SAMPLING_RATE_SENSORS`: Enables high-frequency hardware sensor callbacks.
- `ACCESS_FINE_LOCATION`: Required for GPS coordinates and magnetic declination calculation.

### iOS (`app.json` / Config Plugin)
- `NSLocationWhenInUseUsageDescription`: Location permission for True North declination calculation.
- `NSMotionUsageDescription`: Motion sensor access for physical magnetometer reading.

---

## 📄 License & Privacy

This application operates **100% locally** on your device. Sensor readings and location data are processed in memory and are never uploaded or shared with external servers.

Licensed under the [MIT License](LICENSE).
