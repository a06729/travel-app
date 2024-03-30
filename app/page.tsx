'use client';
import MapUi from "@/components/util/MapUi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { setLoc,setMarker } from "./store/mapSlice";
import { setMessage} from "./store/chatInputSlice";
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react";
import { Compass, Loader, TramFront } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function Home() {
  const dispatch=useDispatch();
  const chatmessages=useSelector((state:RootState)=>state.chat.messages);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef=useRef<HTMLDivElement>(null);

  //채팅 입력시 로딩중 이라고 글자와 아이콘 표시하기 위한 state
  const [isLoding, setLoding] = useState(false);

  useEffect(()=>{
    initThreed();
  },[]);
  useEffect(()=>{
    const threadId=localStorage.getItem("threadId");
    messageList(threadId!);
  },[]);
  useEffect(()=>{
    const divCurrent=scrollRef.current;
    divCurrent!.scrollTop=divCurrent!.scrollHeight;
  },);

  /**
   * 스레드 정보가 브라우저 로컬DB에 없으면 생성해주는 함수
   */
  async function initThreed(){
    const threadId=localStorage.getItem("threadId");
    if(threadId==null){
      const res=await fetch("/api/threed/create",{method:"POST"});
      const {threadId}=await res.json();
      localStorage.setItem("threadId",threadId);
    }else{
    }
  }

  /** 
  * 메세지 저장 함수
  */
  async function addMessage(inputString:string,myMessage:boolean){
    // const chatInputVal=inputRef.current?.value;
    const threadId=localStorage.getItem("threadId");
    
    //메세지 ui에 업데이트 하는 함수
    dispatch(setMessage(
      {
        message: inputString,
        myMessage: myMessage,
      }
    ));

    const addMessageResponse=await fetch("/api/threed/addMessage",{
      method:"POST",
      body:JSON.stringify({
        threadId:threadId,
        message:inputString,
      })
    });
  }
  /** 
  * 어시스턴트 AI 동작시키고 어시스턴트 AI 아이디 정보 리턴하는 함수
  */
  async function runAssistant() {
    const threadId=localStorage.getItem("threadId");
    const runResponse=await fetch("/api/assistant/run",{
      method:"POST",
      body:JSON.stringify({
        threadId:threadId,
      })
    });
    const {runId}:{runId:string}=await runResponse.json();
    return runId;
  }

/**
 * AssistantApi를 동작 상태를 확인하기 위한 함수
 * @param runId AssistantApi에서 run 상태를 알아보기 위한 runId 파라미터
 */
  async function retrieveAssistant(runId:string) {
    const threadId=localStorage.getItem("threadId");
    const retrieveResponse=await fetch("/api/assistant/retrieve",{
      method:"POST",
      body:JSON.stringify({
        threadId:threadId,
        runId:runId
      })
    });

    const {runStatus}=await retrieveResponse.json();
    let status:string=runStatus;

    // if(runStatus=='completed'){
    //   status=runStatus;
    //   console.log(`runStatus:${status}`);
    //   const listMessageResponse=await fetch("/api/threed/listMessage",{
    //     method:"POST",
    //     body:JSON.stringify({
    //       threadId:threadId,
    //     })
    //   });
    //   const {messages}=await listMessageResponse.json();
    //   const message=messages.pop();
    //   dispatch(setMessage(
    //     {
    //       message:message.content[0].text.value,
    //       myMessage: false,
    //     }
    //   ));
    //   //로딩 ui 비우기
    //   setLoding(false);
    // }
    // else if(runStatus=="requires_action"){
    //   let descriptionString:string="";
    //   for(const argument of functionArguments){
    //     const funcname=argument.function.name;
    //     if(funcname=="update_map"){
    //       const funcArguments:{latitude:number,longitude:number,zoom:number}=JSON.parse(argument.function.arguments);
    //       console.log(`latitude:${funcArguments.latitude}`);
    //       console.log(`longitude:${funcArguments.longitude}`);
    //       console.log(`zoom:${funcArguments.zoom}`);
    //       update_map(funcArguments.latitude,funcArguments.longitude,funcArguments.zoom);
    //     }else if(funcname=="update_marker"){
    //       const funcArguments:{latitude:number,longitude:number,description:string}=JSON.parse(argument.function.arguments);
    //       //업데이트 마커는 다음에 구현
    //       console.log("updata_marker");
    //       console.log(JSON.stringify(argument.function.arguments));
    //       update_marker(funcArguments.latitude,funcArguments.longitude);
    //       descriptionString+=funcArguments.description;
    //     }
    // }
    //   if(descriptionString.length!=0&&runStatus=='completed'){
    //     addMessage(descriptionString,false);
    //   }
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    //   await retrieveAssistant(runId);
    // }
    // else if(runStatus!=='completed'){
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    //   await retrieveAssistant(runId);
    // }
    //1.2초동안 서버에 요청을 보내서 작업 종료 되었는지 확인하는 함수
    let interval=setInterval(async()=>{
        //어시턴트 api상태를 가져오기위해 서버에 통신
        const retrieveResponse=await fetch("/api/assistant/retrieve",{
          method:"POST",
          body:JSON.stringify({
            threadId:threadId,
            runId:runId
          })
        });
        const {runStatus,functionArguments}=await retrieveResponse.json();
        //run 상태가 컨플리트면 실행
        console.log(`runStatus:${runStatus}`);
        if(runStatus=='completed'){
          status=runStatus;
          console.log(`runStatus:${status}`);
          const listMessageResponse=await fetch("/api/threed/listMessage",{
            method:"POST",
            body:JSON.stringify({
              threadId:threadId,
            })
          });
          const {messages}=await listMessageResponse.json();
          const message=messages.pop();
          dispatch(setMessage(
            {
              message:message.content[0].text.value,
              myMessage: false,
            }
          ));
          //로딩 ui 비우기
          setLoding(false);
          clearInterval(interval);
          //함수 호출이 필요한 경우 실핼
        }else if(runStatus=="requires_action"){
          // console.log(`functionArguments:${JSON.stringify(functionArguments)}`);
          let descriptionString:string="";
          for(const argument of functionArguments){
            const funcname=argument.function.name;
            if(funcname=="update_map"){
              const funcArguments:{latitude:number,longitude:number,zoom:number}=JSON.parse(argument.function.arguments);
              console.log(`latitude:${funcArguments.latitude}`);
              console.log(`longitude:${funcArguments.longitude}`);
              console.log(`zoom:${funcArguments.zoom}`);
              update_map(funcArguments.latitude,funcArguments.longitude,funcArguments.zoom);
            }else if(funcname=="update_marker"){
              const funcArguments:{latitude:number,longitude:number,description:string,touristname:string}=JSON.parse(argument.function.arguments);
              //업데이트 마커는 다음에 구현
              console.log("updata_marker");
              console.log(JSON.stringify(argument.function.arguments));
              update_marker(funcArguments.latitude,funcArguments.longitude,funcArguments.touristname);
              descriptionString+=funcArguments.description;
            }
        }
        if(descriptionString.length!=0&&runStatus=='completed'){
          addMessage(descriptionString,false);
        }
      }
    },1200);
  }

  /**
   * 채팅 입력창에 엔터누를때 사용되는 이벤트 함수
   */
  async function activeEnter(e:React.KeyboardEvent<HTMLInputElement>){
    if (e.key === "Enter" && e.nativeEvent.isComposing === false) {
      //로딩 ui 표시
      //로딩 ui 표시 안하게 하는건 retrieveAssistant에 if(runStatus=='completed')에 있다
      setLoding(true);
      //현재 스크롤 위치
      const divCurrent=scrollRef.current;
      //현재 채팅창에 적힌 글자 값
      const chatInputVal=inputRef.current!.value;
      
      //채팅창 글자 삭제
      inputRef.current!.value="";
      
      //채팅값 저장
      await addMessage(chatInputVal,true);
      
      //채팅을 맨 밑으로 이동하게 하는 기능
      divCurrent!.scrollTop=divCurrent!.scrollHeight;
      
      //글자입력후 글자 입력창 초기화
      //어시스턴트 AI를 작동시키고 runId값을 가져온다.
      const runId=await runAssistant();
      await retrieveAssistant(runId);
    }
  }
/**
 * 입력했던 채팅 메세지 불러오는 함수
 * @param threadId 스레드 아이디 파리미터
 */
  async function messageList(threadId:string) {    
    const listMessageResponse=await fetch("/api/threed/listMessage",{
      method:"POST",
      body:JSON.stringify({
        threadId:threadId,
      })
    });
    const {messages}=await listMessageResponse.json();
    if(messages.length != 0){
      for(const message of messages){
        if(message.role=="user"){
          dispatch(setMessage(
            {
              message:message.content[0].text.value,
              myMessage: true,
            }
          ));
        }else{
          dispatch(setMessage(
            {
              message:message.content[0].text.value,
              myMessage: false,
            }
          ));
        }
      }
    }
  }

  /**
   * 지도 화면을 위도 경도 위치로 이동시키는 함수
   * @param lat 위도
   * @param lng 경도
   * @param zoom 확대 배율
   */
  function update_map(lat:number,lng:number,zoom:number){
    dispatch(setLoc({
      lat:lat,
      lng:lng,
      zoom:zoom
    }));
  }
/**
 * 지도에 마커를 띄위기 위한 함수
 * @param lat 위도
 * @param lng 경도
 * @param touristname 관광지 이름
 */
  function update_marker(lat:number,lng:number,touristname:string){
    dispatch(setMarker({lat:lat,lng:lng,touristname:touristname}));
  }


  return (
    <main className="flex flex-col items-center justify-center">
      <div className="w-[100%] h-[40rem] flex justify-center ">
        <div className="w-[65%]">
          <div className="h-[90%] ml-2 border-solid border-4 rounded-md">
              <div className="flex flex-col w-full h-full gap-y-8">
                <div ref={scrollRef} className="h-[calc(100%-40px)] p-3 scroll-smooth overflow-y-auto">
                  <div className="w-full flex flex-col gap-y-8">
                    {chatmessages?.map(({message,myMessage},index)=>{
                      if(myMessage){
                        return(                        
                          <div className="flex justify-center" key={index}>
                            <span className="mr-2 text-center"><TramFront width={30} height={30}/></span>
                            <div className="flex-1 space-y-2 overflow-hidden">
                              <div className="sm:text-2xl font-semibold prose break-words prose-p:leading-normal prose-pre:p-0 mx-auto">
                                <p className="mb-2 last:mb-0 whitespace-pre-line">{message}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }else{
                        return(                        
                          <div className="flex justify-center" key={index}>
                            <span className="mr-2 text-center"><Compass width={30} height={30}/></span>
                            <div className="flex-1 space-y-2 overflow-hidden">
                              <div className="sm:text-2xl font-semibold prose break-words prose-p:leading-normal prose-pre:p-0 mx-auto">
                                <p className="mb-2 last:mb-0 whitespace-pre-line">{message}</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  {/** 로딩ui */}
                  {isLoding?<div className="flex items-center">
                    <Loader width={30} height={30} className="animate-spin mr-2" />
                    <span className="sm:text-2xl font-semibold">로딩중...</span>
                  </div>:<div></div>}
                  </div>
                </div>
              </div>
          </div>
          <div className="ml-2 p-4">
            <Input ref={inputRef} placeholder="채팅" onKeyDown={async(e)=>await activeEnter(e)}/>
          </div>
        </div>
        <div className="w-[60%] h-[100%] ml-3 relative overflow-hidden">
          <MapUi></MapUi>
        </div>
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
