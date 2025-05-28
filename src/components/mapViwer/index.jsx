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

const protectedAreas = [
  { key: 'afloramento_rochoso', label: 'Afloramento Rochoso', layer: 'zoneamento_final:areas_protegidas___afloramento_rochoso' },
  { key: 'apa_azeda', label: 'APA Azeda', layer: 'zoneamento_final:areas_protegidas___apa_azeda' },
  { key: 'apa_das_aguas_tucuns', label: 'APA das Águas Tucuns', layer: 'zoneamento_final:areas_protegidas___apa_das_aguas_tucuns' },
  { key: 'apa_do_mangue_de_pedras', label: 'APA do Mangue de Pedras', layer: 'zoneamento_final:areas_protegidas___apa_do_mangue_de_pedras' },
  { key: 'apa_mangue_de_pedras', label: 'APA Mangue de Pedras', layer: 'zoneamento_final:areas_protegidas___apa_mangue_de_pedras' },
  { key: 'apa_marinha', label: 'APA Marinha', layer: 'zoneamento_final:areas_protegidas___apa_marinha' },
  { key: 'apa_pau_brasil', label: 'APA Pau Brasil', layer: 'zoneamento_final:areas_protegidas___apa_pau_brasil' },
  { key: 'apa_pesca_artesanal', label: 'APA Pesca Artesanal', layer: 'zoneamento_final:areas_protegidas___apa_pesca_artesanal' },
  { key: 'app_topo_de_morro', label: 'APP Topo de Morro', layer: 'zoneamento_final:areas_protegidas___app_topo_de_morro' },
  { key: 'corais_bardot', label: 'Corais Bardot', layer: 'zoneamento_final:areas_protegidas___corais_bardot' },
  { key: 'corais_joao_fernandes', label: 'Corais João Fernandes', layer: 'zoneamento_final:areas_protegidas___corais_joao_fernandes' },
  { key: 'corais_tartaruga', label: 'Corais Tartaruga', layer: 'zoneamento_final:areas_protegidas___corais_tartaruga' },
  { key: 'inepac', label: 'INEPAC', layer: 'zoneamento_final:areas_protegidas___inepac' },
  { key: 'monumento_natural', label: 'Monumento Natural', layer: 'zoneamento_final:areas_protegidas___monumento_natural' },
  { key: 'parque_geriba', label: 'Parque Geribá', layer: 'zoneamento_final:areas_protegidas___parque_geriba' },
  { key: 'parque_lagoinha', label: 'Parque Lagoinha', layer: 'zoneamento_final:areas_protegidas___parque_lagoinha' },
  { key: 'parque_municipal_das_dunas', label: 'Parque Municipal das Dunas', layer: 'zoneamento_final:areas_protegidas___parque_municipal_das_dunas' },
  { key: 'pecs_atualizado_buzios', label: 'PECS Atualizado Búzios', layer: 'zoneamento_final:areas_protegidas___pecs_atualizado_buzios' },
  { key: 'protecao_afloramento_rochoso_5m', label: 'Proteção Afloramento Rochoso 5m', layer: 'zoneamento_final:areas_protegidas___protecao_afloramento_rochoso_5m' },
];

const otherLayers = [
  { key: 'bairros2005', label: 'Bairros2005', layer: 'zoneamento_final:bairros2005' },
  { key: 'lei_de_uso_do_solo_zoneamento_1', label: 'Lei de Uso do Solo Zoneamento — Zoneamento 1', layer: 'zoneamento_final:lei_de_uso_do_solo_zoneamento___zoneamento_1' },
  { key: 'limite_oficial_municipio', label: 'Limite Oficial do Município — Limite Oficial Município', layer: 'zoneamento_final:limite_oficial_do_municipio___limite_oficial_municipio' },
  { key: 'marcos_de_limite', label: 'Limite Oficial do Município — Marcos de Limite', layer: 'zoneamento_final:limite_oficial_do_municipio___marcos_de_limite' },
  { key: 'ruas', label: 'Ruas', layer: 'zoneamento_final:ruas' },
  { key: 'ruas_inicio_e_fim', label: 'buzios_RJ', layer: 'zoneamento_final:ruas___inicio_e_fim' },
  { key: 'areas_protegidas', label: 'areas_protegidas', layer: 'zoneamento_final:areas_protegidas' },
  { key: 'Zoneamento_Final — Zoneamento_1', label: 'Zoneamento_Final', layer: 'zoneamento_final:zoneamento_final___zoneamento_1' },
];

const layerConfigs = [...protectedAreas, ...otherLayers];

