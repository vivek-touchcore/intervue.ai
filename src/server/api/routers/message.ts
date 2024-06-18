import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { message } from "@/server/db/schema";
import { eq, and, asc, desc, count, gt, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const messageRouter = createTRPCRouter({
	getMessages: privateProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish(),
				fileId: z.string(),
			})
		)
		.query(async ({ input, ctx }) => {
			const { fileId } = input;
			const { db, user } = ctx;
			const limit = input.limit ?? 10;
			const cursor = input.cursor;
			

            const fileResult = await db.query.file.findFirst({
                where: (file, { eq }) => and(eq(file.userId, user.id), eq(file.id, Number(fileId))),
            });
            
            if(!fileResult){
                throw new TRPCError({ code: "NOT_FOUND" });
            }

			const messages = await db
				.select({
					id: message.id,
					text: message.text,
					isUserMessage: message.isUserMessage,
					createdAt: message.createdAt,
				})
				.from(message)
				.where(and(eq(message.fileId, Number(fileId)), eq(message.userId, user.id), cursor ? lt(message.createdAt, new Date(cursor)) : undefined))
				.limit(limit)
				.orderBy(desc(message.createdAt));

            return messages;
		}),
});
