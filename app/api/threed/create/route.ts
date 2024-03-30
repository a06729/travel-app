import {createThread} from "@/components/util/OpenAiFN"

export async function POST(request:Request) {
    const threadObject =await createThread();
    return Response.json({
        threadId:threadObject.id
    });
}