import pg from"pg";const{Pool}=pg;const url=process.env.COMMUNITY_DATABASE_URL;if(!url)throw new Error("COMMUNITY_DATABASE_URL is required");
export const db=new Pool({connectionString:url});export async function ready(){await db.query("SELECT 1")}
