"use client";

import React from "react";
import Messages from "./Messages";
import ChatInput from "./ChatInput";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { ChatContextProvider } from "./ChatContext";

type Props = {
	fileId: string;
};

const ChatWrapper = ({ fileId }: Props) => {
	const { data, isLoading } = api.file.getFileUploadStatus.useQuery(
		{ fileId },
		{
			refetchInterval: ({ state }) => (state.data?.status === "SUCCESS" || state.data?.status === "FAILED" ? false : 500),
			refetchOnWindowFocus: false,
		}
	);

	if (isLoading) {
		return (
			<div className="relative min-h-full flex flex-col justify-between gap-2">
				<div className="flex-1 flex justify-center items-center flex-col mb-28">
					<div className="flex flex-col items-center gap-2">
						<Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
						<h3 className="font-semibold text-xl">Loading...</h3>
						<p className="text-sm">We&apos;re preparing your PDF.</p>
					</div>
				</div>

				<ChatInput isDisabled />
			</div>
		);
	}

	return (
		<ChatContextProvider fileId={fileId}>
			<div className="relative h-full flex space-y-3 flex-col px-3 pb-3 pt-2 min-h-full">
				<Messages fileId={fileId} />
				<ChatInput />
			</div>
		</ChatContextProvider>
	);
};

export default ChatWrapper;
