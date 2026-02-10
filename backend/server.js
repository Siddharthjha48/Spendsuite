const config = require('./src/config/config');
const app = require('./src/app');
const connectDB = require('./src/config/db');

// Connect to Database
connectDB();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
