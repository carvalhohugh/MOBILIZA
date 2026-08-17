"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Correção para ícones padrão do Leaflet no Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Ícone Customizado do MOBILIZA 33 (Vermelho)
const mobilizaIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type Representation = {
  id: string;
  name: string;
  state_id: string;
  city: string;
  type: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
};

export default function Map({ representations }: { representations: Representation[] }) {
  // Centro geográfico aproximado do Brasil
  const center: [number, number] = [-14.235, -51.925];

  return (
    <MapContainer 
      center={center} 
      zoom={4} 
      style={{ height: "600px", width: "100%", zIndex: 0 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {representations.map((rep) => {
        if (rep.latitude && rep.longitude && rep.status !== 'INATIVA') {
          return (
            <Marker 
              key={rep.id} 
              position={[rep.latitude, rep.longitude]}
              icon={mobilizaIcon}
            >
              <Popup>
                <div className="text-center font-sans space-y-2 pb-2">
                  <h3 className="font-bold text-red-600 text-lg">{rep.name}</h3>
                  <p className="text-sm text-neutral-600 font-medium">{rep.city} - {rep.state_id}</p>
                  <p className="text-xs text-neutral-400 uppercase tracking-widest bg-neutral-100 rounded inline-block px-2 py-1 mb-2">
                    {rep.type}
                  </p>
                  <div>
                    <a 
                      href={rep.type === 'MUNICIPAL' ? `/presenca/${rep.state_id.toLowerCase()}/${rep.city.toLowerCase().replace(/ /g, '-')}` : `/presenca/${rep.state_id.toLowerCase()}`}
                      className="inline-block bg-red-600 hover:bg-red-700 !text-white font-bold px-4 py-2 rounded text-xs no-underline transition-colors mt-2"
                    >
                      Acessar Diretório {rep.type === 'MUNICIPAL' ? 'Municipal' : 'Estadual'}
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
}
