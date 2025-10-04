import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

interface Temple {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  city: string | null;
  state: string | null;
  rating: number;
  points: number;
}

interface TempleMapProps {
  temples: Temple[];
  onVisitTemple?: (templeId: string) => void;
}

// Fix for default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TempleMap = ({ temples, onVisitTemple }: TempleMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Location access denied or unavailable');
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on India
    map.current = L.map(mapContainer.current).setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.current?.removeLayer(layer);
      }
    });

    // Add temple markers
    temples.forEach((temple) => {
      const marker = L.marker([temple.latitude, temple.longitude]).addTo(map.current!);
      
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2';
      popupContent.innerHTML = `
        <h3 class="font-semibold text-base mb-1">${temple.name}</h3>
        <p class="text-sm text-gray-600 mb-1">${temple.city}, ${temple.state}</p>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">⭐ ${temple.rating}</span>
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">+${temple.points} pts</span>
        </div>
      `;
      
      if (onVisitTemple) {
        const button = document.createElement('button');
        button.className = 'w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors';
        button.textContent = 'Visit Temple';
        button.onclick = () => onVisitTemple(temple.id);
        popupContent.appendChild(button);
      }
      
      marker.bindPopup(popupContent);
    });

    // Add user location marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker(userLocation, { icon: userIcon })
        .addTo(map.current)
        .bindPopup('<div class="p-2"><strong>Your Location</strong></div>');
    }
  }, [temples, userLocation, onVisitTemple]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[500px] rounded-lg border border-border"
      style={{ zIndex: 0 }}
    />
  );
};

export default TempleMap;
