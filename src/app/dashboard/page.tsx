"use client";

import UploadButton from "@/components/UploadButton";
import FileCard from "@/components/common/FileCard";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { Ghost } from "lucide-react";

const Dashboard = () => {
	const { data: files, isLoading } = api.file.getUserFiles.useQuery(undefined, { refetchOnWindowFocus: false, staleTime: 1000 });

	return (
		<main style={{height: "calc(100% - 3.5rem)"}} className="w-full relative">
			<div className="mx-auto max-w-7xl p-3 md:p-10">
				<div className="mt-8 flex flex-col items-start justify-between gap-4 pb-5 sm:flex-row sm:items-center sm:gap-0'">
					<h1 className="mb-3 font-bold text-5xl">My Files</h1>
					<UploadButton />
				</div>
				{files && files?.length !== 0 ? (
					<div className="flex items-center min-[400px]:justify-start justify-center">
						<ul className="mt-8 w-full grid grid-cols-1 min-[500px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
							{files
								.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
								.map((file) => (
									<FileCard file={file} key={file.id} />
								))}
						</ul>
					</div>
				) : isLoading ? (
					<div className="mt-8 w-full grid grid-cols-1 min-[500px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
						{Array.from({ length: 3 }, (_, i) => i + 1).map((_, i) => (
							<div
								className="border-2 mb-2 mx-3 rounded-lg border-border min-[500px]:w-[150px] sm:min-w-[200px] sm:max-w-[200px] md:max-w-[250px] md:min-w-[250px] bg-card col-span-1"
								key={i}>
								<Skeleton className="h-[140px] hidden sm:block text-card-foreground rounded-t-md" />
								<div className="pl-6 pr-2 py-4">
									<Skeleton className="w-[120px] rounded-lg h-4" />
									<Skeleton className="mt-3 w-[80px] rounded-lg h-3" />
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="mt-16 flex flex-col items-center gap-2">
						<Ghost className="h-8 w-8 text-muted-foreground" />
						<h3 className="font-semibold text-xl">Pretty empty around here</h3>
						<p>Let&apos;s upload your first PDF.</p>
					</div>
				)}
			</div>
			<div className="text-center text-sm text-zinc-500 py-2 absolute bottom-0 left-0 w-full">
				Files inactive for 10days will be deleted automatically.
			</div>
		</main>
	);
};

export default Dashboard;
