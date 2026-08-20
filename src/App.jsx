import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import "./App.css";
import AddPinModal from "./AddPinModal";
import PinModal from "./PinModal";
import Choropleth from "./Choropleth";

// This handles the double click on the map.
function MapEvents({ onDoubleClick }) {
  useMapEvents({
    dblclick(e) {
      onDoubleClick(e.latlng);
    },
  });
  return null;
}

function App() {
  const [pins, setPins] = useState([]);
  const [newPin, setNewPin] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPin, setSelectedPin] = useState(null);
  const [mapMode, setMapMode] = useState("pins");

  // Loading pins on startup
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/pins")
      .then((response) => response.json())
      .then((data) => setPins(data))
      .catch((error) => console.error("Failed to load pins:", error));
  }, []);

  // This is for pressing escape to close a modal
  useEffect(() => {
    // Deselect any pins if escape is pressed
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setNewPin(null);
        setSelectedPin(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Double click on map to place a new pin
  const handleDoubleClick = ({ lat, lng }) => {
    setNewPin({ lat, lng });
    setTitle("");
    setDescription("");
  };

  // Save button on new pin modal
  const savePin = async () => {
    if (!newPin) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/api/pins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: newPin.lat,
          longitude: newPin.lng,
          title: title,
          description: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to save pin:", data);
        return;
      }

      setPins((prev) => [...prev, data]);
      closeModal();
    } catch (error) {
      console.error("Failed to save pin:", error);
    }
  };

  const deletePin = async () => {
    if (!selectedPin) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/pins/${selectedPin.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        console.error("Failed to delete pin");
        return;
      }

      setPins((prev) => prev.filter((pin) => pin.id !== selectedPin.id));
      setSelectedPin(null);
    } catch (error) {
      console.error("Failed to delete pin:", error);
    }
  };

  const closeModal = () => {
    setNewPin(null);
    setTitle("");
    setDescription("");
  };

  return (
    <>
      <div className="header">
        <h1>BeenThere</h1>
      </div>
      <section className="centre">
        <div className="map">
          <MapContainer
            center={[43.590338261467494, -79.36390391433055]}
            zoom={9}
            scrollWheelZoom={true}
            doubleClickZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={true}
            />
            {mapMode === "pins" && (
              <>
                <MapEvents onDoubleClick={handleDoubleClick} />
                {pins.map((pin) => {
                  return (
                    <Marker
                      key={pin.id}
                      position={[Number(pin.latitude), Number(pin.longitude)]}
                      eventHandlers={{
                        click: () => setSelectedPin(pin),
                      }}
                    />
                  );
                })}
              </>
            )}
            {mapMode === "countries" && (
              <Choropleth pins={pins} />
            )}
          </MapContainer>
          {newPin && (
            <AddPinModal
              title={title}
              description={description}
              setTitle={setTitle}
              setDescription={setDescription}
              onSave={savePin}
              onClose={closeModal}
            />
          )}
          {selectedPin && (
            <PinModal
              pin={selectedPin}
              onClose={() => setSelectedPin(null)}
              onDelete={deletePin}
            />
          )}
        </div>
      </section>
      <button className="map-mode-toggle-button"
        onClick={() => setMapMode(mapMode === "pins" ? "countries" : "pins")}
      >
        {mapMode === "pins" ? "Show Countries" : "Show Pins"}
      </button>
      <section className="spacer"></section>
    </>
  );
}

export default App;
