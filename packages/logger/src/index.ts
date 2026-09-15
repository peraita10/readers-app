import pino from "pino"; export const logger=(service:string)=>pino({base:{service},level:process.env.LOG_LEVEL??"info"});
