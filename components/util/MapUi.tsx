'use client'
import React, { useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, InfoWindowF, MarkerF } from '@react-google-maps/api';
import {useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
// import { setMarker } from '@/app/store/mapSlice';

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  margin:"0",
  padding:"0",
};

const Map = () => {
  const center=useSelector((state:RootState)=>state.map);
  const marker=useSelector((state:RootState)=>state.marker);
  const [infoWindowOpen, setInfoWindowOpen] = useState<boolean[]>([]);
  let showWindowarr:boolean[]=[];
  
  /**
   * 구글맵 화면에 마커를 클릭시 표시되는 상태창 표시하는 함수
   */
  const showInfoWindow = (index:number) => {
    const infoWindowOpenData = infoWindowOpen;
    infoWindowOpenData[index]=true;
    setInfoWindowOpen([...infoWindowOpenData]);
  };
  /**
   * 구글맵 화면에 마커를 클릭시 표시되는 상태창 닫는 함수
   */
  const closeInfoWindow=(index:number)=>{
    const infoWindowOpenData = infoWindowOpen;
    infoWindowOpenData[index]=false;
    setInfoWindowOpen([...infoWindowOpenData]);
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={center.zoom}
        center={center}
      >
        {
        marker.Markers?.map((data,index)=>{
          showWindowarr.push(false);
          if(marker.Markers?.length==index){
            console.log(`마커인덱스:${index}`);
            console.log(`마커 렝스:${marker.Markers?.length}`);
            console.log(`showWindowarr:${showWindowarr}`);
            setInfoWindowOpen(showWindowarr);
          }
          return (
            <MarkerF onLoad={()=>{
            }} key={index} onClick={()=>{
              showInfoWindow(index);
            }} position={{lat:data.lat,lng:data.lng}}>
              {infoWindowOpen[index] && (
              //마커 정보 띄우는 컴퍼넌트
              <InfoWindowF onCloseClick={()=>{
                closeInfoWindow(index);
              }} position={{lat:data.lat,lng:data.lng}}>
                <h1>{data.touristname}</h1>
              </InfoWindowF>
            )}                
            </MarkerF>
          );

        })}
      </GoogleMap>
  );
};

  
  export default React.memo(Map);
  