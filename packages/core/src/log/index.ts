type LoggerFunc = (msg: string, args: any) => void;

export interface Logger {
    debug: LoggerFunc;
    info: LoggerFunc;
    warn: LoggerFunc;
    error: LoggerFunc;
}
