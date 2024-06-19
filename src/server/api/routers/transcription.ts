import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { message } from "@/server/db/schema";
import { eq, and, asc, desc, count, gt, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const transcriptionRouter = createTRPCRouter({
	getTranscription: privateProcedure
		.input(
			z.object({
				id: z.string(),
				fileId: z.string(),
			})
		)
		.query(async ({ input, ctx }) => {
			const { db, user } = ctx;
			const transcription = await db.query.transcription.findFirst({
				where: (transcription, { eq }) =>
					and(eq(transcription.id, input.id), eq(transcription.fileId, Number(input.fileId))),
			});

			if (!transcription || !transcription.transcript) {
				throw new Error("Transcription not found");
			}

			return transcription;
		}),
	getTranscriptionByFileId: privateProcedure
		.input(
			z.object({
				fileId: z.string(),
			})
		)
		.query(async ({ input, ctx }) => {
			const { db, user } = ctx;
			const transcription = await db.query.transcription.findFirst({
				where: (transcription, { eq }) =>
					and(eq(transcription.fileId, Number(input.fileId))),
			});

			if (!transcription || !transcription.transcript) {
				throw new Error("Transcription not found");
			}

			return transcription;
		}),
});
