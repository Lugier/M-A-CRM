const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true }
    });
    let output = "Full User List:\n";
    users.forEach(u => {
        output += `${u.id} | ${u.name.padEnd(20)} | ${u.email.padEnd(30)} | ${u.role}\n`;
    });
    fs.writeFileSync('users_list.txt', output);
    console.log("Written to users_list.txt");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
