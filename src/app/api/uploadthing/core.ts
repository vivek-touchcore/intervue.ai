import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db/db";
import { file } from "@/server/db/schema";
import { Client } from "@upstash/qstash";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const qstashClient = new Client({
	token: process.env.QSTASH_TOKEN!,
});

export const ourFileRouter = {
	fileUploader: f({ "video/mp4": { maxFileSize: "1GB" } })
		.middleware(async ({ req }) => {
			const supabase = createClient();
			const { data, error } = await supabase.auth.getUser();
			if (error || !data.user) {
				throw new Error("Unauthroized");
			}

			const {
				data: { session },
			} = await supabase.auth.getSession();

			return { userId: data.user.id, access_token: session?.access_token };
		})
		.onUploadComplete(async ({ metadata, file: f }) => {
			const fileResult = await db
				.insert(file)
				.values({
					name: f.name,
					key: f.key,
					url: f.url,
					userId: metadata.userId,
					uploadStatus: "PROCESSING",
				})
				.returning();

			await qstashClient.publishJSON({
				url: `${process.env.NEXT_PUBLIC_URL}/api/processing-queue`,
				body: {
					url: f.url,
					access_token: metadata.access_token,
					id: fileResult[0].id,
				},
				method: "POST",
				retries: 0
			});

			return { id: fileResult[0].id };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
