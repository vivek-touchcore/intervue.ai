import React, { forwardRef, RefObject } from "react";
import { message } from "@/server/db/schema";
import { cn } from "@/lib/utils";
import { LucideProps, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

type message =
	| {
			id: string;
			text: string | null;
			isUserMessage: boolean | null;
			createdAt: Date;
	  }
	| {
			id: string;
			createdAt: string;
			isUserMessage: boolean;
			text: React.JSX.Element;
	  };

type Props = {
	ref: RefObject<Element>;
	message: message;
	isNextMessageSamePerson: boolean;
};

const Message = forwardRef<HTMLDivElement, Props>(({ message, isNextMessageSamePerson }, ref) => {
	return (
		<div ref={ref} className={cn("flex items-start")}>
			<div className="flex items-center">
				<div className={cn("h-3 w-3 mt-2 mr-2 rounded-full", message.isUserMessage ? "bg-blue-500" : "bg-zinc-300")}></div>
			</div>
			<div className="flex-1">
				<div className="flex justify-between w-full items-center">
					{message.isUserMessage ? (
						<span className="text-blue-500">Me</span>
					) : (
						<span className="text-zinc-500">
							sphere<span className="text-red-500">.</span>
						</span>
					)}
					<span className="text-muted-foreground text-sm">{format(new Date(message.createdAt), "HH:mm")}</span>
				</div>

				<div className={"flex flex-col space-y-2 text-base"}>
					<div>
						{typeof message.text === "string" ? <ReactMarkdown>{message.text}</ReactMarkdown> : message.text}
						{message.id !== "loading-message" ? (
							<div
								className={cn("text-xs select-none mt-2 w-full text-right", {
									"text-zinc-500": !message.isUserMessage,
									"text-blue-300": message.isUserMessage,
								})}></div>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
});

Message.displayName = "Message";

const Icons = {
	user: User,
	logo: (props: LucideProps) => (
		<svg {...props} viewBox="0 0 24 24">
			<path d="m6.94 14.036c-.233.624-.43 1.2-.606 1.783.96-.697 2.101-1.139 3.418-1.304 2.513-.314 4.746-1.973 5.876-4.058l-1.456-1.455 1.413-1.415 1-1.001c.43-.43.915-1.224 1.428-2.368-5.593.867-9.018 4.292-11.074 9.818zm10.06-5.035 1 .999c-1 3-4 6-8 6.5-2.669.334-4.336 2.167-5.002 5.5h-1.998c1-6 3-20 18-20-1 2.997-1.998 4.996-2.997 5.997z" />
		</svg>
	),
};

export default Message;
