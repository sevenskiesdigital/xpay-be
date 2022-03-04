const { createLogger, transports, format } = require('winston');

const customFormat = format.combine(format.timestamp(), format.printf((info) => {
    //return `{timestamp: ${info.timestamp}, level: ${info.level}, message: ${info.message}}`
    return `${info.message}`
}))

const logger = createLogger({
    format: customFormat,
    level: 'debug',
    transports: [
        new transports.Console({level: 'silly'}),
        new transports.File({filename: 'app.log', level: 'info'})
    ]
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function(message, encoding) {
      // use the 'info' log level so the output will be picked up by both transports (file and console)
      logger.info(message);
    },
  };

module.exports = logger;