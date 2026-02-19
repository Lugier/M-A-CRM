export type User = {
    id: string;
    name: string;
    email: string;
    initials: string;
    role: string;
    avatarColor: string;
    teamsWebhookUrl?: string | null;
};

export type Organization = {
    id: string;
    name: string;
    industry?: string | null;
    type: string;
    address?: string | null;
    description?: string | null;
    website?: string | null;
    revenue?: number | null;
    employees?: number | null;
    aum?: number | null;
    ticketSizeMin?: number | null;
    ticketSizeMax?: number | null;
    createdAt: Date;
    updatedAt: Date;
};

export type Contact = {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
    organizationId?: string | null;
    internalOwnerId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    organization?: Organization;
    internalOwner?: User;
};

export type Deal = {
    id: string;
    name: string;
    type: string;
    status: string;
    stage: string;
    expectedValue?: number | null;
    probability?: number | null;
    feeRetainer?: number | null;
    feeSuccess?: number | null;
    createdAt: Date;
    updatedAt: Date;
    lead?: Contact;
};

export type OrganizationType = "STRATEGIC_INVESTOR" | "FINANCIAL_INVESTOR" | "INSOLVENCY_ADMIN" | "TAX_ADVISOR" | "OTHER";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Task = {
    id: string;
    title: string;
    isCompleted: boolean;
    priority: TaskPriority;
    category?: string | null;
    dealId: string;
    assignedToId?: string | null;
    assignedTo?: User;
    createdAt: Date;
    updatedAt: Date;
};

export type DealTeamRole = "LEAD_ADVISOR" | "SUPPORT" | "ANALYST" | "PARTNER";

export type DealTeamMember = {
    id: string;
    dealId: string;
    userId: string;
    role: DealTeamRole;
    createdAt: Date;
    user?: User;
};

export type InvestorStatus = "LONGLIST" | "SHORTLIST" | "CONTACTED" | "NDA_SENT" | "NDA_SIGNED" | "IM_SENT" | "PROCESS_LETTER_SENT" | "BID_RECEIVED" | "DROPPED";

export type DealInvestor = {
    id: string;
    dealId: string;
    organizationId: string;
    contactId?: string | null;
    status: InvestorStatus;
    ndaSentAt?: Date | null;
    ndaSignedAt?: Date | null;
    imSentAt?: Date | null;
    emailSentAt?: Date | null;
    lastContactedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    organization?: Organization;
    contact?: Contact;
};

export type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};
