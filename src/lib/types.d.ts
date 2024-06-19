
export type FetchOptions = {
    method?: string;
    headers?: Record<string, string> | Headers;
    body?: string;
};

export type AudioFile = {
    id: string;
    filename: string;
    source: string;
    audio_duration: number;
    number_of_channels: number;
};

export type RequestParams = {
    audio_url: string;
    diarization: boolean;
    file: AudioFile;
};

export type Word = {
    word: string;
    start: number;
    end: number;
    confidence: number;
};

export type Utterance = {
    text: string;
    language: string;
    start: number;
    end: number;
    confidence: number;
    channel: number;
    speaker: number;
    words: Word[];
};

export type Transcription = {
    languages: string[];
    full_transcript: string;
    utterances: Utterance[];
};

export type Metadata = {
    audio_duration: number;
    number_of_distinct_channels: number;
    billing_time: number;
    transcription_time: number;
};

export type Result = {
    metadata: Metadata;
    transcription: Transcription;
};

export type GladiaResponse = {
    id: string;
    request_id: string;
    kind: string;
    status: "queued" | "processing" | "done" | "error";
    created_at: string;
    completed_at: string;
    file: AudioFile;
    request_params: RequestParams;
    result: Result;
};