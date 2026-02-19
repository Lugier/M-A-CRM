const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting cleanup...");

    // 1. Update original users with correct roles
    const updates = [
        { id: "cmlgqpyz30002snueyitfsuzn", role: "ASSOCIATE", name: "Lukas Ogiermann" },
        { id: "cmlgqpysq0001snue1z9yvokg", role: "ASSOCIATE", name: "Colin Roberts" },
        { id: "cmlgqpym40000snuedtav8wyt", role: "ASSOCIATE", name: "Lennard Swan" },
        { id: "cmlgqpz5i0003snue7zwf0g51", role: "DIRECTOR", name: "Alexander Becker" },
        { id: "cmlgqpzc20004snuervfjwr7h", role: "DIRECTOR", name: "Thomas Klapsia" },
        { id: "cmlgqpzic0005snuec9844fkv", role: "PARTNER", name: "Tobias Spreitzer" }
    ];

    for (const u of updates) {
        await prisma.user.update({
            where: { id: u.id },
            data: { role: u.role }
        });
        console.log(`Updated original user: ${u.name} (ID: ${u.id}) to ${u.role}`);
    }

    // 2. Delete the duplicates I created by mistake
    const duplicatesToDelete = [
        "cmlgs4eby0000hum8dpyv5wyv", // Lukas (lukas@bachert.de)
        "cmlgs4ein0001hum8ltgnma3a", // Colin (colin@bachert.de)
        "cmlgs4epw0002hum8k7gq4qzb", // Lennard (lennard@bachert.de)
        "cmlgs4ew60003hum823rrrth0", // Alexander (alexander.be@bachert.de)
        "cmlgs4f3k0004hum8eqya65ye", // Thomas (thomas@bachert.de)
        "cmlgs4fab0005hum8bqnt25lx"  // Tobias (tobias@bachert.de)
    ];

    for (const id of duplicatesToDelete) {
        try {
            // First, remove from any DealTeamMember relations to avoid FK issues
            await prisma.dealTeamMember.deleteMany({ where: { userId: id } });
            // Then delete the user
            await prisma.user.delete({ where: { id: id } });
            console.log(`Deleted duplicate user with ID: ${id}`);
        } catch (e) {
            console.error(`Error deleting user ${id}: ${e.message}`);
        }
    }

    console.log("Cleanup complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
