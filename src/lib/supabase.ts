"use strict";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadDocument(file: File, dealId: string, type: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${dealId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Ideally, save metadata to DB here too via server action
    return filePath;
}
