// contexts/FileStatusContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/trpc/react";

interface FileStatusContextProps {
	fileId: string;
	status: string;
	isLoading: boolean;
	error: any;
}

export const FileStatusContext = createContext<FileStatusContextProps>({
	fileId: "",
	status: "PROCESSING",
	isLoading: true,
	error: null,
});

export const useFileStatus = () => {
	const context = useContext(FileStatusContext);
	if (!context) {
		throw new Error("useFileStatus must be used within a FileStatusProvider");
	}
	return context;
};

type FileStatusProviderProps = {
	fileId: string;
	children: React.ReactNode;
};

export const FileStatusProvider: React.FC<FileStatusProviderProps> = ({ fileId, children }) => {
	const { data, isLoading, error } = api.file.getFileUploadStatus.useQuery(
		{ fileId },
		{
			refetchInterval: ({ state }) =>
				state.data?.status === "SUCCESS" || state.data?.status === "FAILED" ? false : 3000,
			refetchOnWindowFocus: false,
		}
	);

	return (
		<FileStatusContext.Provider value={{ fileId, status: data?.status || "", isLoading, error }}>
			{children}
		</FileStatusContext.Provider>
	);
};
