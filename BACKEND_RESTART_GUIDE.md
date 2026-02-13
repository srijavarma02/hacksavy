# Backend Restart Guide

## Problem
After the system goes to sleep or hibernates, the backend connection is lost and the dashboard cannot connect to the server.

## Solution: Manual Restart

### Step 1: Kill All Node.js Processes
Open Command Prompt and run:
```cmd
taskkill /F /IM node.exe
```

This forcefully terminates all running Node.js processes.

### Step 2: Start Server with Full Path
```cmd
node "C:\Users\sarip\OneDrive\Desktop\git programs\hacksavvy26\hacksavvy26\server\enhancedServer.js"
```

Or navigate to the directory first:
```cmd
cd "C:\Users\sarip\OneDrive\Desktop\git programs\hacksavvy26\hacksavvy26"
node server/enhancedServer.js
```

## Alternative: Kill Specific Port Process

If you only want to kill the process on port 3001:

### Step 1: Find the Process ID (PID)
```cmd
netstat -ano | findstr :3001
```

This will show output like:
```
TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    12345
```

The last number (12345) is the PID.

### Step 2: Kill That Specific Process
```cmd
taskkill /F /PID 12345
```

Replace `12345` with the actual PID from step 1.

### Step 3: Start the Server
```cmd
cd hacksavvy26
npm run server
```

## Quick Restart Batch File

For convenience, you can use the batch file in the project root:

```cmd
restart-backend.bat
```

This will automatically kill Node.js processes and restart the server.

## Verification

After restarting, you should see:
```
🚀 Enhanced Smart Campus Server running on port 3001
📊 WebSocket: ws://localhost:3001
🔌 REST API: http://localhost:3001/api
```

The dashboard should now reconnect automatically via HTTP polling.

## Notes

- The dashboard uses HTTP polling (every 5 seconds) instead of WebSocket for better reliability
- Port 3001 is the default backend port
- The frontend runs on Vite's default port (usually 5173)
- If you see "port already in use" errors, make sure to kill the old process first
