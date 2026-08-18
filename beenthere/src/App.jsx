import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

import { useEffect, useState } from 'react'
import './App.css'

function MapEvents({ onDoubleClick }) {
    useMapEvents({
        dblclick(e) {
            console.log('DOUBLE CLICK:', e.latlng)
            onDoubleClick(e.latlng)
        }
    })
    return null
}


function App() {
  const [pins, setPins] = useState([])

  useEffect(() => {
        fetch('http://127.0.0.1:5000/api/pins')
            .then(response => {
                console.log('GET /api/pins:', response.status)
                return response.json()
            })
            .then(data => {
                console.log('Existing pins:', data)
                setPins(data)
            })
            .catch(error => {
                console.error('Could not load pins:', error)
            })
    }, [])

  const handleDoubleClick = async ({ lat, lng }) => {
        console.log('Saving pin:', lat, lng)

        try {
            const response = await fetch('http://127.0.0.1:5000/api/pins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    latitude: lat,
                    longitude: lng,
                    title: 'New Pin',
                    description: ''
                })
            })

            console.log('POST /api/pins:', response.status)

            const data = await response.json()
            console.log('Saved pin:', data)

            if (!response.ok) {
                console.error('Server error:', data)
                return
            }

            setPins(prev => [...prev, data])
        } catch (error) {
            console.error('Could not save pin:', error)
        }
    }

  return (
    <>
      <div className="header">
          <h1>BeenThere</h1>
      </div>
      <section id="center">
        <div className="map">
          <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} doubleClickZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents onDoubleClick={handleDoubleClick} />
            {pins.map(pin => {
                return (
                    <Marker
                        key={pin.id}
                        position={[Number(pin.latitude), Number(pin.longitude)]}
                    />
                )
            })}
          </MapContainer>
        </div>
        
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
