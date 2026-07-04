import app from "./app";
import { env } from "./config/env";
import { prisma } from "./database/prisma";
async function start(){
    await prisma.$connect();
    app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});
}
start();