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
  centerOnUser?: boolean;
  userLocation?: [number, number] | null;
  maxDistance?: number; // in kilometers
}

// Fix for default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TempleMap = ({ temples, onVisitTemple, centerOnUser = false, userLocation: propsUserLocation, maxDistance }: TempleMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(propsUserLocation || null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (propsUserLocation) {
      setUserLocation(propsUserLocation);
    } else if (navigator.geolocation && !centerOnUser) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Location access denied or unavailable');
        }
      );
    }
  }, [propsUserLocation, centerOnUser]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Center on user location if specified, otherwise center on India
    const center: [number, number] = (centerOnUser && userLocation) ? userLocation : [20.5937, 78.9629];
    const zoom = centerOnUser ? 12 : 5;

    map.current = L.map(mapContainer.current).setView(center, zoom);

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
  }, [centerOnUser, userLocation]);

  // Update map center when user location changes
  useEffect(() => {
    if (map.current && centerOnUser && userLocation) {
      map.current.setView(userLocation, 12);
    }
  }, [userLocation, centerOnUser]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.current?.removeLayer(layer);
      }
    });

    // Add temple markers
    let templesToShow = temples;
    
    // Filter by distance if maxDistance is specified and user location is available
    if (maxDistance && userLocation) {
      templesToShow = temples.filter(temple => {
        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          temple.latitude,
          temple.longitude
        );
        return distance <= maxDistance;
      });
    }
    
    templesToShow.forEach((temple) => {
      const marker = L.marker([temple.latitude, temple.longitude]).addTo(map.current!);
      
      let distance = null;
      if (userLocation) {
        distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          temple.latitude,
          temple.longitude
        );
      }
      
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2';
      popupContent.innerHTML = `
        <h3 class="font-semibold text-base mb-1">${temple.name}</h3>
        <p class="text-sm text-gray-600 mb-1">${temple.city}, ${temple.state}</p>
        ${distance ? `<p class="text-xs text-blue-600 font-medium mb-2">📍 ${distance.toFixed(1)} km away</p>` : ''}
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">⭐ ${temple.rating}</span>
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">+${temple.points} pts</span>
        </div>
      `;
      
      if (onVisitTemple) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex gap-2';
        
        const recordButton = document.createElement('button');
        recordButton.className = 'flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors';
        recordButton.textContent = 'Record Visit';
        recordButton.onclick = () => onVisitTemple(temple.id);
        
        const knowMoreButton = document.createElement('a');
        knowMoreButton.className = 'flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors text-center';
        knowMoreButton.textContent = 'Know More';
        knowMoreButton.href = `/knowledge-hub/${temple.id}`;
        
        buttonContainer.appendChild(recordButton);
        buttonContainer.appendChild(knowMoreButton);
        popupContent.appendChild(buttonContainer);
      }
      
      marker.bindPopup(popupContent);
    });

    // Add user location marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = L.marker(userLocation, { icon: userIcon })
        .addTo(map.current);
        
      if (centerOnUser) {
        userMarker.bindPopup('<div class="p-2"><strong>📍 You are here</strong></div>').openPopup();
      } else {
        userMarker.bindPopup('<div class="p-2"><strong>Your Location</strong></div>');
      }
      
      // Add a circle to show search radius if maxDistance is specified
      if (maxDistance && centerOnUser) {
        L.circle(userLocation, {
          radius: maxDistance * 1000, // convert km to meters
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          weight: 2,
        }).addTo(map.current);
      }
    }
  }, [temples, userLocation, onVisitTemple, maxDistance, centerOnUser]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[500px] rounded-lg border border-border"
      style={{ zIndex: 0 }}
    />
  );
};

export default TempleMap;
