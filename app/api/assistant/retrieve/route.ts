import {retrieveAssistant, submitToolOutputs} from "@/components/util/OpenAiFN"
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    const {threadId,runId}=await request.json();
    const run= await retrieveAssistant({threadId:threadId,runId:runId});
    console.log(`/assistant/retrieve`);
    if(run.status=="requires_action"){
        const requiredActions=run.required_action?.submit_tool_outputs.tool_calls;

        await submitToolOutputs({threadId,runId,requiredActions});

        console.log(`functionArguments:${JSON.stringify(requiredActions)}`);
        return NextResponse.json({
            runId:run.id,
            runStatus:run.status,
            functionArguments:requiredActions
        },{status:200});
    }

    return NextResponse.json({
        runId:run.id,
        runStatus:run.status,
    },{status:200});
}