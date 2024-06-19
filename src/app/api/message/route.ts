import { model } from "@/lib/genAI";
import { createClient } from "@/lib/supabase/server";
import { SendMessageValidator } from "@/lib/validators/sendMessageValidator";
import { db } from "@/server/db/db";
import { message } from "@/server/db/schema";
import { and, asc } from "drizzle-orm";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
	const body = await req.json();

	const supabase = createClient();

	const { data } = await supabase.auth.getUser();
	const user = data.user;

	if (!user) {
		throw new Response("Unauthroized", { status: 401 });
	}

	const { fileId, message: messageString } = SendMessageValidator.parse(body);

	const file = await db.query.file.findFirst({
		where: (file, { eq }) => and(eq(file.userId, user.id), eq(file.id, Number(fileId))),
	});

	if (!file) {
		return new Response("NOT FOUND", { status: 404 });
	}

	const transcription = await db.query.transcription.findFirst({
		where: (transcription, { eq }) => eq(transcription.fileId, file.id),
	});

	if (!transcription || !transcription.transcript) {
		throw new Error("Transcription not found");
	}

	let summary = "";
	for (const trans of transcription.transcript) {
		summary += `SPEAKER ${trans.speaker} | ${trans.startTime}\n${trans.text}\n`;
	}

	await db.insert(message).values({
		text: messageString,
		userId: user.id,
		fileId: file.id,
		isUserMessage: true,
	});

	const previousMessages = await db.query.message.findMany({
		where: (message, { eq }) => eq(message.fileId, file.id),
		orderBy: [asc(message.createdAt)],
		limit: 6,
	});

	const formattedMessages = previousMessages.map((msg) => ({
		role: msg.isUserMessage ? ("user" as const) : ("model" as const),
		content: msg.text,
	}));


	const chat = model.startChat({
		history: [
			{
				role: "user",
				parts: [
					{
						text: `Use the following pieces of interview transcript (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
                \n----------------\n
                
                PREVIOUS CONVERSATION:
                ${formattedMessages.map((message) => {
					if (message.role === "user") return `user: ${message.content}\n`;
					return `model: ${message.content}\n`;
				})}
                
                \n----------------\n
                `,
					},
				],
			},
			{
				role: "model",
				parts: [{ text: "Okay. Please Provide me interview transcript" }],
			},
            {
                role: "user",
                parts: [{text: `TRANSCRIPT: ${summary}`}]
            },
            {
                role: "model",
                parts: [{text: "Sure. I will do as you instructed."}],
            }
		],
	});

	const result = await chat.sendMessage(messageString);
	const response = await result.response;
	const text = response.text();

	await db.insert(message).values({
		text,
		userId: user.id,
		fileId: file.id,
		isUserMessage: false,
	});

	return new Response(JSON.stringify({ message: text }), { status: 200 });
};
