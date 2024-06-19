import React from 'react'
import { MapasPage } from './pages/MapasPage'
import { SocketProvider } from './context/SocketContext'

export const MapasApp = () => {
  return (
    <SocketProvider>  
      <MapasPage/>
    </SocketProvider>
  )
}
