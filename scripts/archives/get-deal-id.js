const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.deal.findFirst({ select: { id: true, name: true } }).then(d => {
    console.log(JSON.stringify(d));
    p.$disconnect();
}).catch(e => { console.error(e.message); p.$disconnect(); });
