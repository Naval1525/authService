import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./database/prisma.js";
async function start(){
    await prisma.$connect();
    app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});
}
start();
