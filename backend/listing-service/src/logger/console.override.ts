import { LoggerService } from "@nestjs/common";

export const overrideConsole = (logger: LoggerService): void => {
  const format = (args: unknown[]) => {
    if (args.length === 1) {
      return typeof args[0] === "string" ? args[0] : JSON.stringify(args[0] ?? null);
    }

    return args.map((a) => (typeof a === "string" ? a : JSON.stringify(a ?? null))).join(" ");
  };

  console.log = (...args: unknown[]): void => {
    logger.log(format(args), "Console");
  };

  console.info = (...args: unknown[]): void => {
    logger.log(format(args), "Console");
  };

  console.warn = (...args: unknown[]): void => {
    logger.warn(format(args), "Console");
  };

  console.debug = (...args: unknown[]): void => {
    if (logger.debug) {
      logger.debug(format(args), "Console");
    } else {
      logger.log(format(args), "Console");
    }
  };

  console.error = (...args: unknown[]): void => {
    logger.error(format(args), undefined, "Console");
  };
};
