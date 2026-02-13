# VS Code Setup Guide - Smart Campus Dashboard

## ✅ Good News: Everything is Ready!

All dependencies are **already installed** in your project. You don't need to download anything extra!

## 📍 Project Location
```
C:\Users\sarip\OneDrive\Desktop\git programs\hacksavvy26\hacksavvy26\
```

## 🚀 How to Run in VS Code

### Step 1: Open the Project in VS Code

**Option A: Double-click the workspace file**
```
hacksavvy26.code-workspace
```

**Option B: Open from VS Code**
1. Open VS Code
2. File → Open Folder
3. Navigate to: `C:\Users\sarip\OneDrive\Desktop\git programs\hacksavvy26\hacksavvy26`
4. Click "Select Folder"

### Step 2: Open Terminal in VS Code

Press `` Ctrl + ` `` (backtick) or:
- View → Terminal
- Or click Terminal → New Terminal

### Step 3: Start the Backend Server

In the terminal, run:
```cmd
node server/enhancedServer.js
```

You should see:
```
✅ Twilio initialized - Real SMS/WhatsApp enabled
Initializing report service...
🚀 Enhanced Smart Campus Server running on port 3001
📊 WebSocket: ws://localhost:3001
🔌 REST API: http://localhost:3001/api
```

### Step 4: Start the Frontend (New Terminal)

1. Open a **second terminal** (click the + icon in terminal panel)
2. Run:
```cmd
npx vite
```

You should see:
```
VITE v5.4.21  ready in 1073 ms
➜  Local:   http://localhost:3000/
```

### Step 5: Open the Dashboard

Click on the link in the terminal or open your browser to:
```
http://localhost:3000
```

## 🎯 What You'll See

### Dashboard Tabs (in the header):
1. **📊 Overview** - Real-time campus metrics
2. **📈 Analytics** - Historical trends and insights
3. **🌱 Sustainability** - Carbon footprint tracking
4. **📄 Reports** - Daily evaluation reports (NEW!)

### Features Available:
- ✅ Real-time building monitoring (7 buildings)
- ✅ ML anomaly detection
- ✅ Smart alerts and notifications
- ✅ Historical analytics with charts
- ✅ Sustainability metrics
- ✅ **Daily evaluation reports with PDF/CSV export**
- ✅ SMS/WhatsApp notifications (Twilio)
- ✅ HVAC fault detection
- ✅ Surge detection

## 📦 Already Installed Dependencies

Your `node_modules` folder contains **ALL** required packages:

### Core Dependencies:
✅ React 18.2.0
✅ Express 4.18.2
✅ Vite 5.0.0
✅ Node-cron 3.0.3
✅ Puppeteer 21.9.0
✅ CSV-writer 1.6.0
✅ Nodemailer 6.9.8
✅ Twilio 4.20.0
✅ Recharts 2.10.0
✅ Chart.js 4.4.0
✅ Date-fns 3.0.0
✅ ML-random-forest 2.1.0
✅ Fast-check 3.15.0 (for property-based testing)
✅ Jest 29.7.0

**Total: 400+ packages installed and ready!**

## 🔧 No Additional Downloads Needed

You do **NOT** need to run:
- ❌ `npm install` (already done)
- ❌ `npm ci` (already done)
- ❌ Any package installations

Everything is ready to run immediately!

## 🎨 VS Code Extensions (Optional but Recommended)

These are optional but make development easier:

1. **ES7+ React/Redux/React-Native snippets** - React code snippets
2. **ESLint** - Code linting
3. **Prettier** - Code formatting
4. **Auto Rename Tag** - HTML/JSX tag renaming
5. **Path Intellisense** - File path autocomplete

Install from: Extensions panel (Ctrl+Shift+X)

## 🐛 Troubleshooting

### If Backend Won't Start:
```cmd
taskkill /F /IM node.exe
node server/enhancedServer.js
```

### If Frontend Won't Start:
```cmd
npx vite --force
```

### If You See "Port Already in Use":
Kill the process first:
```cmd
taskkill /F /IM node.exe
```

### If Analytics/Sustainability/Reports Pages Are Blank:
1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache
3. Check browser console (F12) for errors

## 📝 Quick Commands Reference

### Start Backend:
```cmd
node server/enhancedServer.js
```

### Start Frontend:
```cmd
npx vite
```

### Start Both (Alternative):
```cmd
npm run dev
```
(This runs both backend and frontend together using concurrently)

### Generate a Report:
Click "📄 Generate Report" button in the dashboard header

### View Reports:
Click "📄 Reports" tab in the dashboard

## 🎯 Expected Result

When everything is running, you'll have:

1. **Backend Server** on http://localhost:3001
   - REST API endpoints
   - WebSocket connection
   - Report generation service
   - ML anomaly detection
   - SMS/Email notifications

2. **Frontend Dashboard** on http://localhost:3000
   - Real-time metrics display
   - Interactive charts
   - Building status monitoring
   - Report viewer with export
   - Settings and configuration

## ✨ You're All Set!

Your dashboard is **100% ready to run** with:
- ✅ All code files saved
- ✅ All dependencies installed
- ✅ All features implemented
- ✅ Daily evaluation reports working
- ✅ PDF/CSV export ready
- ✅ Email/SMS distribution configured

Just open VS Code, run the two commands, and enjoy your Smart Campus Energy Dashboard! 🚀

---

**Need Help?**
- Check `QUICK_COMMANDS.md` for command reference
- Check `BACKEND_RESTART_GUIDE.md` for restart instructions
- Check `DASHBOARD_STATUS.md` for feature overview
