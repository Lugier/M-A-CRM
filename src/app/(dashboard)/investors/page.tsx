import { getOrganizations } from "@/app/actions/organizations";
import { InvestorTable } from "@/components/investors/investor-table";

export default async function InvestorsPage() {
    const organizations = await getOrganizations();

    // Filter for buyer/investor type organizations
    const investors = organizations.filter((org: any) =>
        ["BUYER", "VC", "PE_FUND"].includes(org.type)
    );

    // Also include all orgs so user can add new ones to longlist
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Investoren Datenbank
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Matching & Longlist Management für aktive Deals.
                    </p>
                </div>
            </div>

            <InvestorTable
                investors={investors as any}
                allOrganizations={organizations as any}
            />
        </div>
    );
}
