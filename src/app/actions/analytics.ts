"use server";

import prisma from "@/lib/prisma";

export async function getAnalyticsData() {
    const deals = await prisma.deal.findMany({
        include: {
            investors: true,
            history: { orderBy: { enteredAt: 'asc' } }
        }
    });

    const activeDeals = deals.filter(d => (d.status === "ACTIVE" || d.status === "LEAD") && d.stage !== "ARCHIVED");
    const closedWon = deals.filter(d => d.status === "CLOSED_WON");
    const closedLost = deals.filter(d => d.status === "CLOSED_LOST");

    // 1. M&A Metrics: Weighted Success Fees
    const weightedSuccessFees = activeDeals.reduce((sum, d) => sum + (d.feeSuccess || d.expectedValue || 0) * (d.probability || 0), 0);
    const potentialFees = activeDeals.reduce((sum, d) => sum + (d.feeSuccess || d.expectedValue || 0), 0);
    const bookedFees = closedWon.reduce((sum, d) => sum + (d.feeSuccess || d.expectedValue || 0), 0);

    // 2. Deal Duration (Mandate to Closing)
    let totalDurationDays = 0;
    let durationCount = 0;

    for (const deal of closedWon) {
        const mandateEntry = deal.history.find(h => h.stage === 'KICKOFF' || h.stage === 'MANDATE');
        const startDate = mandateEntry ? new Date(mandateEntry.enteredAt).getTime() : new Date(deal.createdAt).getTime();

        const closingEntry = deal.history.find(h => h.stage === 'CLOSING') || deal.history[deal.history.length - 1];
        const endDate = closingEntry ? new Date(closingEntry.enteredAt).getTime() : new Date(deal.updatedAt).getTime();

        const days = (endDate - startDate) / (1000 * 60 * 60 * 24);
        if (days > 0) {
            totalDurationDays += days;
            durationCount++;
        }
    }
    const avgDealDuration = durationCount > 0 ? Math.round(totalDurationDays / durationCount) : 0;

    // 3. NDA Conversion Rate (Replacement for Win Rate)
    const allInvestors = deals.flatMap(d => d.investors);
    const contacted = allInvestors.filter(i => !["LONGLIST", "SHORTLIST"].includes(i.status)).length;
    const ndaSigned = allInvestors.filter(i => i.ndaSignedAt || ["NDA_SIGNED", "IM_SENT", "DATA_ROOM_ACCESS", "LOI", "BID_RECEIVED"].includes(i.status)).length;
    const ndaConversionRate = contacted > 0 ? (ndaSigned / contacted) * 100 : 0;

    // 4. Monthly Booked Fees
    const monthlyGrowth = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthLabel = d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });

        const dealsInMonth = closedWon.filter(deal => {
            const date = new Date(deal.updatedAt);
            return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
        });

        const revenue = dealsInMonth.reduce((sum, d) => sum + (d.feeSuccess || d.expectedValue || 0), 0);
        monthlyGrowth.push({ month: monthLabel, revenue: revenue });
    }

    // 5. M&A Funnel
    const allActiveInvestors = activeDeals.flatMap(d => d.investors);

    const funnelData = [
        {
            stage: "Longlist",
            count: allActiveInvestors.length
        },
        {
            stage: "Kontakt",
            count: allActiveInvestors.filter(i => !["LONGLIST", "SHORTLIST"].includes(i.status)).length
        },
        {
            stage: "NDA Signed",
            count: allActiveInvestors.filter(i => i.ndaSignedAt || i.status === "NDA_SIGNED").length
        },
        {
            stage: "Angebote",
            count: allActiveInvestors.filter(i => i.status === "BID_RECEIVED").length
        },
        {
            stage: "Closing",
            count: closedWon.length
        }
    ];

    return {
        totalDeals: deals.length,
        potentialFees,
        weightedSuccessFees,
        bookedFees,
        activeCount: activeDeals.length,
        avgDealDuration,
        ndaConversionRate: Math.round(ndaConversionRate * 10) / 10,
        monthlyGrowth,
        funnelData,
        investorStats: {
            ndaSigned: allActiveInvestors.filter(i => (i as any).ndaSignedAt).length,
            bidsReceived: allActiveInvestors.filter(i => i.status === "BID_RECEIVED").length
        }
    };
}
