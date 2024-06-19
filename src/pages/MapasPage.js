import React, { useContext, useEffect } from 'react'

import { useMapbox } from '../hooks/useMapbox';
import { SocketContext } from '../context/SocketContext';

const puntoInicial = {
    lng: -122.4725,
    lat: 37.8010,
    zoom: 13.5
}

export const MapasPage = () => {
    
    const {socket} = useContext(SocketContext)

    const { coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } = useMapbox(puntoInicial)

    //escuchar los marcadores existentes
    useEffect(() => {
      socket.on('marcadores-activos', (marcadores) => {
        for (const key of Object.keys(marcadores)) {
            agregarMarcador(marcadores[key], key)
        }


      })
    }, [socket, agregarMarcador])
    

    useEffect(() => {
        nuevoMarcador$.subscribe( marcador => {
            socket.emit('marcador-nuevo', marcador)
            
        })
    }, [nuevoMarcador$, socket])


    useEffect(() => {
        movimientoMarcador$.subscribe( movMarcador => {
            socket.emit('marcador-actualizado', movMarcador)
        
    })
    }, [socket, movimientoMarcador$])
    
    //Marcador actualizado
    useEffect(() => {
        //Broadcast
        socket.on('marcador-actualizado', (marcador) => {
            actualizarPosicion(marcador)
        })
    }, [socket, actualizarPosicion])
    
    
    
    //escuchar nuevo marcadores
    useEffect(() => {
        socket.on('marcador-nuevo', (marcador) => {
            agregarMarcador(marcador, marcador.id)
        })
      
    }, [socket, agregarMarcador])
    


  return (

    <>
        <div className='info'>
            Lng: { coords.lng } , Lat: { coords.lat }, Zoom: { coords.zoom }
        </div>
        <div 
            ref={setRef}
            className='mapContainer'
            />
     
    </>
  
  )
}

