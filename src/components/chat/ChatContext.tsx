import { useMutation } from "@tanstack/react-query";
import { createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import {api} from "@/trpc/react";

type StreamResponse = {
	addMessage: () => void;
	message: string;
	handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	isLoading: boolean;
};

export const ChatContext = createContext<StreamResponse>({
	addMessage: () => {},
	message: "",
	handleInputChange: () => {},
	isLoading: false,
});

type Props = {
	fileId: string;
	children: React.ReactNode;
};

export const ChatContextProvider = ({ fileId, children }: Props) => {
	const [message, setMessage] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { toast } = useToast();

	const utils = api.useUtils();
	const backupMessage = useRef("");

	const { mutate: sendMessage } = useMutation({
		mutationFn: async ({ message }: { message: string }) => {
			const response = await fetch("/api/message", {
				method: "POST",
				body: JSON.stringify({
					fileId,
					message,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to load message");
			}
			const result: {message: string} = await response.json();
			return result;
		},
		onMutate: async () => {
			backupMessage.current = message;
			setMessage("");

			await utils.message.getMessages.cancel();
			const previousMessages = utils.message.getMessages.getInfiniteData() 
			utils.message.getMessages.setInfiniteData({fileId, limit: 10}, (oldData) => {
				if(!oldData){
					return {
						pages: [],
						pageParams: []
					}
				}
				
				let newPages = [...oldData.pages];
				let latestPage = newPages[0]!;
				latestPage = [
					{
						createdAt: new Date(),
						id: crypto.randomUUID(),
						text: message,
						isUserMessage: true
					},
					...latestPage
				]
				newPages[0] = latestPage;
				return{
					...oldData,
					pages: newPages
				}
			})

			setIsLoading(true);
			return {
				previousMessages: previousMessages?.pages.flatMap((page) => page) ?? []
			}
		},
		onSuccess: async ({message}) => {
			setIsLoading(false);

			if(!message){
				return toast({
					title: "There was a problem sending this message",
					description: "Please try again later",
					variant: "destructive"
				})
			}

			await utils.message.getMessages.cancel();
			utils.message.getMessages.setInfiniteData({fileId, limit: 10}, (oldData) => {
				if(!oldData){
					return {
						pages: [],
						pageParams: []
					}
				}
				let pages = [...oldData.pages];
				let newPage = pages[0];
				newPage = [
					{
						createdAt: new Date(),
						id: crypto.randomUUID(),
						text: message,
						isUserMessage: false
					},
					...newPage
				]

				pages[0] = newPage;
				return {
					...oldData,
					pages: pages
				};
			})
		},
		onError: (_, __, context) => {
			toast({
				title: "There was a problem in sending this message",
				description: "Please try again later",
				variant: "destructive"
			})	
			utils.message.getMessages.setData({fileId},{...context?.previousMessages ?? []})
		},
		onSettled: async (data) => {
			setIsLoading(false);
			await utils.message.getMessages.refetch({fileId})
		}
	});

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(event.target.value);
	};

	const addMessage = () => sendMessage({ message });

	return (
		<ChatContext.Provider
			value={{
				addMessage,
				message,
				handleInputChange,
				isLoading,
			}}>
			{children}
		</ChatContext.Provider>
	);
};
