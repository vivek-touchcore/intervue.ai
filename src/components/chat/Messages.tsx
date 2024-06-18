"use client";

import { api } from "@/trpc/react";
import { Loader2, MessageSquare } from "lucide-react";
import React, { useContext, useEffect, useRef } from "react";
import { Skeleton } from "../ui/skeleton";
import Message from "./Message";
import { ChatContext } from "./ChatContext";

const Messages = ({ fileId }: { fileId: string }) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				fetchNextPage();
				if(ref.current){
					observer.unobserve(ref.current);
				}
			}
		},{threshold: 1});

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			if (ref.current) observer.unobserve(ref.current);
		};
	});

	const { isLoading: isAiThinking } = useContext(ChatContext);
	const { data, isLoading, fetchNextPage } = api.message.getMessages.useInfiniteQuery(
		{
			fileId,
			limit: 10,
		},
		{
			getNextPageParam: (lastPage) => {
				return lastPage.length > 0 ? lastPage[lastPage.length - 1].createdAt.toUTCString() : undefined;
			},
			refetchOnWindowFocus: false,
		}
	);

	const messages = data?.pages.flatMap((page) => page) || [];

	const loadingMessage = {
		id: "loading-message",
		createdAt: new Date().toISOString(),
		isUserMessage: false,
		text: (
			<span className="space-y-2">
				<Skeleton className="mt-2 h-3 rounded-full" />
				<Skeleton className="h-3 rounded-full w-3/4" />
			</span>
		),
	};

	const combinedMessages = [...(isAiThinking ? [loadingMessage] : []), ...messages];

	return (
		<div className="px-3 flex overflow-y-auto h-full flex-1 flex-col-reverse gap-4">
			{combinedMessages && combinedMessages.length > 0 ? (
				combinedMessages.map((message, i) => {
					const isNextMessageSamePerson = combinedMessages[i - 1]?.isUserMessage === combinedMessages[i]?.isUserMessage;

					if (i === combinedMessages.length - 1) {
						return (
							<Message
								ref={ref}
								message={message}
								isNextMessageSamePerson={isNextMessageSamePerson}
								key={message.id}
							/>
						);
					} else return <Message message={message} isNextMessageSamePerson={isNextMessageSamePerson} key={message.id} />;
				})
			) : isLoading ? (
				<div className="space-y-5">
					<div className="w-full flex items-start">
						<div className="h-3 w-3 mr-2 rounded-full">
							<Skeleton className="h-full w-full rounded-full" />
						</div>
						<div className="flex-1 space-y-2">
							<Skeleton className="h-3 rounded-full w-[5%]" />
							<Skeleton className="h-3 rounded-full" />
							<Skeleton className="h-3 rounded-full w-3/4" />
						</div>
					</div>
					<div className="w-full flex items-start">
						<div className="h-3 w-3 mr-2 rounded-full">
							<Skeleton className="h-full w-full rounded-full" />
						</div>
						<div className="flex-1 space-y-2">
							<Skeleton className="h-3 rounded-full w-[10%]" />
							<Skeleton className="h-3 rounded-full" />
							<Skeleton className="h-3 rounded-full w-3/4" />
						</div>
					</div>
				</div>
			) : (
				<div className="flex-1 flex flex-col items-center justify-center gap-2">
					<MessageSquare className="h-8 w-8 text-blue-500" />
					<h3 className="font-semibold text-xl">You&apos;re all set!</h3>
					<p className="text-zinc-500 text-sm">Ask your first question to get started.</p>
				</div>
			)}
		</div>
	);
};

export default Messages;
