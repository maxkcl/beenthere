import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON } from "react-leaflet";
import { point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

// Colours in a country based on its pin count
function getColor(count, max) {
  if (count === 0) return "white";

  // Find grouping
  const ratio = count / max;

  if (ratio > 0.75) return "#163d6b";
  if (ratio > 0.5) return "#245b91";
  if (ratio > 0.25) return "#3778b5";
  if (ratio > 0.1) return "#5a96c9";

  return "#83b4d9";
}

function Choropleth({ pins }) {
  const [countries, setCountries] = useState(null);
  const geoJsonRef = useRef(null);

  // Load polygons GeoJSON
  useEffect(() => {
    fetch("/countries.geojson")
      .then((response) => response.json())
      .then((data) => setCountries(data))
      .catch((error) =>
        console.error("Failed to load country GeoJSON: ", error),
      );
  }, []);

  // Calculate the number of pins found in each country and return as a list
  const countryCounts = useMemo(() => {
    if (!countries) return {};

    const counts = {};

    // For every country...
    countries.features.forEach((country) => {
      const countryName = country.properties.name;
      counts[countryName] = 0;

      // For every pin...
      pins.forEach((pin) => {
        const latitude = Number(pin.latitude);
        const longitude = Number(pin.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return;
        }

        const pinPoint = point([longitude, latitude]);

        // If the pin is inside the country polygon...
        if (booleanPointInPolygon(pinPoint, country)) {
          counts[countryName]++;
        }
      });
    });

    return counts;
  }, [countries, pins]);

  // Find the maximum number of pins in a country
  const maxCount = Math.max(...Object.values(countryCounts), 1);

  // Country smoother transition
  useEffect(() => {
    if (!geoJsonRef.current) return;

    geoJsonRef.current.eachLayer((country) => {
      const element = country.getElement?.();

      if (!element) return;

      const countryName = country.feature.properties.name;
      const count = countryCounts[countryName] || 0;

      if (count === 0) return;

      element.style.transition = "fill-opacity 0.5s ease, opacity 0.5s ease";

      element.style.opacity = "0";

      requestAnimationFrame(() => {
        element.style.opacity = "1";
      });
    });
  }, [countries, countryCounts]);

  if (!countries) {
    return null;
  }

  // Styling
  const style = (feature) => {
    const countryName = feature.properties.name;
    const count = countryCounts[countryName] || 0;

    if (count === 0) {
      return {
        fillOpacity: 0,
        opacity: 0,
        weight: 0,
      };
    }

    return {
      fillColor: getColor(count, maxCount),
      weight: 1,
      color: "#555",
      fillOpacity: 0.75,
    };
  };

  // This setup is done for each feature in the GeoJSON on load
  const onEachCountry = (feature, layer) => {
    const countryName = feature.properties.name;
    const count = countryCounts[countryName] || 0;

    if (count === 0) {
      return;
    }

    // Tooltip
    layer.bindTooltip(
      `<strong>${countryName}</strong><br>${count} ${
        count === 1 ? "pin" : "pins"
      }`,
    );

    // Hover
    layer.on({
      mouseover: (e) => {
        e.target.setStyle({
          weight: 2,
          color: "#fff",
          fillOpacity: 0.9,
        });
      },

      mouseout: (e) => {
        e.target.setStyle(style(feature));
      },
    });
  };

  return (
    <GeoJSON
      ref={geoJsonRef}
      data={countries}
      style={style}
      onEachFeature={onEachCountry}
    />
  );
}

export default Choropleth;
