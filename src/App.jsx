import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiThunderstorm } from "react-icons/wi";
import "leaflet/dist/leaflet.css";

// Fix default marker issue in Leaflet (important!)
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// This small component helps move map dynamically
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 12, { animate: true });
    }
  }, [coords, map]);
  return null;
}

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [position, setPosition] = useState([28.6139, 77.2090]); // Default Delhi
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  // Icon selector
  const getWeatherIcon = (main) => {
    switch (main) {
      case "Clear": return <WiDaySunny className="text-yellow-400 text-6xl" />;
      case "Clouds": return <WiCloud className="text-gray-200 text-6xl" />;
      case "Rain": return <WiRain className="text-blue-300 text-6xl" />;
      case "Snow": return <WiSnow className="text-white text-6xl" />;
      case "Thunderstorm": return <WiThunderstorm className="text-purple-400 text-6xl" />;
      default: return <WiCloud className="text-gray-300 text-6xl" />;
    }
  };

  const getWeather = async () => {
    if (!city) return;
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const { lat, lon } = res.data.coord;
      setWeather(res.data);
      setPosition([lat, lon]); // update marker + map center
    } catch {
      alert("City not found!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#3b82f6] flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-lg w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
        <h1 className="text-4xl font-bold mb-6 text-center text-cyan-300 drop-shadow-lg">
          🌦️ Weather Map App
        </h1>

        {/* Input Field */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Enter city name..."
            className="w-3/4 p-3 rounded-l-lg text-gray-800 focus:outline-none"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            onClick={getWeather}
            className="bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 rounded-r-lg text-white font-semibold hover:brightness-110 transition"
          >
            Search
          </button>
        </div>

        {/* Weather Info */}
        {weather && (
          <div className="bg-white/20 p-6 rounded-2xl mb-6 shadow-inner flex flex-col items-center">
            {getWeatherIcon(weather.weather[0].main)}
            <h2 className="text-3xl font-bold mt-2">{weather.name}</h2>
            <p className="capitalize text-lg">{weather.weather[0].description}</p>
            <p className="text-5xl font-extrabold mt-2 text-cyan-300">
              {weather.main.temp}°C
            </p>
          </div>
        )}

        {/* Map Section */}
        <div className="h-80 w-full rounded-2xl overflow-hidden shadow-xl border-2 border-cyan-400">
          <MapContainer
            center={position}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                {weather ? (
                  <>
                    <strong>{weather.name}</strong>
                    <br />
                    Temp: {weather.main.temp} °C
                  </>
                ) : (
                  "Search a city"
                )}
              </Popup>
            </Marker>
            {/* 👇 This moves the map dynamically */}
            <ChangeMapView coords={position} />
          </MapContainer>
        </div>
      </div>

      <p className="mt-8 text-white/60 text-sm tracking-wide">
        Made with 💙 React + Tailwind + Leaflet + OpenWeather
      </p>
    </div>
  );
}

export default App;
