"use client";

import { file, fileType } from "@/server/db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ChatWrapper from "./chat/ChatWrapper";
import { useContext } from "react";
import { FileStatusContext } from "./context/FileStatusContext";
import { api } from "@/trpc/react";

const Sections = ({ file }: { file: fileType }) => {
	const { status } = useContext(FileStatusContext);

	const { data, isLoading: isSummaryLoading } = api.file.getFileSummary.useQuery(
		{ id: file.id.toString() },
		{ enabled: status === "SUCCESS" }
	);

	return (
		<div className="flex-1 h-full border-l border-border">
			<Tabs defaultValue="chat" className="h-full flex flex-col">
				<TabsList className="my-1 mt-2 mx-4 flex-none">
					<TabsTrigger value="chat">Chat</TabsTrigger>
					<TabsTrigger value="summary">Summary</TabsTrigger>
				</TabsList>
				<TabsContent value="summary" className="flex-1 overflow-y-auto p-4">
					{status != "SUCCESS" ? (
						<div className="relative min-h-full flex flex-col justify-between gap-2">
							<div className="flex-1 flex justify-center items-center flex-col mb-28">
								<div className="flex flex-col items-center gap-2">
									<Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
									<h3 className="font-semibold text-xl">Loading...</h3>
									<p className="text-sm">We&apos;re preparing summary.</p>
								</div>
							</div>
						</div>
					) : (
						<ReactMarkdown>{data?.summary}</ReactMarkdown>
					)}
				</TabsContent>
				<TabsContent value="chat" className="flex-1 overflow-y-auto">
					<ChatWrapper fileId={file.id.toString()} />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default Sections;
