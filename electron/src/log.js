import winston, { format, transports } from "winston";
const { combine, timestamp, json } = format;

const parseKind = format((logEntry) => {
  const event = logEntry.message.event;
  const data = logEntry.message.data;

  delete logEntry.message;

  return {
    ...logEntry,
    event: event,
    data: data,
  };
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    parseKind(),
    json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: `autopazterui-${Date.now()}.log`,
      level: "info",
    }),
  ],
});
