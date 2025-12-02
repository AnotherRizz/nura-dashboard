import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

interface PolygonPickerProps {
  boundary?: any;                      // GeoJSON Polygon
  onChange: (polygon: any) => void;    // Return GeoJSON Polygon
}


export default function PolygonPicker({ boundary, onChange }: PolygonPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("polygon-map", {
        center: [-6.2000, 106.8166], // Jakarta
        zoom: 12,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapRef.current);

      // Layer untuk polygon
      drawnItemsRef.current.addTo(mapRef.current);

      // Draw Control
      const drawControl = new L.Control.Draw({
        draw: {
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false, 
          circlemarker: false,
          polygon: {
            allowIntersection: false,
            shapeOptions: {
              color: "#007bff",
            },
          },
        },
        edit: {
          featureGroup: drawnItemsRef.current,
        },
      });

      mapRef.current.addControl(drawControl);

      // Event saat polygon dibuat
      mapRef.current.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;

        // hanya boleh 1 polygon, jadi delete dulu polygon sebelumnya
        drawnItemsRef.current.clearLayers();
        drawnItemsRef.current.addLayer(layer);

        const geo = layer.toGeoJSON();
        onChange(geo);
      });

      // Event saat polygon diedit
      mapRef.current.on(L.Draw.Event.EDITED, () => {
        const layers = drawnItemsRef.current.getLayers();
        if (layers.length > 0) {
          const geo = layers[0].toGeoJSON();
          onChange(geo);
        }
      });

      // Event saat polygon dihapus
      mapRef.current.on(L.Draw.Event.DELETED, () => {
        onChange(null);
      });
    }

    // Jika ada boundary dari initialValues
    if (boundary && mapRef.current) {
      drawnItemsRef.current.clearLayers();
      const layer = L.geoJSON(boundary);
      layer.addTo(drawnItemsRef.current);

      // Zoom ke polygon
      try {
        mapRef.current.fitBounds(layer.getBounds(), { padding: [20, 20] });
      } catch {}
    }
  }, [boundary]);

  return (
    <div
      id="polygon-map"
      className="w-full h-96 rounded-md border dark:border-gray-700"
    ></div>
  );
}
