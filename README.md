# 📺 XPRO – TizenxPro for Samsung Smart TV

**XPRO** is a full-stack web app specifically built for **Samsung Smart TVs (Tizen OS)**.  
It uses **React (Vite)** for the frontend, a standalone **Node.js backend**, and a custom toolchain to build and install `.wgt` Tizen apps.

> With XPRO, you can browse and stream adult-oriented video content from popular sources like **xHamster** or **hanime.tv**, directly on your Smart TV – no PC or browser required.  
> ⚠️ **Note:** The **Node.js server must be running** in the background on a device such as a **Raspberry Pi**, **Proxmox VM/LXC**, or similar. The app will not function without it.

---

## ⚠️ Alpha Notice – Still in Development

XPRO is currently in **alpha**. While core features are implemented and the app runs on supported Samsung Smart TVs, it is still under **active development**.

We recommend **following the GitHub repository** to stay up to date, as frequent improvements and updates are being pushed.


![XPRO Logo](./logo.png)

---

## 🧽 Project Structure

```
tizenxpro/
├── tizenxpro-react/          # Frontend: React + Tailwind + Vite
│   ├── public/
│   ├── src/
│   ├── vite.config.ts
│   ├── tailwind.config.cjs
│   ├── _run_dev.bat              # Start dev server (frontend only)
│   ├── _run_build.bat            # Build frontend -> ./www/
│   └── ...
│
├── tizenxpro-backend/        # Backend (separate GitHub project)
│   └── see: https://github.com/propani/tizenxpro-backend
│
├── _0-build-react-tizen.bat   # Build react-app and .wgt package from .tizenxpro-react/www/*
├── _1-install-tizen.bat       # Install .wgt to Samsung Smart TV
│
├── config.xml                # Tizen app manifest
├── tizen.bat / dotnet-tizen.bat
└── logo.png / icon.png
```

---

## ⚙️ Requirements

* [Node.js + npm](https://nodejs.org/)
* [Tizen Studio](https://developer.tizen.org/development/tizen-studio)
* Samsung Smart TV in **Developer Mode**

---

## 🔧 Backend – REST API Server

The backend is a **separate project**. Clone and run it:

🔗 [GitHub: tizenxpro-backend](https://github.com/netxpro/tizenxpro-backend)

### Run it locally:

```bash
apt update
apt install -y wget ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils
git clone https://github.com/netxpro/tizenxpro-backend.git
cd tizenxpro-backend
npm install
npm start   # Default: http://0.0.0.0:3001
```

Make sure the backend runs **before** using features in the frontend that rely on API calls.

---

## 🖥️ Frontend – React TV App

### Clone the Project

```bash
git clone https://github.com/propani/tizenxpro.git
```

🔧 Important: Set API URL

Before building for production, make sure the ./tizenxpro-react/.env file contains the correct backend URL from tizenxpro-backend:

VITE_API_BASE=http://your-backend-ip:your-backend-port

Adjust this path to match your backend server (especially for deployment to real Samsung TVs).
---

## 📦 Build & Install `.wgt` on Samsung Smart TV

### 1. Connect your TV in Developer Mode

Follow [Samsung’s official guide](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)

* Use Tizen Studio to **add your TV’s IP** under *Device Manager*

---

### 2. Build `.wgt` Package

```bash
_0-build-react-tizen.bat
```

This `run npm run buid` and uses the contents of `tizenxpro-react/www/*` and wraps it into a Tizen `.wgt` file using the `config.xml`.

---

### 3. Install `.wgt` on TV

```bash
_1-install-tizen.bat
```

The package is pushed and installed directly to your TV via Tizen CLI.

---

## 🔧 Tech Stack

| Layer      | Tech                        |
| ---------- | --------------------------- |
| Frontend   | React, TailwindCSS, Vite    |
| Backend    | Node.js, Express (own repo) |
| Build Tool | Tizen Studio + WGT scripts  |
| TV UX      | Keyboard/Remote navigation  |

---

## 🛠️ Roadmap / Ideas

* [ ] Synchronize watch history across platforms
* [ ] Support multiple video platforms
* [ ] Other Themes
* [ ] ...

---

## 🙏 Acknowledgements

Thanks for checking out **XPRO**!
Feel free to contribute, open issues, or suggest new features.