# 🚀 Backend Connection Commands & Expected Output

## Commands to Run in Command Prompt

### Option 1: Run Both (Recommended)
```cmd
cd hacksavvy26
npm run dev
```

### Option 2: Run Separately

**Terminal 1 - Backend Server:**
```cmd
cd hacksavvy26
npm run server
```

**Terminal 2 - Frontend Client:**
```cmd
cd hacksavvy26
npm run client
```

---

## 📊 Expected Output

### When you run `npm run dev`:

```
> smart-campus-energy-dashboard@1.0.0 dev
> concurrently "npm run server" "npm run client"

[0] 
[0] > smart-campus-energy-dashboard@1.0.0 server
[0] > node server/enhancedServer.js
[0] 
[1] 
[1] > smart-campus-energy-dashboard@1.0.0 client
[1] > vite
[1] 
[0] ========================================
[0] 🚀 Smart Campus Energy Dashboard Server
[0] ========================================
[0] 
[0] ✅ Server running on http://localhost:8080
[0] ✅ WebSocket server ready
[0] ✅ ML Service initialized
[0] ✅ Notification Service ready
[0] 
[0] 📊 Real-time data streaming started
[0] 🤖 ML models will train after 200 data points (~10 minutes)
[0] 
[0] Available endpoints:
[0]   - WebSocket: ws://localhost:8080
[0]   - API: http://localhost:8080/api/*
[0]   - Health: http://localhost:8080/health
[0] 
[1] 
[1]   VITE v5.0.0  ready in 1234 ms
[1] 
[1]   ➜  Local:   http://localhost:5173/
[1]   ➜  Network: use --host to expose
[1]   ➜  press h + enter to show help
[1] 
```

---

## 🌐 Access Points

Once both servers are running:

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **WebSocket**: ws://localhost:8080
- **Health Check**: http://localhost:8080/health

---

## ✅ Success Indicators

You'll know it's working when you see:

1. ✅ **Backend Server**: "Server running on http://localhost:8080"
2. ✅ **WebSocket**: "WebSocket server ready"
3. ✅ **ML Service**: "ML Service initialized"
4. ✅ **Frontend**: "Local: http://localhost:5173/"
5. ✅ **No Errors**: No red error messages in console

---

## 🔧 Troubleshooting

### If PowerShell blocks npm:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### If ports are already in use:
```cmd
npx kill-port 8080
npx kill-port 5173
```

### If you see "Cannot find module":
```cmd
npm install
```

---

## 📱 What Happens Next

1. Backend starts generating real-time energy data
2. WebSocket begins streaming updates every 3 seconds
3. ML models start collecting training data
4. Frontend connects to backend automatically
5. Dashboard displays live metrics and charts
6. After 10 minutes, ML models train and predictions appear

---

## 🎯 Quick Test

Open your browser to **http://localhost:5173** and you should see:

- ⚡ Real-time power consumption metrics
- 🏢 Interactive campus map with 7 buildings
- 📊 Live charts updating every 3 seconds
- 🚨 Smart alerts panel
- 🤖 ML model status (training after 10 min)

---

**Ready to go! 🚀**
