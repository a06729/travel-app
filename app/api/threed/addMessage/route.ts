import {addMessage} from "@/components/util/OpenAiFN"
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    const {threadId,message}=await request.json();
    console.log("api threed/addMessage")
    console.log(`threadId:${threadId}`);
    console.log(`message:${message}`);

    await addMessage({id:threadId,message:message});
    return NextResponse.json({},{status:200});
}