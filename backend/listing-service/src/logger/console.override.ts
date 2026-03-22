import { LoggerService } from "@nestjs/common";

export const overrideConsole = (logger: LoggerService): void => {
  const format = (args: any[]) => {
    if (args.length === 1) {
      return args[0];
    }

    return args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
  };

  console.log = (...args: any[]): void => {
    logger.log(format(args), "Console");
  };

  console.info = (...args: any[]): void => {
    logger.log(format(args), "Console");
  };

  console.warn = (...args: any[]): void => {
    logger.warn(format(args), "Console");
  };

  console.debug = (...args: any[]): void => {
    (logger.debug ?? logger.log)(format(args), "Console");
  };

  console.error = (...args: any[]): void => {
    const msg = format(args);

    logger.error(typeof msg === "string" ? msg : JSON.stringify(msg), undefined, "Console");
  };
};
