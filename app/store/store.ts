import { configureStore } from '@reduxjs/toolkit';
import LocReducer from "./mapSlice";
import {markerReducer} from "./mapSlice";

import ChatReducer from "./chatInputSlice";


export const store = configureStore({
  reducer: {
    // couter:counterReducer,
    map:LocReducer,
    marker:markerReducer,
    chat:ChatReducer
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch