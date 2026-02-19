export async function sendTeamsNotification(webhookUrl: string, {
    title,
    text,
    link,
    linkLabel
}: {
    title: string;
    text: string;
    link?: string;
    linkLabel?: string;
}) {
    try {
        const body = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": "0076D7",
            "summary": title,
            "sections": [{
                "activityTitle": title,
                "activitySubtitle": "Bachert DealFlow CRM",
                "text": text,
                "potentialAction": link ? [{
                    "@type": "OpenUri",
                    "name": linkLabel || "Ansehen",
                    "targets": [{
                        "os": "default",
                        "uri": link
                    }]
                }] : []
            }]
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        return response.ok;
    } catch (error) {
        console.error("Teams Notification Error:", error);
        return false;
    }
}
