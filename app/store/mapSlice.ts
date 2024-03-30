import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Define a type for the slice state
export interface LocState {
  lat: number,
  lng:number,
  zoom:number
}
/**
 * 마커 타입
 * @param name 관광지 이름
 */
type MarkerType={
  lat:number, // default latitude
  lng:number, // default longitude
  touristname:string, // 관광지 이름
}

export interface MarkerState {
  Markers?:MarkerType[],
  lat?:number,
  lng?:number
  touristname?:string,
}

// Define the initial state using that type
const initialState: LocState = {
  lat: 36.5, // default latitude
  lng: 127.5, // default longitude
  zoom:7
}

const initmarkerState:MarkerState={
  Markers:[],
}



export const markerSlice = createSlice({
  name: 'marker',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState:initmarkerState,
  reducers: {
    setMarker: (state, action: PayloadAction<MarkerState>) => {
      const lat=action.payload.lat;
      const lng=action.payload.lng;
      const touristname=action.payload.touristname;
      if(lat!=undefined&&lng!=undefined&&touristname!=undefined){
        state.Markers?.push({lat:lat,lng:lng,touristname:touristname});
      }
    },
  }
});


export const LocSlice = createSlice({
  name: 'map',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState:initialState,
  reducers: {
    setLoc: (state, action: PayloadAction<LocState>) => {
      state.lat = action.payload.lat;
      state.lng = action.payload.lng
      state.zoom = action.payload.zoom;
    },
  }
});

export const { setLoc } = LocSlice.actions
export const { setMarker } = markerSlice.actions


// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.counter.value


export const markerReducer=markerSlice.reducer

export default LocSlice.reducer

