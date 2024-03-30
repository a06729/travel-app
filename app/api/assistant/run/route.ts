import {runAssistant} from "@/components/util/OpenAiFN"
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    const {threadId}=await request.json();
    const run= await runAssistant({threadId:threadId});
    return NextResponse.json({
        runId:run.id
    },{status:200});
}