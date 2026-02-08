import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon markers in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const EmergencyMap = ({ emergencies }) => {
  // Center the map on a default location (e.g., your current city)
  const defaultPosition = [20.2961, 85.8245]; 

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <MapContainer center={defaultPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {emergencies.map((incident) => (
          <Marker key={incident.id} position={[incident.lat, incident.lng]}>
            <Popup>
              <div className="p-1">
                <h4 className="font-bold text-red-600">{incident.type}</h4>
                <p className="text-xs">{incident.description}</p>
                <p className="text-[10px] text-slate-500 mt-1">Severity: {incident.severity}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default EmergencyMap;