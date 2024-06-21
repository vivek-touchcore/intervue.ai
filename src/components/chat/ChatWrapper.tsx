"use client";

import React, { useContext } from "react";
import Messages from "./Messages";
import ChatInput from "./ChatInput";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { ChatContextProvider } from "./ChatContext";
import { FileStatusContext } from "../context/FileStatusContext";

type Props = {
	fileId: string;
};

const ChatWrapper = ({ fileId }: Props) => {
	const {status, isLoading} = useContext(FileStatusContext);
	
	if (isLoading || (status != "SUCCESS")) {
		return (
			<div className="relative min-h-full flex flex-col justify-between gap-2">
				<div className="flex-1 flex justify-center items-center flex-col mb-28">
					<div className="flex flex-col items-center gap-2">
						<Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
						<h3 className="font-semibold text-xl">Loading...</h3>
						<p className="text-sm">We&apos;re <span>{isLoading ? 'preparing' : 'analyzing' }</span> your interview.</p>
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
