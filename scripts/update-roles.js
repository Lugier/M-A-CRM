const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const roles = {
        "Alexander Becker": "DIRECTOR",
        "Thomas Klapsia": "DIRECTOR",
        "Lennard Swan": "ASSOCIATE",
        "Lukas Ogiermann": "ASSOCIATE",
        "Colin Roberts": "ASSOCIATE",
        "Tobias Spreitzer": "PARTNER",
        "Alexander Flor": "INTERN",
        "Sebastian Schwab": "INTERN"
    };

    console.log("Updating user roles and creating interns if necessary...");

    for (const [name, role] of Object.entries(roles)) {
        try {
            // Find user by name
            const user = await prisma.user.findFirst({
                where: {
                    name: {
                        contains: name,
                        mode: 'insensitive'
                    }
                }
            });

            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role }
                });
                console.log(`Updated existing user: ${name} -> ${role}`);
            } else if (role === 'INTERN') {
                // Generate email and initials for interns
                const names = name.split(' ');
                const initials = names.map(n => n[0]).join('').toUpperCase();
                const email = `${names[0].toLowerCase()}.${names[names.length - 1].toLowerCase()}@bachert-partner.de`;

                await prisma.user.create({
                    data: {
                        name,
                        email,
                        initials,
                        role: 'INTERN',
                        avatarColor: '#94a3b8'
                    }
                });
                console.log(`Created new intern: ${name} (${email})`);
            } else {
                console.log(`User not found and not an intern: ${name}`);
            }
        } catch (error) {
            console.error(`Failed to handle ${name}:`, error.message);
        }
    }

    await prisma.$disconnect();
}

main();
