import {retrieveAssistant, submitToolOutputs,assistantsUpdate} from "@/components/util/OpenAiFN"
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    await assistantsUpdate();
    console.log(`/assistant/retrieve/update`);

    return NextResponse.json({},{status:200});
}