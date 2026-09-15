import "dotenv/config"; import {z} from "zod";
export function serviceConfig(portName:string, fallback:number){return z.object({NODE_ENV:z.enum(["development","test","production"]).default("development"),[portName]:z.coerce.number().default(fallback)}).parse(process.env)}
export function requiredEnv(name:string){const v=process.env[name];if(!v)throw new Error(`${name} is required`);return v}
