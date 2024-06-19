import PdfRenderer from "@/components/PdfRenderer";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import React from "react";
import ChatWrapper from "@/components/chat/ChatWrapper";

type Props = {
	params: {
		fileid: string;
	};
};

const Page = async ({ params: { fileid } }: Props) => {
	const file = await api.file.getUserFile({ id: fileid });
	const transcription = await api.transcription.getTranscriptionByFileId({fileId: fileid});

	if (!file) {
		notFound();
	}

	let summary = "";
	if(transcription != null){
		if(transcription.transcript != null){
			for (const trans of transcription.transcript) {
				summary += `SPEAKER ${trans.speaker} | ${trans.startTime}\n${trans.text}\n`;
			}
		}
	}

	return (
		<div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
			<div className="mx-auto h-full w-full grow flex xl:px-2">
				<div className="flex-1 w-0">
					<div className="px-4 py-6 sm:px-6 lg:pl-8 flex-1 xl:pl-6 overflow-x-auto h-full">
						{transcription != null && (transcription.transcript != null && (transcription.transcript.map((trans, index) => {
							return <div className="mb-8" key={index}>
								<div className="text-muted-foreground text-sm">{`SPEAKER ${trans.speaker} | ${trans.startTime}`}</div>
								<div>{trans.text}</div>
							</div>
						})))}
					</div>
				</div>
				<div className="shrink-0 w-0 flex-1 border-t border-border lg:w-96 lg:border-l lg:border-t-0 mb-4">
					<ChatWrapper fileId={fileid} />
				</div>
			</div>
		</div>
	);
};

export default Page;
