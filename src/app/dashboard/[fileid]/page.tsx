import PdfRenderer from "@/components/PdfRenderer";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import React from "react";
import ChatWrapper from "@/components/chat/ChatWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
	params: {
		fileid: string;
	};
};

const Page = async ({ params: { fileid } }: Props) => {
	const file = await api.file.getUserFile({ id: fileid });
	const transcription = await api.transcription.getTranscriptionByFileId({ fileId: fileid });

	if (!file) {
		notFound();
	}

	let summary = "";
	if (transcription != null) {
		if (transcription.transcript != null) {
			for (const trans of transcription.transcript) {
				summary += `SPEAKER ${trans.speaker} | ${trans.startTime}\n${trans.text}\n`;
			}
		}
	}

	return (
		<div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
			<div className="mx-auto h-full w-full grow flex xl:px-2">
				<div className="flex-1 flex flex-col h-full">
					<div className="flex-none mx-auto">
						<video src={file.url} controls></video>
					</div>
					<div className="flex-grow overflow-y-auto p-4">
						{transcription != null && (transcription.transcript != null && (transcription.transcript.map((trans, index) => {
							return <div className="mb-8" key={index}>
								<div className="text-muted-foreground text-sm">{`SPEAKER ${trans.speaker} | ${trans.startTime}`}</div>
								<div>{trans.text}</div>
							</div>
						})))}
					</div>
				</div>
				<div className="shrink-0 w-0 flex-1 border-t border-border lg:w-96 lg:border-l lg:border-t-0 mb-4">
					<Tabs defaultValue="chat" className="flex flex-col h-full">
						<TabsList className="flex-none">
							<TabsTrigger value="chat">Chat</TabsTrigger>
							<TabsTrigger value="summary">Summary</TabsTrigger>
						</TabsList>
						<TabsContent value="summary" className="flex-1 flex flex-col overflow-hidden">
							<div className="flex-1 overflow-y-auto">
								{file.summary}
							</div>
						</TabsContent>
						<TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
							<div className="flex-1 overflow-y-auto">
								<ChatWrapper fileId={fileid} />
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
};

export default Page;
