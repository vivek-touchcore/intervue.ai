import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { convertUtterancesToText, poll } from "@/lib/utils";
import { GladiaResponse } from "@/lib/types";
import { db } from "@/server/db/db";
import { file, transcription } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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
		}),
	};

	try {
		const response = await fetch("https://api.gladia.io/v2/transcription", options);
		const { id, result_url }: { id: string; result_url: string } = await response.json();

		const checkCondition = (data: GladiaResponse) => data.status === "done";

		const gladiaResult = await poll<GladiaResponse>(
			result_url,
			{ method: "GET", headers: headers },
			checkCondition
		);

		const {
			result: {
				transcription: { utterances },
			},
		} = gladiaResult;

		const transcript = convertUtterancesToText(utterances);

		await db.insert(transcription).values({ fileId: fileId, text: transcript });

		await db.update(file).set({ uploadStatus: "SUCCESS" }).where(eq(file.id, fileId));

		return NextResponse.json({}, { status: 200 });
	} catch (e) {
		await db.update(file).set({ uploadStatus: "FAILED" }).where(eq(file.id, fileId));
		return NextResponse.json({}, { status: 400 });
	}
};
