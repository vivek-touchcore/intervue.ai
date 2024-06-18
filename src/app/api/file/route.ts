import { pineconeClient } from "@/lib/pinecone";
import { createClient } from "@/lib/supabase/server";
import { fileType } from "@/server/db/schema";
import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { NextRequest } from "next/server";
import { UTApi } from "uploadthing/server";

export const DELETE = async (req: NextRequest) => {
	const body: { id: number } = await req.json();

	const supabase = createClient();

	const { data } = await supabase.auth.getUser();
	const user = data.user;

	if (!user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	const { id } = body;

	try {
		let file: fileType | null = null;
		file = await api.file.getUserFile({ id: String(id) });

		if(!file){
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		const uploadThing = new UTApi();
		const pineconeIndex = pineconeClient.index("pdfspace");

		const { success } = await uploadThing.deleteFiles(file.key);

		if (!success) {
			throw new Error("Failed to delete file");
		}

		console.log(file.id.toString());

		await pineconeIndex.namespace(file.id.toString()).deleteAll();

		//await pineconeIndex._deleteOne(file.id.toString());

		await api.file.deleteFile({ id: String(id) });

		return new Response(undefined, { status: 200 });
	} catch (e: any) {
		console.log(e);
		if (e instanceof TRPCError) {
			if (e.code === "NOT_FOUND") {
				return new Response("NOT_FOUND", { status: 400 });
			} else if (e.code === "UNAUTHORIZED") {
				return new Response("UNAUTHOIRZED", { status: 401 });
			} else {
				return new Response("BAD_REQUEST", { status: 400 });
			}
		} else {
			return new Response(e.message, { status: 400 });
		}
	}
};
