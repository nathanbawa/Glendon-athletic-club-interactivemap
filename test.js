const fs = require('fs');
const content = fs.readFileSync('c:/Users/natha/Downloads/mcartetest/script.js', 'utf8');

// Parse WAYPOINTS
const waypointsMatch = content.match(/const WAYPOINTS = \[([\s\S]*?)\];/);
const newNodesMatch = content.match(/const NEW_NODES = \[([\s\S]*?)\];/);
const connectionsMatch = content.match(/CONNECTIONS\.push\((.*?)\)/g);

// Wait, doing this via regex is hard. Let's just create a simplified version of the graph
// or just look at the code directly.
