import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chunkArray, convertUtterancesToJson, convertUtterancesToText, poll } from "@/lib/utils";
import { GladiaResponse } from "@/lib/types";
import { db } from "@/server/db/db";
import { file, transcription } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { model } from "@/lib/genAI";
import { Client } from "@upstash/qstash";

export const POST = async (req: NextRequest) => {
	const { url, access_token, id: fileId }: { url: string; access_token: string; id: number } = await req.json();
	const supabase = createClient();
	const { data, error } = await supabase.auth.getUser(access_token);
	if (error || !data.user) {
		throw new Error("Unauthroized");
	}

	const headers = new Headers();
	headers.append("x-gladia-key", process.env.GLADIA_KEY!);
	headers.append("Content-Type", "application/json");

	const options = {
		method: "POST",
		headers: headers,
		body: JSON.stringify({
			audio_url: url,
			diarization: true,
			callback_url: `${process.env.NEXT_PUBLIC_URL}/api/generate-summary`,
		}),
	};

	try {
		const response = await fetch("https://api.gladia.io/v2/transcription", options);
		const { id, result_url }: { id: string; result_url: string } = await response.json();
		console.log("response_id for gladia", id);
		
		await db.insert(transcription).values({ fileId: fileId, transcriptId: id })
		return NextResponse.json({}, { status: 200 });
	} catch (e) {
		console.log(e);
		await db.update(file).set({ uploadStatus: "FAILED" }).where(eq(file.id, fileId));
		return NextResponse.json({}, { status: 400 });
	}
};
