import { LoggerService } from "@nestjs/common";

export const overrideConsole = (logger: LoggerService): void => {
  console.log = (...args: any[]): void => {
    logger.log(args.join(" "), "Console");
  };

  console.info = (...args: any[]): void => {
    logger.log(args.join(" "), "Console");
  };

  console.warn = (...args: any[]): void => {
    logger.warn(args.join(" "), "Console");
  };

  console.debug = (...args: any[]): void => {
    logger.debug?.(args.join(" "), "Console");
  };

  console.error = (...args: any[]): void => {
    logger.error(args.join(" "), undefined, "Console");
  };
};
