const { PrismaClient } = require('@prisma/client');

async function seedUsers() {
    const prisma = new PrismaClient();

    const users = [
        { name: "Lennard Swan", email: "lswan@bachert-partner.de", initials: "LS", role: "PARTNER", avatarColor: "#6366f1" },
        { name: "Colin Roberts", email: "croberts@bachert-partner.de", initials: "CR", role: "DIRECTOR", avatarColor: "#8b5cf6" },
        { name: "Lukas Ogiermann", email: "logiermann@bachert-partner.de", initials: "LO", role: "VP", avatarColor: "#10b981" },
        { name: "Alexander Becker", email: "abecker@bachert-partner.de", initials: "AB", role: "ANALYST", avatarColor: "#f59e0b" },
        { name: "Thomas Klapsia", email: "tklapsia@bachert-partner.de", initials: "TK", role: "PARTNER", avatarColor: "#ef4444" },
        { name: "Tobias Spreitzer", email: "tspreitzer@bachert-partner.de", initials: "TS", role: "ANALYST", avatarColor: "#06b6d4" },
    ];

    const templates = [
        {
            name: "Erstansprache",
            subject: "Vertrauliche Investitionsmöglichkeit – {{dealName}}",
            body: `Sehr geehrte(r) {{contactName}},

im Rahmen eines exklusiven M&A-Mandats möchten wir Ihnen eine vertrauliche Investitionsmöglichkeit vorstellen.

Unser Mandant ist ein etabliertes Unternehmen im Bereich {{industry}} mit einem Umsatz von ca. {{revenue}} Mio. EUR und einem EBITDA von ca. {{ebitda}} Mio. EUR.

Wir würden uns freuen, Ihnen bei Interesse einen anonymisierten Teaser zukommen zu lassen.

Mit freundlichen Grüßen,
{{userName}}
Bachert & Partner`,
            type: "OUTREACH"
        },
        {
            name: "NDA-Anfrage",
            subject: "NDA – {{dealName}}",
            body: `Sehr geehrte(r) {{contactName}},

vielen Dank für Ihr Interesse an unserem M&A-Projekt «{{dealName}}».

Um Ihnen detaillierte Informationen zur Verfügung stellen zu können, bitten wir Sie, beigefügte Vertraulichkeitsvereinbarung (NDA) unterzeichnet an uns zurückzusenden.

Bei Fragen stehen wir Ihnen jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen,
{{userName}}
Bachert & Partner`,
            type: "NDA"
        },
        {
            name: "IM-Versand",
            subject: "Information Memorandum – {{dealName}}",
            body: `Sehr geehrte(r) {{contactName}},

anbei erhalten Sie das Information Memorandum (IM) zu unserem Projekt «{{dealName}}».

Bitte beachten Sie, dass sämtliche Informationen streng vertraulich zu behandeln sind.

Für eine indikative Interessensbekundung bitten wir Sie um Rückmeldung bis zum {{deadline}}.

Mit freundlichen Grüßen,
{{userName}}
Bachert & Partner`,
            type: "IM_SEND"
        }
    ];

    try {
        console.log("Seeding users...");
        for (const user of users) {
            await prisma.user.upsert({
                where: { email: user.email },
                update: user,
                create: user,
            });
            console.log(`  ✓ ${user.name}`);
        }

        console.log("\nSeeding email templates...");
        for (const template of templates) {
            const existing = await prisma.emailTemplate.findFirst({ where: { name: template.name } });
            if (!existing) {
                await prisma.emailTemplate.create({ data: template });
                console.log(`  ✓ ${template.name}`);
            } else {
                console.log(`  ⊘ ${template.name} (exists)`);
            }
        }

        console.log("\n✅ Seeding complete!");
    } catch (error) {
        console.error("Seeding error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedUsers();
