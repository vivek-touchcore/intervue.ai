"use client";

import { type fileType } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { formatDistanceStrict } from "date-fns";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useToast } from "../ui/use-toast";
import ReactMarkdown from "react-markdown";

type ModalProps = {
	isOpen: boolean;
	name: string;
	summary: string | null;
	handleStateChange: () => void;
};

const FileSummaryModal = ({ isOpen, name, summary, handleStateChange }: ModalProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={handleStateChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="truncate max-w-md">Summary - {name}</DialogTitle>
					<DialogDescription className="h-[500px] overflow-y-auto pt-3">
						<ReactMarkdown>{summary}</ReactMarkdown>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};

type Props = {
	file: fileType;
};

const FileCard = ({ file }: Props) => {
	const videoImage = "https://www.svgrepo.com/show/520494/video-course.svg";

	const utils = api.useUtils();
	const { toast } = useToast();
	const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

	const { mutateAsync: deleteFile } = useMutation({
		mutationFn: async ({ id }: { id: number }) => {
			const response = await fetch("/api/file", {
				method: "DELETE",
				body: JSON.stringify({ id }),
			});

			if (!response.ok) {
				throw new Error("Failed to delete file");
			}
		},
		onSuccess: (data) => {
			utils.file.getUserFiles.invalidate();
			toast({
				title: "File deleted",
				description: "File has been deleted",
				variant: "default",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: "Failed to delete file",
				variant: "destructive",
			});
		},
		onMutate: () => {
			toast({
				title: "Deleting file",
				description: "This may take few seconds",
				variant: "default",
			});
		},
	});

	const deleteRecord = async () => {
		await deleteFile({ id: file.id });
	};

	const toggleModal = () => {
		setIsSummaryModalOpen((prev) => !prev);
	};

	return (
		<li className="min-[500px]:w-[150px] sm:min-w-[200px] sm:max-w-[200px] md:max-w-[250px] md:min-w-[250px] mr-2 mb-2 border-border border-2 col-span-1 text-card-foreground rounded-lg bg-card overflow-hidden">
			<div className="hidden sm:flex h-[140px] -mt-1 relative border-b-[1px] border-border overflow-hidden w-full justify-center items-center bg-muted">
				<div className="mt-[60%]">
					<img src={videoImage} />
				</div>
			</div>

			<div className="pl-6 pr-2 py-4 flex items-center justify-between">
				<div className="">
					<Link href={`/dashboard/${file.id}`}>
						<strong>{file?.name.split(".").slice(0, -1).join(".") ?? ""}</strong>
					</Link>
					<p className="mt-1 text-muted-foreground text-sm">
						{formatDistanceStrict(new Date(file.createdAt), Date.now(), {
							addSuffix: true,
						})}
					</p>
				</div>
				<div className="mx-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm">
								<EllipsisVertical size={18} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuItem
								className="text-white outline-none"
								onClick={toggleModal}
								disabled={!file.summary}
							>
								Summary
							</DropdownMenuItem>
							<DropdownMenuItem className="text-red-500 outline-none" onClick={deleteRecord}>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<FileSummaryModal
				isOpen={isSummaryModalOpen}
				name={file.name}
				summary={file.summary}
				handleStateChange={toggleModal}
			/>
		</li>
	);
};

export default FileCard;
