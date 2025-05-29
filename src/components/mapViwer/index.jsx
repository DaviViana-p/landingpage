import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import { OSM } from 'ol/source';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import { Draw } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { LineString } from 'ol/geom';
import { getLength } from 'ol/sphere';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import { transformExtent } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

// Defina o código EPSG:31984 (SIRGAS 2000 / UTM zone 24S)
proj4.defs('EPSG:31984', '+proj=utm +zone=24 +south +datum=SIRGAS2000 +units=m +no_defs');
register(proj4);

// Utilitário para gerar uma key única e amigável
function makeLayerKey(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

// Função para buscar nomes das camadas do GeoServer via GetCapabilities (agora retorna bbox)
async function fetchGeoServerLayers() {
  const url = 'https://geoserver.rvstopografia.com/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities';
  const response = await fetch(url);
  const text = await response.text();
  const parser = new window.DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');

  const allLayers = Array.from(xml.querySelectorAll('Layer > Layer'));
  const layers = allLayers
    .map(layer => {
      const nameEl = layer.querySelector('Name');
      if (!nameEl) return null;
      const name = nameEl.textContent;
      // Try both CRS and SRS for WMS 1.3.0 and 1.1.1 compatibility
      let bboxEl = layer.querySelector('BoundingBox[CRS="EPSG:31984"], BoundingBox[SRS="EPSG:31984"]')
        || layer.querySelector('BoundingBox[CRS="EPSG:4326"], BoundingBox[SRS="EPSG:4326"]');
      let bbox = null;
      if (bboxEl) {
        const minx = parseFloat(bboxEl.getAttribute('minx'));
        const miny = parseFloat(bboxEl.getAttribute('miny'));
        const maxx = parseFloat(bboxEl.getAttribute('maxx'));
        const maxy = parseFloat(bboxEl.getAttribute('maxy'));
        if (
          !isNaN(minx) && !isNaN(miny) &&
          !isNaN(maxx) && !isNaN(maxy)
        ) {
          bbox = [minx, miny, maxx, maxy];
        }
      }
      // Optional: get Title for a more user-friendly label
      const titleEl = layer.querySelector('Title');
      const label = titleEl ? titleEl.textContent : name;
      return { name, bbox, label };
    })
    .filter(Boolean);
  return layers;
}

// Agrupa as camadas por categoria (prefixo antes do :)
function groupLayersByCategory(layers) {
  const groups = {};
  layers.forEach(cfg => {
    const [category, rest] = cfg.label.split(':');
    const cat = rest ? category : 'Outros';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(cfg);
  });
  return groups;
}

function MapViewer() {
  const mapRef = useRef(null);
  const layerRefs = useRef({});
  const measureLayerRef = useRef(null);
  const drawRef = useRef(null);

  const [layerConfigs, setLayerConfigs] = useState([]);
  const [layersVisibility, setLayersVisibility] = useState({});
  const [search, setSearch] = useState('');
  const [protectedOpen, setProtectedOpen] = useState(true);
  const [measuring, setMeasuring] = useState(false);
  const [measureResult, setMeasureResult] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);
  const [menuMinimized, setMenuMinimized] = useState(false);
  const [layerPositions, setLayerPositions] = useState({});
  const [categoryOpen, setCategoryOpen] = useState({});

  // Busca as camadas do GeoServer ao carregar
  useEffect(() => {
    fetchGeoServerLayers().then(layers => {
      // Garante keys únicas mesmo para nomes repetidos
      const keyCount = {};
      const configs = layers.map(({ name, bbox }) => {
        let baseKey = makeLayerKey(name);
        let key = baseKey;
        if (keyCount[baseKey] !== undefined) {
          keyCount[baseKey] += 1;
          key = `${baseKey}_${keyCount[baseKey]}`;
        } else {
          keyCount[baseKey] = 0;
        }
        return {
          key,
          label: name,
          layer: name,
          bbox, // salva o bbox
        };
      });
      setLayerConfigs(configs);
      setLayersVisibility(Object.fromEntries(configs.map(cfg => [cfg.key, false])));

      // Agrupa por categoria e inicializa todas recolhidas
      const grouped = groupLayersByCategory(configs);
      const initialCategoryOpen = {};
      Object.keys(grouped).forEach(cat => {
        initialCategoryOpen[cat] = false;
      });
      setCategoryOpen(initialCategoryOpen);
    });
  }, []);

  // Cria as layers do OpenLayers dinamicamente
  useEffect(() => {
    if (layerConfigs.length === 0) return;

    layerConfigs.forEach(cfg => {
      // Exemplo: se quiser usar ImageWMS para algumas camadas específicas, personalize aqui
      if (cfg.key === 'bairros2005') {
        layerRefs.current[cfg.key] = new ImageLayer({
          visible: layersVisibility[cfg.key],
          source: new ImageWMS({
            url: 'hhttps://geoserver.rvstopografia.com/geoserver/zoneamento_final/wms',
            params: {
              'LAYERS': cfg.layer,
              'FORMAT': 'image/png',
              'TRANSPARENT': true,
              'SRS': 'EPSG:31984', 
              'VERSION': '1.1.1',  
            },
            serverType: 'geoserver',
            crossOrigin: 'anonymous',
          }),
        });
      } else {
        layerRefs.current[cfg.key] = new TileLayer({
          visible: layersVisibility[cfg.key],
          source: new TileWMS({
            // Use o workspace correto extraído do nome da camada
            url: `https://geoserver.rvstopografia.com/geoserver/${cfg.layer.split(':')[0]}/wms`,
            params: {
              'LAYERS': cfg.layer,
              'FORMAT': 'image/png',
              'TRANSPARENT': true,
              'SRS': 'EPSG:31984', 
              'VERSION': '1.1.1',  
            },
            serverType: 'geoserver',
            crossOrigin: 'anonymous',
          }),
        });
      }
    });

    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({ source: new OSM() }),
        ...layerConfigs.map(cfg => layerRefs.current[cfg.key]).filter(Boolean),
      ],
      view: new View({
        center: [-41.8847, -22.7469],
        zoom: 13,
        projection: 'EPSG:4326',
      }),
    });

    mapRef.current = map;
    return () => {
      map.setTarget(undefined);
    };
  }, [layerConfigs]);

  // Atualiza visibilidade das layers
  useEffect(() => {
    layerConfigs.forEach(cfg => {
      const layer = layerRefs.current[cfg.key];
      if (layer) {
        layer.setVisible(layersVisibility[cfg.key]);
      }
    });
  }, [layersVisibility, layerConfigs]);

  // Medição (mantém igual ao seu)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    if (measuring) {
      if (!measureLayerRef.current) {
        measureLayerRef.current = new VectorLayer({
          source: new VectorSource(),
          style: new Style({
            stroke: new Stroke({
              color: '#ffcc33',
              width: 2,
            }),
            fill: new Fill({
              color: 'rgba(255, 255, 0, 0.2)',
            }),
          }),
        });
        map.addLayer(measureLayerRef.current);
      }

      measureLayerRef.current.getSource()?.clear();

      const draw = new Draw({
        source: measureLayerRef.current.getSource(),
        type: 'LineString',
      });

      let sketch = null;
      let pointerMoveHandler = null;

      draw.on('drawstart', evt => {
        sketch = evt.feature.getGeometry();

        pointerMoveHandler = (e) => {
          if (sketch) {
            const length = getLength(sketch, { projection: 'EPSG:4326' });
            setMeasureResult(`${length.toFixed(2)} metros`);
            setMousePosition(e.pixel);
          }
        };
        map.on('pointermove', pointerMoveHandler);
      });

      draw.on('drawend', () => {
        sketch = null;
        if (pointerMoveHandler) {
          map.un('pointermove', pointerMoveHandler);
        }
      });

      map.addInteraction(draw);
      drawRef.current = draw;
    } else {
      if (measureLayerRef.current) {
        map.removeLayer(measureLayerRef.current);
        measureLayerRef.current = null;
      }
      setMeasureResult(null);
      setMousePosition(null);
    }
  }, [measuring]);

  // Função para mover camada para posição específica
  function moveLayerToPosition(layerKey, position) {
    const map = mapRef.current;
    const layer = layerRefs.current[layerKey];
    if (!map || !layer) return;

    const layers = [...map.getLayers().getArray()];
    const idx = layers.indexOf(layer);
    const min = 1;
    const max = layers.length - 1;
    let newPos = Math.max(min, Math.min(Number(position), max));
    if (idx === -1 || idx === newPos) return;

    layers.splice(idx, 1);
    layers.splice(newPos, 0, layer);
    map.setLayers(layers);
  }

  // Filtro de busca
  const filteredLayers = layerConfigs.filter(cfg =>
    cfg.label.toLowerCase().includes(search.toLowerCase())
  );

  // Agrupa as camadas filtradas por categoria
  const groupedLayers = groupLayersByCategory(filteredLayers);

  // Função para alternar o estado de aberto/fechado de uma categoria
  function toggleCategory(cat) {
    setCategoryOpen(open => ({
      ...open,
      [cat]: !open[cat],
    }));
  }

  function handlePositionInputChange(layerKey, value) {
    setLayerPositions(pos => ({
      ...pos,
      [layerKey]: value,
    }));
  }

  function handlePositionInputBlur(layerKey, value) {
    moveLayerToPosition(layerKey, value);
    setLayerPositions(pos => ({
      ...pos,
      [layerKey]: undefined,
    }));
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Barra de ferramentas horizontal no topo */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          gap: 16,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          padding: '8px 16px',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => setMeasuring(m => !m)}
          title="Medir distância"
          style={{
            background: measuring ? '#e0e7ff' : 'transparent',
            border: 'none',
            borderRadius: 4,
            padding: 8,
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            color: measuring ? '#2563eb' : '#444',
          }}
        >
          <span style={{ marginRight: 6 }}>📏</span>
          {measuring ? 'Desligar Medida' : 'Medir'}
        </button>
      </div>

      {/* Tooltip de medida */}
      {mousePosition && measureResult && measuring && (
        <div
          style={{
            position: 'fixed',
            left: mousePosition[0],
            top: mousePosition[1],
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '4px',
            borderRadius: '4px',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            fontWeight: 'bold',
          }}
        >
          {measureResult}
        </div>
      )}

      {/* Menu lateral esquerdo */}
      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          background: '#fff',
          padding: 0,
          maxWidth: 350,
          maxHeight: '95vh',
          overflowY: 'auto',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          left: 16,
          top: 72,
          transition: 'width 0.2s',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            padding: '8px 8px 8px 12px',
            background: '#f7f7f7',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <input
            type="text"
            placeholder="Buscar camada..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              marginRight: 8,
              padding: 4,
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14,
              background: menuMinimized ? '#f7f7f7' : '#fff',
              transition: 'background 0.2s',
            }}
            onFocus={() => setMenuMinimized(false)}
          />
          <button
            onClick={() => setMenuMinimized(m => !m)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 18,
              padding: 2,
              color: '#888',
              marginLeft: 2,
            }}
            title={menuMinimized ? 'Expandir menu' : 'Minimizar menu'}
          >
            {menuMinimized ? '☰' : '−'}
          </button>
        </div>
        {!menuMinimized && (
          <div style={{ padding: 12 }}>
            {Object.entries(groupedLayers).map(([cat, layers]) => (
              <div key={cat} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontWeight: 'bold',
                    color: '#2563eb',
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <button
                    onClick={() => toggleCategory(cat)}
                    style={{
                      marginRight: 8,
                      border: 'none',
                      background: 'transparent',
                      fontSize: 16,
                      cursor: 'pointer',
                      color: '#2563eb',
                    }}
                    title={categoryOpen[cat] ? 'Minimizar' : 'Expandir'}
                  >
                    {categoryOpen[cat] ? '−' : '+'}
                  </button>
                  {cat}
                </div>
                {categoryOpen[cat] !== false && layers.map(cfg => {
                  const visible = layersVisibility[cfg.key];
                  const position =
                    mapRef.current && visible
                      ? mapRef.current.getLayers().getArray().indexOf(layerRefs.current[cfg.key])
                      : '';
                  return (
                    <div
                      key={cfg.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 4,
                        padding: '2px 0',
                        gap: 8,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={e => {
                          setLayersVisibility(v => ({
                            ...v,
                            [cfg.key]: e.target.checked,
                          }));
                          // Se ativou a camada e tem bbox, centraliza e dá zoom
                          if (e.target.checked && cfg.bbox && mapRef.current) {
                            let bbox = cfg.bbox;
                            const isUTM = Math.abs(bbox[0]) > 180 || Math.abs(bbox[2]) > 180;
                            if (isUTM) {
                              bbox = transformExtent(bbox, 'EPSG:31984', 'EPSG:4326');
                            }
                            mapRef.current.getView().fit(bbox, { duration: 700, padding: [40, 40, 40, 40] });
                          }
                        }}
                        style={{ marginRight: 6 }}
                      />
                      <span
                        style={{
                          flex: 1,
                          cursor: cfg.bbox ? 'pointer' : 'default',
                          textDecoration: cfg.bbox ? 'underline' : 'none',
                          whiteSpace: 'normal',
                          wordBreak: 'break-all',
                          marginRight: 0,
                          fontSize: 14,
                        }}
                        onClick={() => {
                          if (cfg.bbox && mapRef.current) {
                            let bbox = cfg.bbox;
                            const isUTM = Math.abs(bbox[0]) > 180 || Math.abs(bbox[2]) > 180;
                            if (isUTM) {
                              bbox = transformExtent(bbox, 'EPSG:31984', 'EPSG:4326');
                            }
                            mapRef.current.getView().fit(bbox, { duration: 700, padding: [40, 40, 40, 40] });
                          }
                        }}
                      >
                        {cfg.label}
                      </span>
                      {visible && (
                        <input
                          type="number"
                          min={1}
                          max={layerConfigs.length}
                          value={
                            layerPositions[cfg.key] !== undefined
                              ? layerPositions[cfg.key]
                              : position
                          }
                          style={{ width: 40, minWidth: 40 }}
                          onChange={e => handlePositionInputChange(cfg.key, e.target.value)}
                          onBlur={e => handlePositionInputBlur(cfg.key, e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handlePositionInputBlur(cfg.key, e.target.value);
                              e.target.blur();
                            }
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {filteredLayers.length === 0 && (
              <div style={{ color: '#888' }}>Nenhuma camada encontrada</div>
            )}
          </div>
        )}
      </div>

      {/* Mapa ocupa todo o fundo */}
      <div id="map" style={{ width: '100vw', height: '100vh' }} />
    </div>
  );
}

export default MapViewer;