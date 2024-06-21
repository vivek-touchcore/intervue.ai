import { model } from "@/lib/genAI";
import { createClient } from "@/lib/supabase/server";
import { Utterance } from "@/lib/types";
import { convertUtterancesToJson } from "@/lib/utils";
import { db } from "@/server/db/db";
import { transcription, file } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type TranscriptionSuccessEvent = {
	id: string;
	payload: {
		transcription: {
			utterances: Utterance[];
		};
	};
};

export const POST = async (req: NextRequest) => {
	const bodyJson: TranscriptionSuccessEvent = await req.json();

	const transcriptionRes = await db.query.transcription.findFirst({
		where: (transcription, { eq }) => eq(transcription.transcriptId, bodyJson.id),
	});

	if (!transcriptionRes) {
		return NextResponse.json({}, { status: 200 });
	}

	try {
		const transcript = convertUtterancesToJson(bodyJson.payload.transcription.utterances);
		await db.update(transcription).set({ transcript }).where(eq(transcription.id, transcriptionRes.id));

		let summary = "";
		for (const trans of transcript) {
			summary += `SPEAKER ${trans.speaker} | ${trans.startTime}\n${trans.text}\n`;
		}

		const chat = model.startChat({
			history: [
				{
					role: "user",
					parts: [
						{
							text: "Please review the interview transcript below and identify who the candidate is based on their responses. Assess the candidate's alignment with Touchcore Systems' core values: adaptability, transparency, collaborative spirit, innovation, and accountability. Provide ratings and specific examples from the transcript that demonstrate how the candidate exemplifies or falls short of these values.",
						},
					],
				},
				{
					role: "model",
					parts: [
						{
							text: "Sure, please provide values below",
						},
					],
				},
				{
					role: "user",
					parts: [
						{
							text: `Format of the response: 
                                \n----------------\n
                                Candidate Summary:
                                {Provide a brief summary of the candidate based on their interview performance.}

                                Core Values Ratings:
                                Adaptability:

                                Rating: {Rating out of 5}
                                Example: {Specific example from the transcript where adaptability was demonstrated or lacking.}
                                Transparency:

                                Rating: {Rating out of 5}
                                Example: {Specific example from the transcript where transparency was demonstrated or lacking.}
                                Collaborative Spirit:

                                Rating: {Rating out of 5}
                                Example: {Specific example from the transcript where collaborative spirit was demonstrated or lacking.}
                                Innovation:

                                Rating: {Rating out of 5}
                                Example: {Specific example from the transcript where innovation was demonstrated or lacking.}
                                Accountability:

                                Rating: {Rating out of 5}
                                Example: {Specific example from the transcript where accountability was demonstrated or lacking.}`,
						},
					],
				},
				{
					role: "model",
					parts: [
						{
							text: "Please provide the interview transcipt.",
						},
					],
				},
				{
					role: "user",
					parts: [{ text: summary }],
				},
			],
		});

		const chatResult = await chat.sendMessage(
			"Please provide the summary of the candidate based on the above values in fell formatted markdown in same format as defined above."
		);
		const res = chatResult.response;
		const text = res.text();

		await db
			.update(file)
			.set({ summary: text, uploadStatus: "SUCCESS" })
			.where(eq(file.id, transcriptionRes.fileId));
			
		return NextResponse.json({}, { status: 200 });
	} catch (e) {
		console.log(e);
		await db.update(file).set({ uploadStatus: "FAILED" }).where(eq(file.id, transcriptionRes.fileId));
		return NextResponse.json({}, { status: 400 });
	}
};
