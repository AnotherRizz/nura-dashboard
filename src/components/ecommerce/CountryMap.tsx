import { VectorMap } from "@react-jvectormap/core";
import { worldMill } from "@react-jvectormap/world";

interface Area {
  id: number;
  nama_area: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface CountryMapProps {
  areas: Area[];
}

const CountryMap: React.FC<CountryMapProps> = ({ areas }) => {
  return (
    <VectorMap
      map={worldMill}
      backgroundColor="transparent"
      markers={areas.map((a) => ({
        latLng: [a.latitude, a.longitude],
        name: a.nama_area, // hanya tooltip untuk area
      }))}
      markerStyle={{
        initial: {
          fill: "#465FFF",
          stroke: "#FFF",
          strokeWidth: 1,
        },
        hover: {
          fill: "#1E3A8A",
          cursor: "pointer",
        },
      }}
      regionStyle={{
        initial: {
          fill: "#3b3b3b",
          stroke: "none",
          fillOpacity: 0.6,
        },
        hover: {
          fillOpacity: 0.6, // tetap tapi tidak aktif hover warna biru
        },
      }}
      onRegionTipShow={(e) => {
        // 🔥 Hilangkan tooltip negara bawaan
        e.preventDefault();
      }}
      zoomOnScroll={false}
      zoomAnimate={true}
      zoomStep={1.5}
    />
  );
};

export default CountryMap;
