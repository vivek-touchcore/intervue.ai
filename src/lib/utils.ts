import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { FetchOptions, Transcript, Utterance } from "./types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getBaseUrl() {
	if (typeof window !== "undefined")
		// browser should use relative path
		return "";
	if (process.env.VERCEL_URL)
		// reference for vercel.com
		return `https://${process.env.VERCEL_URL}`;
	if (process.env.RENDER_INTERNAL_HOSTNAME)
		// reference for render.com
		return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
	// assume localhost
	return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const poll = <T>(
	url: string,
	options: FetchOptions,
	checkCondition: (data: T) => boolean,
	interval: number = 2000
): Promise<T> =>
	new Promise((resolve, reject) => {
		const poller = async () => {
			try {
				const response = await fetch(url, options);
				const data: T = await response.json();

				if (checkCondition(data)) {
					resolve(data);
				} else {
					setTimeout(poller, interval);
				}
			} catch (error) {
				reject(error);
			}
		};

		poller();
	});

export const formatTime = (time: number): string => {
	const minutes = Math.floor(time / 60);
	const seconds = (time % 60).toFixed(3);
	return `${minutes}:${seconds.padStart(6, "0")}`;
};

export const convertUtterancesToText = (utterances: Utterance[]): string => {
	let result = "";
	let previousSpeaker = -1;
	for (let i = 0; i < utterances.length; i++) {
		const utterance = utterances[i];
		const startTime = formatTime(utterance.start);

		if (previousSpeaker !== utterance.speaker) {
			result += `\n\n`;
			result += `SPEAKER ${utterance.speaker} | ${startTime}\n`;
		}

		result += `${utterance.text}  `;
		previousSpeaker = utterance.speaker;
	}

	return result.trim();
};

export const convertUtterancesToJson = (utterances: Utterance[]) => {
	let result: Transcript[] = [];
	let previousSpeaker = -1;
	let text = "";
	let transcript: Transcript = { speaker: -1, startTime: "", text: "" };
	for (const utterance of utterances) {
		const startTime = formatTime(utterance.start);
		if (previousSpeaker !== utterance.speaker) {
			if (previousSpeaker !== -1) {
				result.push(transcript);
			}

			transcript = {
				speaker: -1,
				startTime: "",
				text: "",
			};
			text = "";
			transcript.speaker = utterance.speaker;
			transcript.startTime = startTime;
			transcript.text = text;
		}

		text += `${utterance.text}  `;
		transcript.text = text;
		previousSpeaker = utterance.speaker;
	}

	return result;
};

export const chunkArray = (array: string[], chunkSize: number): { text: string }[] => {
    const chunks: { text: string }[] = [];
    
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push({ text: array.slice(i, i + chunkSize).join("\n") });
    }
    
    return chunks;
}
