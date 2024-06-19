import mapboxgl from "mapbox-gl"
import { useCallback, useEffect, useRef, useState } from "react"
import { Subject } from "rxjs";
import { v4 } from 'uuid'

mapboxgl.accessToken = 'pk.eyJ1IjoiY3Jpc250YSIsImEiOiJjbHg5cno5a3gxN2VkMnJweG1jNWp3bDBrIn0.k3Ei4yb0EUJVLFlwI_d4Fg';


export const useMapbox = (puntoInicial) => {
    const mapaDiv = useRef()
    
    //Referencias al DIV del mapa
    const setRef = useCallback( (node) => {
        mapaDiv.current = node
    }, [])
    //const [ mapa ,setMapa] = useState(null)
    const mapa = useRef()
    const [coords, setCoords] = useState(puntoInicial)

    //Referencia a los Marcadores
    const marcadores = useRef({})

    //Observables de RxJs
    const movimientoMarcador = useRef( new Subject() )
    const nuevoMarcador = useRef( new Subject() )


    //maps y coords
    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapaDiv.current, // container ID
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [puntoInicial.lng, puntoInicial.lat], // starting position [lng, lat]
            zoom: puntoInicial.zoom, // starting zoom
        });
        mapa.current = map
      
    }, [puntoInicial])

    //funcion para agregar marcadores

    const agregarMarcador = useCallback( ( event, id ) => {
        const { lng, lat } = event.lngLat || event

        const marker = new mapboxgl.Marker()
        marker.id = id ?? v4() //! si el marcador no tiene id, asignarle el de uuid(v4)
        
        marker
            .setLngLat([ lng, lat])
            .addTo( mapa.current)
            .setDraggable( true )
        
        marcadores.current[ marker.id ] = marker //computar la llave que necesita

        //!Si el marcador tiene ID no emitir
        if (!id) {
            nuevoMarcador.current.next( {
                id: marker.id,
                lng,
                lat
            } )
        }

        // listener movimientos del marcador
        marker.on('drag', ({ target }) => {
            const { id } = target 
            const { lng, lat } = target.getLngLat() || target

            //TODO: Emiitir los cambios del marcador
            movimientoMarcador.current.next({id, lng, lat})
        })


    }, []) 

    //Funcion paara actualizar la ubicacion del marcador
    const actualizarPosicion = useCallback(({ id, lng, lat}) =>{

        marcadores.current[id].setLngLat([lng, lat])

    }, [])


    //Agregar marcadores cuiando se hace click
    useEffect(() => {
      mapa.current?.on('click', agregarMarcador)
   
    }, [agregarMarcador])
    

    useEffect(() => {
        mapa.current?.on('move', () => {
            const { lng, lat } = mapa.current.getCenter()
            setCoords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2)
            })

        })
    }, [])
    
    
    
    return {
        coords,
        setRef,
        agregarMarcador,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current,
        actualizarPosicion
    }
}
