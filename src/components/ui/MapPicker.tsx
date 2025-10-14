import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { SearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet-geosearch/dist/geosearch.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Komponen untuk search bar
function SearchField({ onChange }: { onChange: (lat: string, lng: string) => void }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        countrycodes: "id", // hanya Indonesia
        addressdetails: 1,
      },
    });

    const searchControl = SearchControl({
      provider,
      style: "bar",
      showMarker: true,
      showPopup: false,
      marker: {
        icon: markerIcon,
      },
    });

    map.addControl(searchControl);

    map.on("geosearch/showlocation", (result: any) => {
      const { x, y } = result.location;
      onChange(y.toString(), x.toString());
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onChange]);

  return null;
}

// Komponen untuk klik manual di map
function ClickHandler({ onChange }: { onChange: (lat: string, lng: string) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat.toString(), e.latlng.lng.toString());
    },
  });
  return null;
}

export default function MapPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string) => void;
}) {
  const lat = parseFloat(latitude) || -6.2;
  const lng = parseFloat(longitude) || 106.8;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lng]} icon={markerIcon} />
      <SearchField onChange={onChange} />
      <ClickHandler onChange={onChange} />
    </MapContainer>
  );
}
