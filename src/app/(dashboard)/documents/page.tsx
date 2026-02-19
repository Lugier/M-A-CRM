import { getDocuments } from "@/app/actions/documents";
import { getDeals } from "@/app/actions/deals";
import { DocumentManager } from "@/components/documents/document-manager";

export default async function DocumentsPage() {
    const documents = await getDocuments();
    const deals = await getDeals();

    const dealOptions = deals.map((d: any) => ({ id: d.id, name: d.name }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Dokumente
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Verwalten Sie Ihre M&A Dokumente zentral.
                </p>
            </div>

            <DocumentManager initialDocuments={documents as any} deals={dealOptions} />
        </div>
    );
}
