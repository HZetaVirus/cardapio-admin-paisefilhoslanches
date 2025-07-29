import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Importar CSS do Leaflet
import 'leaflet/dist/leaflet.css';

// Importar a função para criar admin (disponível no console)
import './utils/createAdminUser';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);