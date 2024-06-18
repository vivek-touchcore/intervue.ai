import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const body: {password: string; email: string;} = await req.json();
    const {password, email} = body;

    const supabase = createClient();

    const {data, error} = await supabase.auth.signInWithPassword({email, password});

    if(error){
        return NextResponse.json({message: error.message}, {status: error.status});
    }

    return NextResponse.json(data.user, {status: 200});
    
}