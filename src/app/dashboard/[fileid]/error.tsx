"use client"; // Error components must be Client Components

import MaxwidthWrapper from "@/components/common/MaxwidthWrapper";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    
    const [message, setMessage] = useState(error.message);
    const [code, setCode] = useState("402");

    const router = useRouter();

	useEffect(() => {
		// Log the error to an error reporting service
		if(error.message == "NOT_FOUND"){
            setMessage("File not found");
            setCode("404");
        }
	}, [error]);

	return (
		<MaxwidthWrapper>
			<div className="mt-10 text-center">
                <h3 className="text-8xl font-bold">{code}</h3>
                <div>
                    <span>{message}</span>
                </div>
                <Button className="mt-3" variant={"default"} onClick={() => router.back()}>
                    Go back
                </Button>
            </div>
		</MaxwidthWrapper>
	);
}
