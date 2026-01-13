"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { HistoryEvent } from "@/data/history";
import { renderToStaticMarkup } from "react-dom/server";
import { Mic2, Music, Star, Sparkles, MapPin } from "lucide-react";

// Fix Leaflet default icon issue in Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface HistoryMapProps {
    events: HistoryEvent[];
}

const eventTypeIcons: Record<string, any> = {
    Live: Mic2,
    Release: Music,
    Milestone: Star,
    Formation: Sparkles,
    Other: MapPin,
};

const eventTypeColors: Record<string, string> = {
    Live: "#eab308", // yellow-500
    Release: "#22d3ee", // cyan-400
    Milestone: "#c084fc", // purple-400
    Formation: "#f472b6", // pink-400
    Other: "#94a3b8", // slate-400
};

// Component to fit bounds
const MapBounds = ({ events }: { events: HistoryEvent[] }) => {
    const map = useMap();

    useEffect(() => {
        if (events.length > 0) {
            const bounds = L.latLngBounds(events.map(e => [e.location!.lat, e.location!.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [events, map]);

    return null;
};

const createCustomIcon = (type: string) => {
    const IconComponent = eventTypeIcons[type] || eventTypeIcons.Other;
    const color = eventTypeColors[type] || eventTypeColors.Other;

    const iconHtml = renderToStaticMarkup(
        <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.9)', // slate-800
            border: `2px solid ${color}`,
            borderRadius: '50%',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            boxShadow: `0 0 10px ${color}80`
        }}>
            <IconComponent size={20} color={color} />
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18], // Center
        popupAnchor: [0, -20],
    });
};

export default function HistoryMap({ events }: HistoryMapProps) {
    // Client-side only rendering check
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Filter events that have location data
    const mapEvents = events.filter(e => e.location);

    if (!isMounted) return <div className="h-[600px] w-full bg-slate-800/50 animate-pulse rounded-xl" />;

    // Default center (Tokyo)
    const center: [number, number] = [35.6762, 139.6503];

    return (
        <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-2xl border border-white/10 relative z-0">
            <MapContainer center={center} zoom={5} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {mapEvents.map((event, index) => (
                    <Marker
                        key={`${event.year}-${index}`}
                        position={[event.location!.lat, event.location!.lng]}
                        icon={createCustomIcon(event.type)}
                    >
                        <Popup className="custom-popup">
                            <div className="p-2 min-w-[200px]">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
                                    style={{
                                        backgroundColor: `${eventTypeColors[event.type]}20`,
                                        color: eventTypeColors[event.type],
                                        border: `1px solid ${eventTypeColors[event.type]}40`
                                    }}
                                >
                                    {event.year} • {event.type}
                                </span>
                                <h3 className="font-bold text-sm mb-1">{event.title}</h3>
                                <p className="text-xs text-slate-500 mb-2">{event.location?.name}</p>
                                <p className="text-xs">{event.description}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapBounds events={mapEvents} />
            </MapContainer>

            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    background-color: rgba(15, 23, 42, 0.95);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(8px);
                }
                .leaflet-popup-tip {
                    background-color: rgba(15, 23, 42, 0.95);
                }
                .leaflet-container {
                    background-color: #0f172a;
                }
            `}</style>
        </div>
    );
}
