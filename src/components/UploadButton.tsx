"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { Cloud, File, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Dropzone from "react-dropzone";
import { pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { useToast } from "./ui/use-toast";

const UploadDropzone = () => {
	const router = useRouter();
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const { toast } = useToast();

	const { startUpload } = useUploadThing("pdfUploader", {
		onClientUploadComplete: (files) => {
			const file = files[0];
			if (!file) {
				toast({
					variant: "destructive",
					title: "File upload failed",
					description: "Something went wrong. Please try again later",
				});
			}
			setIsUploading(false);
			router.push(`/dashboard/${file.serverData.id}`);
		},
		onUploadError: (error) => {
			setIsUploading(false);
			toast({
				variant: "destructive",
				title: "File upload failed",
				description: "Something went wrong. Please try again later",
			});
		},
		onUploadProgress: (progress) => setUploadProgress(progress),
		onUploadBegin: () => {
			setIsUploading(true);
		},
	});

	const analysePdf = async (file: File) => {
		const buffer = await file.arrayBuffer();
		return pdfjs.getDocument(buffer).promise.then((doc) => {
			return new Promise<number>((resolve, reject) => {
				return resolve(doc.numPages);
			});
		});
	};

	return (
		<Dropzone
			multiple={false}
			accept={{ "application/pdf": [".pdf"] }}
			onDrop={async (acceptedFile) => {
				setIsUploading(true);
				const data = await analysePdf(acceptedFile[0]);
				if (data < 15) {
					await startUpload(acceptedFile);
				} else {
					setIsUploading(false);
					toast({
						variant: "destructive",
						title: "File upload failed",
						description: "Pfd file exceeds page limit of 15 pages. Please select a smaller file",
					});
				}
			}}>
			{({ getRootProps, getInputProps, acceptedFiles }) => (
				<div
					{...getRootProps()}
					onClick={(e) => e.stopPropagation()}
					className="border h-64 m-4 border-dashed border-border rounded-lg">
					<div className="flex items-center justify-center h-full w-full">
						<label
							htmlFor="dropzone-file"
							className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-secondary">
							<div className="flex flex-col items-center justify-center pt-5 pb-6">
								<Cloud className="h-6 w-6 text-secondary-foreground mb-2" />
								<p className="mb-2 text-sm text-secondary-foreground">
									<span className="font-semibold">Click to upload</span> or drag and drop
								</p>
								<p className="text-xs text-muted-foreground">PDF (up to MB)</p>
							</div>
							{acceptedFiles && acceptedFiles[0] ? (
								<div className="max-w-xs bg-card flex items-center rounded-md overflow-hidden outline outline-[1px] outline-border divide-x divide-border">
									<div className="px-3 py-2 h-full grid place-items-center">
										<File className="h-4 w-4 text-blue-500" />
									</div>
									<div className="px-3 py-2 h-full text-sm truncate">{acceptedFiles[0].name}</div>
								</div>
							) : null}
							{isUploading ? (
								<div className="w-full mt-4 max-w-xs mx-auto">
									<Progress value={uploadProgress} className="h-1 w-full bg-background" />
									{uploadProgress === 0 && (<div className="flex gap-1 items-center justify-center text-sm text-muted-foreground text-center pt-2">
										<Loader2 className="h-3 w-3 animate-spin" />
										Analyzing...
									</div>)}
									{uploadProgress === 100 ? (
										<div className="flex gap-1 items-center justify-center text-sm text-muted-foreground text-center pt-2">
											<Loader2 className="h-3 w-3 animate-spin" />
											Redirecting...
										</div>
									) : null}
								</div>
							) : null}
							<input {...getInputProps()} type="file" id="dropzone-file" className="hidden" />
						</label>
					</div>
				</div>
			)}
		</Dropzone>
	);
};

const UploadButton = () => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(v: boolean) => {
				if (!v) {
					setIsOpen(v);
				}
			}}>
			<DialogTrigger onClick={() => setIsOpen(true)} asChild>
				<Button>Upload PDF</Button>
			</DialogTrigger>
			<DialogContent>
				<UploadDropzone />
				<div className="text-muted-foreground text-xs text-center">
					<span>Uploaded PDFs will be publicly accessible. Avoid sharing sensitive information.</span>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default UploadButton;
