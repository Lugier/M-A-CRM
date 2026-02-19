export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    console.log(`[Mock Email Service] Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true };
}
