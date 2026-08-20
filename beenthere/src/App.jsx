import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import "./App.css";

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

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/pins")
      .then((response) => response.json())
      .then((data) => setPins(data))
      .catch((error) => console.error("Failed to load pins:", error));
  }, []);

  const handleDoubleClick = ({ lat, lng }) => {
    setNewPin({ lat, lng });
    setTitle("");
    setDescription("");
  };

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
      <section id="center">
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
            />
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
          </MapContainer>
          {newPin && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>New Pin</h2>

                <label>
                  Title
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                  />
                </label>

                <div className="modal-buttons">
                  <button onClick={closeModal}>Cancel</button>

                  <button onClick={savePin}>Save</button>
                </div>
              </div>
            </div>
          )}
          {selectedPin && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{selectedPin.title || "Untitled Pin"}</h2>

                {selectedPin.description && <p>{selectedPin.description}</p>}

                <div className="modal-buttons">
                  <button onClick={() => setSelectedPin(null)}>Close</button>

                  <button className="delete-button" onClick={deletePin}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <section id="spacer"></section>
    </>
  );
}

export default App;
