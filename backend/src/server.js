const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    app.listen(config.port, () => {
      logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
