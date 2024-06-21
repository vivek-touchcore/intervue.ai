import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chunkArray, convertUtterancesToJson, convertUtterancesToText, poll } from "@/lib/utils";
import { GladiaResponse } from "@/lib/types";
import { db } from "@/server/db/db";
import { file, transcription } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { model } from "@/lib/genAI";
import { Client } from "@upstash/qstash";

const qstashClient = new Client({
	token: process.env.QSTASH_TOKEN!,
});


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

		const transcript = convertUtterancesToJson(utterances);

		const transciptions = await db.insert(transcription).values({ fileId: fileId, transcript: transcript }).returning();

        await qstashClient.publishJSON({
				url: `${process.env.NEXT_PUBLIC_URL}/api/generate-summary`,
				body: {
					access_token: access_token,
					fileId: fileId,
                    transcriptionId: transciptions[0].id
				},
				method: "POST",
				retries: 0
			});

		return NextResponse.json({}, { status: 200 });
	} catch (e) {
		console.log(e);
		await db.update(file).set({ uploadStatus: "FAILED" }).where(eq(file.id, fileId));
		return NextResponse.json({}, { status: 400 });
	}
};
