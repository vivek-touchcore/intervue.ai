import { Send } from "lucide-react";
import { useContext, useEffect, useRef } from "react";
// import { ChatContext } from './ChatContext'
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ChatContext } from "./ChatContext";

interface ChatInputProps {
	isDisabled?: boolean;
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
	const { addMessage, handleInputChange, isLoading, message } = useContext(ChatContext);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		const textarea = textareaRef.current;
	
		if (!textarea) {
			return;
		}
	
		const handleInput = () => {
			textarea.style.height = "auto";
			textarea.style.height = `${textarea.scrollHeight}px`;
		};
	
		textarea.addEventListener("input", handleInput);
	
		return () => {
			textarea.removeEventListener("input", handleInput);
		};
	}, [textareaRef]);

	return (
		<div className="relative bottom-0 left-0 w-full bg-transparent">
			<div className="relative flex items-center pb-2 px-3">
				<Textarea
					ref={textareaRef}
					autoFocus
					onChange={handleInputChange}
					value={message}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							addMessage();
							textareaRef.current?.focus();
						}
					}}
					style={{
						height: `${textareaRef.current?.scrollHeight}px`
					}}
					rows={1}
					placeholder="Enter your question..."
					className="max-h-[100px] h-auto resize-none outline-none py-2 pb-2 px-2 bg-secondary pr-12 text-base scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
				/>

				<Button
					disabled={isLoading || isDisabled}
					className="absolute bottom-3 right-4"
					size={"sm"}
					variant={"link"}
					aria-label="send message"
					onClick={() => {
						addMessage();
						textareaRef.current?.focus();
					}}>
					<Send className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};

export default ChatInput;
