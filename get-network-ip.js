/**
 * Get the network IP address of the current machine.
 * 
 * This is used in containerized environments where localhost/127.0.0.1
 * may not be accessible from browser processes due to network policies.
 */

const os = require('os');

function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  // Fallback to localhost
  return '127.0.0.1';
}

module.exports = { getNetworkIP };
