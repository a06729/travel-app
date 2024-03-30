import {OpenAI} from "openai";
import dotenv from "dotenv";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/index.mjs";
dotenv.config();

const instructions="You're a helpful travel assistant that can write and execute code,and access to a digital map to display information. and Do not use Retrieval for update_map and use file search only for marking tourist attractions with update_marker And Then limit the number of tourist destinations to 3-5 and show the information.";

//기본 어시턴트 아이디 값
const defalutAssistantId="asst_6rXW5qYnc4M7Mhs7Cn1dMe6K";

const openai=new OpenAI({
    apiKey:process.env.Chat_API_KEY!,
});

const update_map={
    "name": "update_map",
    "description": "Update map to center on a particular location",
    "parameters": {
      "type": "object",
      "properties": {
        "longitude": {
          "type": "number",
          "description": "Longitude of the location to center the map on"
        },
        "latitude": {
          "type": "number",
          "description": "Latitude of the location to center the map on"
        },
        "zoom": {
          "type": "integer",
          "description": "Zoom level of the map"
        },
      },
      "required": [
        "longitude",
        "latitude",
        "zoom",
      ]
    }
  }
const update_marker={
    "name": "update_marker",
    "description": "Information on tourist attractions and restaurants is updated on the map, respectively, and information on tourist attractions and restaurants is provided.",
    "parameters": {
      "type": "object",
      "properties": {
        "longitude": {
          "type": "number",
          "description": "Longitude of the location to center the map on"
        },
        "latitude": {
          "type": "number",
          "description": "Latitude of the location to center the map on"
        },
        "description": {
          "type": "string",
          "description": "Print out a summary of information on tourist attractions and restaurants"
        },
        "touristname": {
          "type": "string",
          "description": "Print out the name of the tourist attraction and restaurants"
        }
      },
      "required": [
        "longitude",
        "latitude",
        "description",
        "touristname"
      ]
    }
}

export const assistantsUpdate=async()=>{

  const myAssistantFile = await openai.beta.assistants.files.create(
    defalutAssistantId,
    {
      file_id: "file-kwBtUhgZhuq7NfT5QmOeXL17"
    }
  );

  const myUpdatedAssistant =await openai.beta.assistants.update(defalutAssistantId,{
      model:"gpt-4-turbo-preview",
      tools:[
        { type: "retrieval" },
        { type: "function",function: update_map},
        { type: "function",function: update_marker},
      ],
      file_ids:[myAssistantFile.id],
      instructions:"You're a helpful travel assistant that can write and execute code,and access to a digital map to display information. and Do not use Retrieval for update_map and use Retrieval only for marking tourist attractions with update_marker."
    });
  console.log(myUpdatedAssistant);
  console.log(myAssistantFile);
  // await createAssistant();

}

/**
 * 어시턴트 AI를 실행시키는 함수
 */
export const runAssistant=async({threadId,assistantId=defalutAssistantId}:{threadId:string,assistantId?:string})=>{
  const run = await openai.beta.threads.runs.create(
      threadId,
      { 
        assistant_id: assistantId,
        model:"gpt-4-turbo-preview",
        instructions: instructions,
        tools: [
            // 어시턴트 AI를 실행시킬때에도 retrieval 타입 추가해야함 주의!!
            { type: "retrieval" },
            { type: "function",function: update_map},
            { type: "function",function: update_marker},
          ],
        
      }
  );
  return run;
}
/**
 * @param threadId 스레드 id 값
 * @param runId 어시트턴드 AI id 값
 * @returns 어시스턴트 AI 현재 진행상환 리턴
 */
export const retrieveAssistant=async({threadId,runId}:{threadId:string,runId:string})=>{
  const run = await openai.beta.threads.runs.retrieve(
    threadId,
    runId,
  );
  return run;
}

const createAssistant=async()=>{
    const assistant=await openai.beta.assistants.create({
        name: "wanderlustAssistant2",
        instructions: "You're a helpful travel assistant that can write and execute code,and access to a digital map to display information. and Do not use Retrieval for update_map and use Retrieval only for marking tourist attractions with update_marker.",
        tools: [
          {"type": "retrieval"},
          { type: "function",function: update_map},
          { type: "function",function: update_marker},
        ],
        file_ids:['file-kwBtUhgZhuq7NfT5QmOeXL17'],
        model: "gpt-4-turbo-preview"
    });
    return assistant;
}
export const createThread=(async()=>{
   const thread= await openai.beta.threads.create();
   return thread;
});

export const addMessage=(async({id,message}:{id:string,message:string})=>{
    const threadMessages = await openai.beta.threads.messages.create(
        id,
        { role: "user", content: message},        
      );
});

export const messageList=async({threadId}:{threadId:string})=>{
  const threadMessages = await openai.beta.threads.messages.list(
    threadId,
    {order:"asc",limit:20}
  );
  return threadMessages;
}
export const runcancel=async({threadId}:{threadId:string})=>{
  const run = await openai.beta.threads.runs.cancel(
    threadId,
    "run_IEVIFGCBnYneZf8ZaAVShule."
  );
}

export const submitToolOutputs=async({threadId,runId,requiredActions}:{threadId:string,runId:string,requiredActions:RequiredActionFunctionToolCall[]|undefined,functionArguments?:any})=>{
    const tool_outputs=[]
    for(const action of requiredActions!){
        const tool_call_id=action.id;
        const text=JSON.parse(action.function.arguments);
        console.log(`tool_call_id:${tool_call_id}`);
        console.log(`text:${text['description']}`);
        const tool_obj={
          tool_call_id: tool_call_id,
          output:'',
        };
        tool_outputs.push(tool_obj);
    }
    await openai.beta.threads.runs.submitToolOutputs(
      threadId,
      runId,
      {
        tool_outputs: tool_outputs
      }
    );

}


