import{app}from"./app.js";import{logger}from"@readers/logger";
const port=Number(process.env.READING_PORT??3003);const log=logger("reading");
const server=app.listen(port,()=>log.info({port},"service started"));
for(const signal of ["SIGINT","SIGTERM"] as const)process.on(signal,()=>server.close(()=>process.exit(0)));
