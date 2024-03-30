import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// Define a type for the slice state

export type messagesType={
    message:string|undefined,
    myMessage:boolean,
    role?:string
}

export interface messageState {
    messages?:messagesType[],
    message:string|undefined,
    myMessage:boolean,

}
const initialState: messageState = {
    messages:[],
    message:""||undefined,
    myMessage:true
  }

export const messageSlice = createSlice({
  name: 'chatMessage',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setMessage: (state, action: PayloadAction<messageState>) => {
        const data:messagesType={
            message:action.payload.message,
            myMessage:action.payload.myMessage
        }
        console.log(`setMessage:${data.message}`);
        state.messages?.push(data);
    },
  }
})

export const { setMessage} = messageSlice.actions

export default messageSlice.reducer