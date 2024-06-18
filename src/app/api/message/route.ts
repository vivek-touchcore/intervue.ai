import { model } from '@/lib/genAI';
import { pineconeClient } from "@/lib/pinecone";
import { createClient } from "@/lib/supabase/server";
import { SendMessageValidator } from "@/lib/validators/sendMessageValidator";
import { db } from "@/server/db/db";
import { message } from "@/server/db/schema";
import { TaskType } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { and, asc } from "drizzle-orm";
import { NextRequest } from "next/server";


export const POST = async (req: NextRequest) => {
	const body = await req.json();

	const supabase = createClient();

	const { data } = await supabase.auth.getUser();
	const user = data.user;

    if (!user) {
		throw new Response("Unauthroized", {status: 401});
	}

    const {fileId, message: messageString} = SendMessageValidator.parse(body);

    const file = await db.query.file.findFirst({
        where: (file, { eq }) => and(eq(file.userId, user.id), eq(file.id, Number(fileId))),
    });

    if(!file){
        return new Response("NOT FOUND", {status: 404})
    }

    await db.insert(message).values({
        text: messageString,
        userId: user.id,
        fileId: file.id,
        isUserMessage: true,
    })

    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "embedding-001", // 768 dimensions
        taskType: TaskType.TASK_TYPE_UNSPECIFIED,
        apiKey: process.env.GOOGLE_API_KEY
    });

    const pineconeIndex = pineconeClient.index("pdfspace");
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: file.id.toString()
    })

    const results = await vectorStore.similaritySearch(messageString, 4);

    const previousMessages = await db.query.message.findMany({
        where: (message, {eq}) => eq(message.fileId, file.id),
        orderBy: [asc(message.createdAt)],
        limit: 6
    })

    const formattedMessages = previousMessages.map((msg) => ({
        role: msg.isUserMessage ? "user" as const : "model" as const,
        content: msg.text
    }))
    
    const chat = model.startChat({
        history: [ 
            {
                role: "user",
                parts: [{text:`Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
                \n----------------\n
                
                PREVIOUS CONVERSATION:
                ${formattedMessages.map((message) => {
                  if (message.role === 'user') return `user: ${message.content}\n`
                  return `model: ${message.content}\n`
                })}
                
                \n----------------\n
                
                CONTEXT:
                ${results.map((r) => r.pageContent).join('\n\n')}
                `}]
            },
            {
                role: "model",
                parts: [{text: "Okay"}],
            },  
        ]
    });

    const result = await chat.sendMessage(messageString);
    const response = await result.response;
    const text = response.text();

    await db.insert(message).values({
        text,
        userId: user.id,
        fileId: file.id,
        isUserMessage: false,
    })


    return new Response(JSON.stringify({message: text}), {status: 200})
};
