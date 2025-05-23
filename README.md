# MBO CHAT

[![awesome-vite](https://awesome.re/mentioned-badge.svg)](https://github.com/vitejs/awesome-vite)
![GitHub license](https://img.shields.io/github/license/caoxiemeihao/vite-react-electron)
[![Required Node.JS >= 14.18.0 || >=16.0.0](https://img.shields.io/static/v1?label=node&message=14.18.0%20||%20%3E=16.0.0&logo=node.js&color=3f893e)](https://nodejs.org/about/releases)

## 🚀 About MBO CHAT

MBO CHAT is a modern desktop messaging application built with Electron, React, and Kafka. It provides real-time communication capabilities with a sleek and intuitive interface.

## 🛫 Quick Setup

```sh
# clone the project
git clone https://github.com/massi-css/MBO-CHAT.git

# enter the project directory
cd mbo-chat

# install dependency
npm install

# develop
npm run dev
```

## 📂 Directory structure

Modern desktop chat application structure built with Electron and React :speech*balloon:  
\_Files in the electron folder will be separated from your React application and built into `dist-electron`*

```tree
├── electron                                 Electron-related code
│   ├── main                                 Main-process source code
│   └── preload                              Preload-scripts source code
│
├── release                                  Generated after production build, contains executables
│   └── {version}
│       ├── {os}-{os_arch}                   Contains unpacked application executable
│       └── {app_name}_{version}.{ext}       Installer for the application
│
├── public                                   Static assets
└── src                                      Renderer source code, your React application
```
