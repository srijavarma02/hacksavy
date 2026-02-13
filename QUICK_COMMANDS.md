# Quick Command Reference

## 🛑 STEP 1: Kill All Node.js Processes

```cmd
taskkill /F /IM node.exe
```

## ▶️ STEP 2: Start Backend Server

### Option A: Using Full Path (Recommended)
```cmd
node "C:\Users\sarip\OneDrive\Desktop\git programs\hacksavvy26\hacksavvy26\server\enhancedServer.js"
```

### Option B: Navigate First, Then Run
```cmd
cd "C:\Users\sarip\OneDrive\Desktop\git programs\hacksavvy26\hacksavvy26"
node server/enhancedServer.js
```

## 🎯 One-Line Command (Copy & Paste)

Kill and restart in one command:
```cmd
taskkill /F /IM node.exe & node "C:\Users\sarip\OneDrive\Desktop\git programs\hacksavvy26\hacksavvy26\server\enhancedServer.js"
```

## 📝 Notes

- **Port 3001**: Backend server
- **Port 3000**: Frontend (Vite) - usually starts automatically
- After running the backend command, you should see:
  ```
  🚀 Enhanced Smart Campus Server running on port 3001
  📊 WebSocket: ws://localhost:3001
  🔌 REST API: http://localhost:3001/api
  ```

## 🔍 Troubleshooting "Other Pages Gone"

If Analytics, Sustainability, or Reports pages are blank:

1. **Check browser console** (F12) for errors
2. **Hard refresh** the page (Ctrl + Shift + R)
3. **Clear browser cache** and reload
4. **Restart both servers**:
   ```cmd
   taskkill /F /IM node.exe
   ```
   Then start backend again with the command above

## 🚀 Alternative: Use the Batch File

Just double-click:
```
restart-backend.bat
```

This will automatically:
1. Kill all Node.js processes
2. Wait 2 seconds
3. Start the backend server
