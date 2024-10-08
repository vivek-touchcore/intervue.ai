import { buttonVariants } from "@/components/ui/button";
import MaxwidthWrapper from "@/components/common/MaxwidthWrapper";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
	return (
		<MaxwidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
			<h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
				Summarize your <span className="text-blue-600">Interviews</span> in seconds.
			</h1>
			<p className="mt-5 max-w-prose text-muted-foreground sm:text-lg">
				Intervue<span className="text-red-500">.</span>ai enables instant interview summaries and
				interactive Q&A. Just upload your interview recording and dive into comprehensive insights in
				seconds.
			</p>
			<Link className={buttonVariants({ size: "lg", className: "mt-5" })} href="/dashboard">
				Get Started <ArrowRight className="ml-2 h-5 w-5" />
			</Link>
			<div className="mt-14 border-8 border-border rounded-xl">
				<img alt="dashboard" src="/new_dashboard_dark.png" className="rounded-lg" />
			</div>
			<div className="mt-14">
				<h2 className="max-w-4xl text-2xl md:text-3xl lg:text-4xl font-bold">
					It all starts with your information sources
				</h2>
				<p className="mt-2 max-w-prose text-muted-foreground sm:text-lg">
					Generate an AI assistant on top of your interviews so you can quickly find, summarize and
					understand info. No more endless skimming.
				</p>
			</div>
		</MaxwidthWrapper>
	);
}
