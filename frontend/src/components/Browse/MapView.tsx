import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Car } from "../../types/index";
import { getImageUrl } from "../../utils/image";
import { MapPin, Navigation, Star, Users } from "@/lib/icons";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

// Fix Leaflet icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  cars: Car[];
}

const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  map.setView(center);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ cars }) => {
  const navigate = useNavigate();
  
  // Filter cars with valid coordinates
  const validCars = cars.filter(car => car.latitude && car.longitude);
  
  // Default center (e.g., Lagos if no cars)
  const defaultCenter: [number, number] = validCars.length > 0 
    ? [validCars[0].latitude!, validCars[0].longitude!]
    : [6.5244, 3.3792];

  return (
    <div className="h-[calc(100vh-280px)] min-h-[500px] w-full rounded-2xl overflow-hidden border border-border relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validCars.length > 0 && <ChangeView center={[validCars[0].latitude!, validCars[0].longitude!]} />}
        
        {validCars.map((car) => (
          <Marker
            key={car.id}
            position={[car.latitude!, car.longitude!]}
          >
            <Popup className="car-popup">
              <div className="w-64 overflow-hidden rounded-lg">
                <img
                  src={car.images && car.images.length > 0 ? getImageUrl(car.images[0].imageUrl, 400) : "/placeholder-car.jpg"}
                  alt={car.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-foreground text-sm leading-tight">
                      {car.brand} {car.model}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star size={10} fill="currentColor" />
                      {car.averageRating || "New"}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-muted-foreground text-[10px]">
                    <span className="flex items-center gap-1">
                      <Users size={10} />
                      {car.seats}
                    </span>
                    <span className="flex items-center gap-1">
                      <Navigation size={10} />
                      {car.locationCity}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-sm font-bold text-primary">
                      ${car.pricePerDay}<span className="text-[10px] text-muted-foreground font-normal">/day</span>
                    </p>
                    <Button 
                      size="sm" 
                      className="h-7 text-[10px] px-3"
                      onClick={() => navigate(`/car/${car.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {validCars.length === 0 && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center text-center p-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-xl max-w-sm">
            <MapPin size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-bold mb-2">No Locations Available</h3>
            <p className="text-sm text-muted-foreground">
              These vehicles don't have precise location coordinates set. Try searching in another area.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
