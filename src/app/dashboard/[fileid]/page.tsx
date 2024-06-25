import ContextWrapper from "@/components/ContextWrapper";
import Sections from "@/components/Sections";
import VideoTab from "@/components/VideoTab";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

type Props = {
	params: {
		fileid: string;
	};
};

const Page = async ({ params: { fileid } }: Props) => {
	const file = await api.file.getUserFile({ id: fileid });

	if (!file) {
		notFound();
	}

	return (
		<ContextWrapper fileId={file.id.toString()}>
			<div className="flex h-[calc(100vh-3.5rem)]">
				<VideoTab file={file} />
				<Sections file={file} />
			</div>
		</ContextWrapper>
	);
};

export default Page;
