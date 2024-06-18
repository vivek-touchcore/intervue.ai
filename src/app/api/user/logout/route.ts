import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
	const supabase = createClient();

	const { error } = await supabase.auth.signOut();

	if (error) {
		return NextResponse.json({ message: error.message }, { status: error.status });
	}

	return NextResponse.json({ status: 200 });
};
