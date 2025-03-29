const os = require('os');
const process = require('process');

// Helper function to convert bytes to megabytes
const bytesToMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

// Helper function to get memory usage in MB
const getMemoryUsage = () => bytesToMB(process.memoryUsage().heapUsed);

// Helper function to get free memory in MB
const getFreeMemory = () => bytesToMB(os.freemem());

// Helper function to get total memory in MB
const getTotalMemory = () => bytesToMB(os.totalmem());

// Helper function to get server uptime in seconds
const getUptime = () => process.uptime().toFixed(2);

// Main function to get server status
const getServerStatus = (req, res) => {
  const status = {
    status: 'Server is running',
    uptime: `${getUptime()} seconds`,
    memoryUsage: `${getMemoryUsage()} MB`,
    platform: os.platform(),
    cpuCount: os.cpus().length,
    freeMemory: `${getFreeMemory()} MB`,
    totalMemory: `${getTotalMemory()} MB`,
  };

  res.json(status);
};

module.exports = getServerStatus;