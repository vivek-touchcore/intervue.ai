"use client";

import { type fileType } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { formatDistanceStrict } from "date-fns";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useToast } from "../ui/use-toast";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type Props = {
	file: fileType;
};

const FileCard = ({ file }: Props) => {
	const utils = api.useUtils();
	const { toast } = useToast();
	const [isPdfPreviewLoaded, setIsPdfPreviewLoaded] = useState(false);

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
				variant: "default"
			})
		}
	});

	const deleteRecord = async () => {
		await deleteFile({ id: file.id });
	};

	return (
		<li className="min-[500px]:w-[150px] sm:min-w-[200px] sm:max-w-[200px] md:max-w-[250px] md:min-w-[250px] mr-2 mb-2 border-border border-2 col-span-1 text-card-foreground rounded-lg bg-card overflow-hidden">
			<div className="hidden sm:flex h-[140px] -mt-1 relative border-b-[1px] border-border overflow-hidden w-full justify-center items-center bg-muted">
				<Document
					loading={
						<div className="">
							<img className="w-auto h-auto" src="https://www.svgrepo.com/show/66745/pdf.svg" />
						</div>
					}
					onLoadSuccess={() => {
						setIsPdfPreviewLoaded(true);
					}}
					onLoadError={() => {
						setIsPdfPreviewLoaded(false);
					}}
					file={file.url}
					className="max-h-full max-w-full mt-14">
					{!isPdfPreviewLoaded ? (
						<div className="">
							<img src="https://www.svgrepo.com/show/66745/pdf.svg" />
						</div>
					) : (
						<Page className="rounded-xl" width={200} pageNumber={1} scale={1} renderTextLayer={false} />
					)}
				</Document>
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
							<DropdownMenuItem className="text-red-500 outline-none" onClick={deleteRecord}>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</li>
	);
};

export default FileCard;
