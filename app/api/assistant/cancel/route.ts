import {runcancel} from "@/components/util/OpenAiFN"
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    const {threadId}=await request.json();
    const run= await runcancel({threadId:threadId});
    return NextResponse.json({},{status:200});
}