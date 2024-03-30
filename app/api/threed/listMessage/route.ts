import {messageList} from "@/components/util/OpenAiFN"
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    const {threadId}=await request.json();
    console.log("api threed/listMessage")
    console.log(`threadId:${threadId}`);

    const messages=await messageList({threadId:threadId});
    console.log(messages.data);
    return NextResponse.json({
        messages:messages.data
    },{status:200});
}