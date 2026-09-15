import{app}from"./app.js";import{logger}from"@readers/logger";
const port=Number(process.env.COMMUNITY_PORT??3004);const log=logger("community");
const server=app.listen(port,()=>log.info({port},"service started"));
for(const signal of ["SIGINT","SIGTERM"] as const)process.on(signal,()=>server.close(()=>process.exit(0)));
