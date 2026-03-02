// @ts-nocheck
const colors = require("colors");
colors.setTheme({
  trace: "grey",
  debug: "cyan",
  info: "green",
  warn: "yellow",
  error: "red",
});

export enum Levels {TRACE, DEBUG, INFO, WARN, ERROR, CLOSE}

function time(): string {
  return new Date(new Date().setHours(new Date().getHours() + 8)).toISOString().replace("Z", " ").replace("T", " ").slice(5, -1);
}

function wrapNodeParams(linesParams: boolean, callback: any, ...params: any[]) {
  let arr = [];
  for (let i = 0; i < params.length; i++) {
    if (i + 1 < params.length && i % 2 == 0) {
      arr.push(`${linesParams ? "\n\t" : ""}${callback(params[i])}=${params[i + 1]}`);
      i++;
    } else {
      arr.push(params[i]);
    }
  }
  return arr;
}

function wrapExploreParams(linesParams: boolean, color: string, ...params: any[]) {
  let arr = [];
  arr.push("");
  for (let i = 0; i < params.length; i++) {
    if (i + 1 < params.length && i % 2 == 0) {
      arr[0] = `${arr[0]}${linesParams ? "\n\t" : " "}%c${params[i]}%c=${params[i + 1]}`;
      arr.push(color);
      i++;
    } else {
      arr[0] = `${arr[0]} %c${params[i]}`;
    }
    arr.push("");
  }
  return arr;
}

export function $getLogger(nodeEnv: boolean, level: Levels): ILogger {
  if (nodeEnv) {
    return new NodeLogger(level);
  } else {
    return new ExploreLogger(level);
  }
}

export let isNodeEnv: boolean = true;
export let level: Levels = Levels.TRACE;

export function getLogger(): ILogger {
  return $getLogger(isNodeEnv, level);
}

export interface ILogger {
  trace(message?: any, ...params: any[]): void;

  debug(message?: any, ...params: any[]): void;

  info(message?: any, ...params: any[]): void;

  warn(message?: any, ...params: any[]): void;

  error(message?: any, ...params: any[]): void;

  traceln(message?: any, ...params: any[]): void;

  debugln(message?: any, ...params: any[]): void;

  infoln(message?: any, ...params: any[]): void;

  warnln(message?: any, ...params: any[]): void;

  errorln(message?: any, ...params: any[]): void;
}

export abstract class BaseLogger implements ILogger {
  public level: Levels = Levels.TRACE;

  constructor(level: Levels) {
    this.level = level;
  }

  public trace(message?: any, ...params: any[]): void {
    Levels.TRACE >= this.level && this.print(Levels.TRACE, false, message, ...params);
  }

  public debug(message?: any, ...params: any[]): void {
    Levels.DEBUG >= this.level && this.print(Levels.DEBUG, false, message, ...params);
  }

  public info(message?: any, ...params: any[]): void {
    Levels.INFO >= this.level && this.print(Levels.INFO, false, message, ...params);
  }

  public warn(message?: any, ...params: any[]): void {
    Levels.WARN >= this.level && this.print(Levels.WARN, false, message, ...params);
  }

  public error(message?: any, ...params: any[]): void {
    Levels.ERROR >= this.level && this.print(Levels.ERROR, false, message, ...params);
  }

  public traceln(message?: any, ...params: any[]): void {
    Levels.TRACE >= this.level && this.print(Levels.TRACE, true, message, ...params);
  }

  public debugln(message?: any, ...params: any[]): void {
    Levels.DEBUG >= this.level && this.print(Levels.DEBUG, true, message, ...params);
  }

  public infoln(message?: any, ...params: any[]): void {
    Levels.INFO >= this.level && this.print(Levels.INFO, true, message, ...params);
  }

  public warnln(message?: any, ...params: any[]): void {
    Levels.WARN >= this.level && this.print(Levels.WARN, true, message, ...params);
  }

  public errorln(message?: any, ...params: any[]): void {
    Levels.ERROR >= this.level && this.print(Levels.ERROR, true, message, ...params);
  }

  abstract print(level: Levels, linesParams: boolean, message?: any, ...params: any[]): void;
}

export class NodeLogger extends BaseLogger {
  public print(level: Levels, linesParams: boolean, message?: any, ...params: any[]): void {
    if (!message) {
      //console.log();
      return;
    }
    switch (level) {
      case Levels.TRACE:
        //console.log(time(), colors.trace("TRACE"), message, ...wrapNodeParams(linesParams, colors.trace, ...params));
        break;
      case Levels.DEBUG:
        //console.log(time(), colors.debug("DEBUG"), message, ...wrapNodeParams(linesParams, colors.debug, ...params));
        break;
      case Levels.INFO:
        //console.log(time(), colors.info("INFO "), message, ...wrapNodeParams(linesParams, colors.info, ...params));
        break;
      case Levels.WARN:
        //console.log(time(), colors.warn("WARN "), message, ...wrapNodeParams(linesParams, colors.warn, ...params));
        break;
      case Levels.ERROR:
        //console.log(time(), colors.error("ERROR"), message, ...wrapNodeParams(linesParams, colors.error, ...params));
        break;
      default:
        return;
    }
  }
}

export class ExploreLogger extends BaseLogger {
  public print(level: Levels, linesParams: boolean, message?: any, ...params: any[]): void {
    if (!message) {
      //console.log();
      return;
    }
    let color: string;
    let levelString: string;
    switch (level) {
      case Levels.TRACE:
        color = "color:grey";
        levelString = "TRACE";
        break;
      case Levels.DEBUG:
        color = "color:cyan";
        levelString = "DEBUG";
        break;
      case Levels.INFO:
        color = "color:green";
        levelString = "INFO";
        break;
      case Levels.WARN:
        color = "color:yellow";
        levelString = "WARN";
        break;
      case Levels.ERROR:
        color = "color:red";
        levelString = "ERROR";
        break;
      default:
        return;
    }
    let wrappedParams = wrapExploreParams(linesParams, color, ...params);
    //console.log(`${time()} %c${levelString} %c${message}` + wrappedParams[0], color, "", ...wrappedParams.slice(1));
  }
}

let main = function () {
  // isNodeEnv = false;
  let log: ILogger = getLogger();
  // let log: ILogger = $getLogger(false, Levels.TRACE);

  log.debug();
  log.debug("awesome", "log");
  log.debugln("awesome", "log");
  log.debugln("awesome log", "id", 1, "name", "chaos", "wow");

  log.trace("awesome log", "id", 1, "name", "chaos");
  log.debug("awesome log", "id", 1, "name", "chaos");
  log.info("awesome log", "id", 1, "name", "chaos");
  log.warn("awesome log", "id", 1, "name", "chaos");
  log.error("awesome log", "id", 1, "name", "chaos");

  log.traceln("awesome log", "id", 1, "name", "chaos");
  log.debugln("awesome log", "id", 1, "name", "chaos");
  log.infoln("awesome log", "id", 1, "name", "chaos");
  log.warnln("awesome log", "id", 1, "name", "chaos");
  log.errorln("awesome log", "id", 1, "name", "chaos");
};

// main();

