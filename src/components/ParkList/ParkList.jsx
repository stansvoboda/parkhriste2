import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchGolemioData } from '../AppMap/api'; 
import './ParkList.css';

// Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const ParkList = () => {
  const [gardens, setGardens] = useState(null);
  const [playgrounds, setPlaygrounds] = useState(null);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Získání polohy uživatele
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
    const loadData = async () => {
      const gardensData = await fetchGolemioData("/v2/gardens");
      const playgroundsData = await fetchGolemioData("/v2/playgrounds");
      if (!gardensData && !playgroundsData) setError("Nepodařilo se načíst data z Golemio API");
      setGardens(gardensData);
      setPlaygrounds(playgroundsData);
    };
    loadData();
  }, []);

  const renderDistance = (feature) => {
    if (!userLocation) return null;
    const coords = feature.geometry?.coordinates;
    if (!coords) return null;
    // GeoJSON: [lon, lat]
    const dist = getDistanceFromLatLonInKm(
      userLocation.lat,
      userLocation.lon,
      coords[1],
      coords[0]
    );
    return (
      <span className="text-xs text-info ml-2">
        ({dist ? dist.toFixed(1) : '?'} km)
      </span>
    );
  };

  return (
    <div className="park-list-container">
      {error && <div className="alert alert-error m-4 max-w-2xl"><span>{error}</span></div>}
      
      <h2 className="text-2xl font-bold m-4 text-primary">Seznam zahrad</h2>
      <ul className="park-list">
        {gardens?.features?.map((item, index) => (
          <li key={`garden-${index}`} className="park-item">
            <Link
              to={`/mapa?type=garden&id=${item.properties.id}`}
              className="link link-primary"
            >
              {item.properties.name || 'Bez názvu'} (Zahrada)
            </Link>
            {renderDistance(item)}
            <p className="text-sm text-base-content">
              {item.properties.address?.address_formatted || 'Adresa není k dispozici'}
            </p>
          </li>
        )) || <p>Žádné zahrady nenalezeny.</p>}
      </ul>

      <h2 className="text-2xl font-bold m-4 text-primary">Seznam hřišť</h2>
      <ul className="park-list">
        {playgrounds?.features?.map((item, index) => (
          <li key={`playground-${index}`} className="park-item">
            <Link
              to={`/mapa?type=playground&id=${item.properties.id}`}
              className="link link-primary"
            >
              {item.properties.name || 'Bez názvu'} (Hřiště)
            </Link>
            {renderDistance(item)}
            <p className="text-sm text-base-content">
              {item.properties.address?.address_formatted || 'Adresa není k dispozici'}
            </p>
          </li>
        )) || <p>Žádné hřiště nenalezeno.</p>}
      </ul>
    </div>
  );
};

export default ParkList;