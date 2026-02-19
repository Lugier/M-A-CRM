"use client";

import { motion } from "framer-motion";
import { Plus, Users, FileText, Phone } from "lucide-react";
import Link from "next/link";
import { CreateDealDialog } from "@/components/deals/create-deal-dialog";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createDealAction } from "@/app/actions/create-deal"; // We might need to duplicate dialog logic or refactor create-deal-dialog to export parts

// Since CreateDealDialog creates its own Dialog instance, we can't easily wrap it.
// Instead, we will use Links for pages, and for "Neues Mandat" we will use a separate instance of CreateDealDialog 
// but we need to customize the trigger.
// To avoid code duplication, for now let's just make it a Link to /deals, 
// OR better: QuickActions is a Client Component. CreateDealDialog is a Client Component.
// We can just render CreateDealDialog but we need to ensure the styling matches the QuickAction card.

export function QuickActions() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Action 1: New Deal - Special Case with Dialog */}
            {/* We need to refactor CreateDealDialog to accept a custom trigger or just copy use the component if it allows custom children? 
                It uses `DialogTrigger asChild`. So we can pass our custom button.
             */}
            <CreateDealWrapper />

            {/* Action 2: Add Investor */}
            <Link href="/contacts">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 bg-emerald-600 hover:bg-emerald-700 h-full cursor-pointer"
                >
                    <Users className="w-6 h-6" />
                    <span className="font-medium text-sm">Investor hinzufügen</span>
                </motion.div>
            </Link>

            {/* Action 3: Upload Doc */}
            <Link href="/documents">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 bg-indigo-600 hover:bg-indigo-700 h-full cursor-pointer"
                >
                    <FileText className="w-6 h-6" />
                    <span className="font-medium text-sm">Dokument ablegen</span>
                </motion.div>
            </Link>

            {/* Action 4: Log Call */}
            <Link href="/tasks">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 bg-slate-600 hover:bg-slate-700 h-full cursor-pointer"
                >
                    <Phone className="w-6 h-6" />
                    <span className="font-medium text-sm">Call loggen</span>
                </motion.div>
            </Link>
        </div>
    );
}

// Wrapper to reuse the dialog logic but with our card styling
function CreateDealWrapper() {
    // We import the Dialog components directly to build a new trigger for the same action? 
    // Ideally we'd reuse the CreateDealDialog component. 
    // Let's assume CreateDealDialog properly supports `asChild` on trigger if we wrapped it, 
    // but CreateDealDialog HAS the dialog inside.

    // Simplest approach: Use the CreateDealDialog from imports, but we need to override the trigger button style.
    // However, CreateDealDialog hardcodes the Button.
    // We will leave this one as a Link to /deals for now to ensure robustness, 
    // OR we can make it a "Coming Soon" or just duplicate the form logic here.
    // Let's link to /deals for safety in this iteration.

    return (
        <Link href="/deals">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 bg-blue-600 hover:bg-blue-700 h-full cursor-pointer"
            >
                <Plus className="w-6 h-6" />
                <span className="font-medium text-sm">Neues Mandat</span>
            </motion.div>
        </Link>
    )
}
