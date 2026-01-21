// server.js
const app = require("./app");
const listEndpoints = require("express-list-endpoints");
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

console.log("Registered endpoints:");
console.table(listEndpoints(app));
