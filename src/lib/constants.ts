export const ORGANIZATION_TYPE_LABELS: Record<string, string> = {
    STRATEGIC_INVESTOR: "Stratege",
    FINANCIAL_INVESTOR: "Finanzinvestor",
    INSOLVENCY_ADMIN: "Insolvenzverwalter",
    TAX_ADVISOR: "Steuerberater",
    OTHER: "Sonstige"
};

export const DEAL_TYPE_LABELS: Record<string, string> = {
    SELL_SIDE: "Sell-Side",
    BUY_SIDE: "Buy-Side",
    MERGER: "Merger",
    CAPITAL_RAISE: "Kapitalerhöhung"
};

export const DEAL_STATUS_LABELS: Record<string, string> = {
    ACTIVE: "Aktiv",
    ON_HOLD: "On Hold",
    CLOSED_WON: "Abgeschlossen (Erfolg)",
    CLOSED_LOST: "Abgeschlossen (Abbruch)",
    LEAD: "Lead"
};

export const DEAL_STAGE_LABELS: Record<string, string> = {
    PITCH: "Lead / Pitch",
    MANDATE: "Mandat / Execution",
    CLOSING: "Closing / Portfolio"
};

export const PROJECT_STEP_LABELS: Record<string, string> = {
    PITCH: "Pitch",
    KICKOFF: "Kick-off",
    LL: "Longlist",
    TEASER: "Teaser",
    NDA: "NDA Phase",
    IM: "Info Memo",
    PROZESSBRIEF: "Prozessbrief",
    MP: "Management Präsentation",
    NBO: "Angebot (NBO)",
    SIGNING_CLOSING: "Signing / Closing"
};

export const INVESTOR_STATUS_LABELS: Record<string, string> = {
    LONGLIST: "Longlist",
    SHORTLIST: "Shortlist",
    CONTACTED: "Kontaktiert",
    NDA_SENT: "NDA Versendet",
    NDA_SIGNED: "NDA Unterzeichnet",
    IM_SENT: "IM Versendet",
    PROCESS_LETTER_SENT: "Prozessbrief Versendet",
    BID_RECEIVED: "Angebot Erhalten",
    DROPPED: "Abgesagt"
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
    LOW: "Niedrig",
    MEDIUM: "Mittel",
    HIGH: "Hoch",
    CRITICAL: "Kritisch"
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
    MEETING: "Meeting",
    CALL: "Telefonat",
    DEADLINE: "Deadline",
    MILESTONE: "Meilenstein",
    OTHER: "Sonstiges",
    TASK: "Aufgabe"
};
