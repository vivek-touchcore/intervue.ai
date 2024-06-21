"use client";

import React, { useContext, useRef, useState } from "react";
import { api } from "@/trpc/react";
import { fileType } from "@/server/db/schema";
import Player from "next-video/player";
import { FileStatusContext } from "./context/FileStatusContext";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";

type VideoTabProps = {
	file: fileType;
};

const VideoTranscription = ({ file }: VideoTabProps) => {
	const playerRef = useRef(null);
	const { status } = useContext(FileStatusContext);

	const { data: transcription, isLoading: isTranscriptionLoading } =
		api.transcription.getTranscriptionByFileId.useQuery(
			{ fileId: file.id.toString() },
			{ enabled: status === "SUCCESS" }
		);

	return (
		<div className="flex flex-col h-full">
			<div className="m-2 flex justify-center items-center">
				<Player ref={playerRef} src={file.url} />
			</div>
			<div className="p-3 m-2 overflow-y-auto h-[300px] bg-secondary rounded-md">
				{status === "SUCCESS" ? (
					isTranscriptionLoading ? (
						<div className="flex items-center justify-center h-full">
							<Loader2 className="h-8 w-8 text-blue-500 animate-spin mr-2" />
							<span>Loading transcription...</span>
						</div>
					) : transcription?.transcript ? (
						transcription.transcript.map((trans, index) => (
							<div className="mb-8" key={index}>
								<div className="text-muted-foreground text-sm">{`SPEAKER ${trans.speaker} | ${trans.startTime}`}</div>
								<div>{trans.text}</div>
							</div>
						))
					) : (
						<div>No transcription available</div>
					)
				) : (
					<div className="flex flex-col items-center justify-center h-full">
						<Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
						<h3 className="font-semibold text-xl text-muted-foreground">Processing...</h3>
						<p className="text-sm text-gray-500">Please wait while we process the video.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default VideoTranscription;