function MapViewer() {
  const mapRef = useRef(null);
  const layerRefs = useRef({});
  const measureLayerRef = useRef(null);
  const drawRef = useRef(null);

  const [layersVisibility, setLayersVisibility] = useState(
    Object.fromEntries(layerConfigs.map(l => [l.key, false]))
  );
  const [protectedOpen, setProtectedOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [measuring, setMeasuring] = useState(false);
  const [measureResult, setMeasureResult] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);
  const [menuMinimized, setMenuMinimized] = useState(false);

  useEffect(() => {
    layerConfigs.forEach(cfg => {
      if (cfg.key === 'bairros2005') {
        layerRefs.current[cfg.key] = new ImageLayer({
          visible: layersVisibility[cfg.key],
          source: new ImageWMS({
            url: 'https://145.223.75.113:8443/geoserver/zoneamento_final/wms',
            params: {
              'LAYERS': cfg.layer,
              'FORMAT': 'image/png',
              'TRANSPARENT': true,
              'SRS': 'EPSG:4326',
            },
            serverType: 'geoserver',
            crossOrigin: 'anonymous',
          }),
        });
      } else {
        layerRefs.current[cfg.key] = new TileLayer({
          visible: layersVisibility[cfg.key],
          source: new TileWMS({
            url: 'https://145.223.75.113:8443/geoserver/zoneamento_final/wms',
            params: {
              'LAYERS': cfg.layer,
              'FORMAT': 'image/png',
              'TRANSPARENT': true,
              'SRS': 'EPSG:4326',
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
  }, []);

  useEffect(() => {
    layerConfigs.forEach(cfg => {
      const layer = layerRefs.current[cfg.key];
      if (layer) {
        layer.setVisible(layersVisibility[cfg.key]);
      }
    });
  }, [layersVisibility]);

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

  const handleProtectedToggle = () => {
    const allSelected = protectedAreas.every(cfg => layersVisibility[cfg.key]);
    setLayersVisibility(v => ({
      ...v,
      ...Object.fromEntries(protectedAreas.map(cfg => [cfg.key, !allSelected])),
    }));
  };

  const filteredProtected = protectedAreas.filter(cfg =>
    cfg.label.toLowerCase().includes(search.toLowerCase())
  );
  const filteredOthers = otherLayers.filter(cfg =>
    cfg.label.toLowerCase().includes(search.toLowerCase())
  );

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
        {/* Adicione outros ícones de ferramentas aqui, se desejar */}
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
            <div
              style={{
                fontWeight: 'bold',
                marginBottom: 4,
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => setProtectedOpen(open => !open)}
            >
              <span style={{ marginRight: 6 }}>{protectedOpen ? '▼' : '▶'}</span>
              <input
                type="checkbox"
                checked={protectedAreas.every(cfg => layersVisibility[cfg.key])}
                onChange={e => { e.stopPropagation(); handleProtectedToggle(); }}
                onClick={e => e.stopPropagation()}
                style={{ marginRight: 6 }}
                ref={el => {
                  if (el) {
                    el.indeterminate =
                      protectedAreas.some(cfg => layersVisibility[cfg.key]) &&
                      !protectedAreas.every(cfg => layersVisibility[cfg.key]);
                  }
                }}
              />
              Áreas Protegidas
            </div>
            {protectedOpen && (
              <div style={{ marginLeft: 12, marginBottom: 8 }}>
                {filteredProtected.length === 0 && (
                  <div style={{ color: '#888' }}>Nenhuma camada encontrada</div>
                )}
                {filteredProtected.map(cfg => (
                  <label
                    key={cfg.key}
                    style={{
                      display: 'block',
                      marginBottom: 4,
                      cursor: 'pointer',
                      padding: '2px 0',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={layersVisibility[cfg.key]}
                      onChange={e =>
                        setLayersVisibility(v => ({
                          ...v,
                          [cfg.key]: e.target.checked,
                        }))
                      }
                      style={{ marginRight: 6 }}
                    />
                    {cfg.label}
                  </label>
                ))}
              </div>
            )}
            {filteredOthers.length > 0 &&
              filteredOthers.map(cfg => (
                <label
                  key={cfg.key}
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    cursor: 'pointer',
                    padding: '2px 0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={layersVisibility[cfg.key]}
                    onChange={e =>
                      setLayersVisibility(v => ({
                        ...v,
                        [cfg.key]: e.target.checked,
                      }))
                    }
                    style={{ marginRight: 6 }}
                  />
                  {cfg.label}
                </label>
              ))}
            {filteredOthers.length === 0 &&
              filteredProtected.length === 0 && (
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