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
			<div className="flex flex-1 h-full">
				<div className="flex-1 h-full">
					<VideoTab file={file} />
				</div>
				<Sections file={file} />
			</div>
		</ContextWrapper>
	);
};

export default Page;
