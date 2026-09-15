import{app}from"./app.js";import{logger}from"@readers/logger";
const port=Number(process.env.CATALOG_PORT??3002);const log=logger("catalog");
const server=app.listen(port,()=>log.info({port},"service started"));
for(const signal of ["SIGINT","SIGTERM"] as const)process.on(signal,()=>server.close(()=>process.exit(0)));
