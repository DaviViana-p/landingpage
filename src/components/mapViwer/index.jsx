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

const layerConfigs = [
  // Áreas Protegidas
  { key: 'afloramento_rochoso', label: 'Áreas Protegidas — Afloramento_Rochoso', layer: 'zoneamento_final:areas_protegidas___afloramento_rochoso' },
  { key: 'apa_azeda', label: 'Áreas Protegidas — APA_Azeda', layer: 'zoneamento_final:areas_protegidas___apa_azeda' },
  { key: 'apa_das_aguas_tucuns', label: 'Áreas Protegidas — APA_das_Aguas_Tucuns', layer: 'zoneamento_final:areas_protegidas___apa_das_aguas_tucuns' },
  { key: 'apa_do_mangue_de_pedras', label: 'Áreas Protegidas — APA do Mangue de Pedras', layer: 'zoneamento_final:areas_protegidas___apa_do_mangue_de_pedras' },
  { key: 'apa_mangue_de_pedras', label: 'Áreas Protegidas — APA_Mangue_de_Pedras', layer: 'zoneamento_final:areas_protegidas___apa_mangue_de_pedras' },
  { key: 'apa_marinha', label: 'Áreas Protegidas — APA_Marinha', layer: 'zoneamento_final:areas_protegidas___apa_marinha' },
  { key: 'apa_pau_brasil', label: 'Áreas Protegidas — APA_Pau_Brasil', layer: 'zoneamento_final:areas_protegidas___apa_pau_brasil' },
  { key: 'apa_pesca_artesanal', label: 'Áreas Protegidas — APA_Pesca_Artesanal', layer: 'zoneamento_final:areas_protegidas___apa_pesca_artesanal' },
  { key: 'app_topo_de_morro', label: 'Áreas Protegidas — APP_Topo_de_Morro', layer: 'zoneamento_final:areas_protegidas___app_topo_de_morro' },
  { key: 'corais_bardot', label: 'Áreas Protegidas — Corais_Bardot', layer: 'zoneamento_final:areas_protegidas___corais_bardot' },
  { key: 'corais_joao_fernandes', label: 'Áreas Protegidas — Corais_João_Fernandes', layer: 'zoneamento_final:areas_protegidas___corais_joao_fernandes' },
  { key: 'corais_tartaruga', label: 'Áreas Protegidas — Corais_Tartaruga', layer: 'zoneamento_final:areas_protegidas___corais_tartaruga' },
  { key: 'inepac', label: 'Áreas Protegidas — INEPAC', layer: 'zoneamento_final:areas_protegidas___inepac' },
  { key: 'monumento_natural', label: 'Áreas Protegidas — Monumento_Natural', layer: 'zoneamento_final:areas_protegidas___monumento_natural' },
  { key: 'parque_geriba', label: 'Áreas Protegidas — Parque_Geriba', layer: 'zoneamento_final:areas_protegidas___parque_geriba' },
  { key: 'parque_lagoinha', label: 'Áreas Protegidas — Parque_Lagoinha', layer: 'zoneamento_final:areas_protegidas___parque_lagoinha' },
  { key: 'parque_municipal_das_dunas', label: 'Áreas Protegidas — Parque_Municipal_das_Dunas', layer: 'zoneamento_final:areas_protegidas___parque_municipal_das_dunas' },
  { key: 'pecs_atualizado_buzios', label: 'Áreas Protegidas — PECS_Atualizado_Buzios', layer: 'zoneamento_final:areas_protegidas___pecs_atualizado_buzios' },
  { key: 'protecao_afloramento_rochoso_5m', label: 'Áreas Protegidas — Protecao_Afloramento_Rochoso_5m', layer: 'zoneamento_final:areas_protegidas___protecao_afloramento_rochoso_5m' },

  // Outras camadas principais
  { key: 'bairros2005', label: 'Bairros2005', layer: 'zoneamento_final:bairros2005' },
  { key: 'lei_de_uso_do_solo_zoneamento_1', label: 'Lei_de_Uso_do_Solo_Zoneamento — Zoneamento_1', layer: 'zoneamento_final:lei_de_uso_do_solo_zoneamento___zoneamento_1' },
  { key: 'limite_oficial_municipio', label: 'Limite_Oficial_do_Município — Limite_Oficial_Município', layer: 'zoneamento_final:limite_oficial_do_municipio___limite_oficial_municipio' },
  { key: 'marcos_de_limite', label: 'Limite_Oficial_do_Município — Marcos_de_Limite', layer: 'zoneamento_final:limite_oficial_do_municipio___marcos_de_limite' },
  { key: 'ruas', label: 'Ruas', layer: 'zoneamento_final:ruas' },
  { key: 'buzios_rj', label: 'buzios_RJ', layer: 'zoneamento_final:ruas___inicio_e_fim' },

  // Exemplos extras (GeoServer padrão, Natural Earth, etc)
  { key: 'world_rectangle', label: 'World rectangle', layer: 'tiger:giant_polygon' },
  { key: 'manhattan_poi', label: 'Manhattan (NY) points of interest', layer: 'tiger:poi' },
  { key: 'manhattan_landmarks', label: 'Manhattan (NY) landmarks', layer: 'tiger:poly_landmarks' },
  { key: 'manhattan_roads', label: 'Manhattan (NY) roads', layer: 'tiger:tiger_roads' },
  { key: 'arc_sample', label: 'A sample ArcGrid file', layer: 'nurc:Arc_Sample' },
  { key: 'img_sample', label: 'North America sample imagery', layer: 'nurc:Img_Sample' },
  { key: 'pk50095', label: 'Pk50095', layer: 'nurc:Pk50095' },
  { key: 'mosaic', label: 'mosaic', layer: 'nurc:mosaic' },
  { key: 'usa_population', label: 'USA Population', layer: 'topp:states' },
  { key: 'tasmania_cities', label: 'Tasmania cities', layer: 'topp:tasmania_cities' },
  { key: 'tasmania_roads', label: 'Tasmania roads', layer: 'topp:tasmania_roads' },
  { key: 'tasmania_state_boundaries', label: 'Tasmania state boundaries', layer: 'topp:tasmania_state_boundaries' },
  { key: 'tasmania_water_bodies', label: 'Tasmania water bodies', layer: 'topp:tasmania_water_bodies' },
  { key: 'spearfish_archsites', label: 'Spearfish archeological sites', layer: 'sf:archsites' },
  { key: 'spearfish_bugsites', label: 'Spearfish bug locations', layer: 'sf:bugsites' },
  { key: 'spearfish_restricted', label: 'Spearfish restricted areas', layer: 'sf:restricted' },
  { key: 'spearfish_roads', label: 'Spearfish roads', layer: 'sf:roads' },
  { key: 'spearfish_elevation', label: 'Spearfish elevation', layer: 'sf:sfdem' },
  { key: 'spearfish_streams', label: 'Spearfish streams', layer: 'sf:streams' },
  { key: 'sigweb_afloramento_rochoso', label: 'Afloramento_Rochoso', layer: 'sigweb:afloramento_rochoso' },
  { key: 'sigweb_apa_azeda', label: 'APA_Azeda', layer: 'sigweb:apa_azeda' },
  { key: 'sigweb_apa_das_aguas_tucuns', label: 'APA_das_Aguas_Tucuns', layer: 'sigweb:apa_das_aguas_tucuns' },
  { key: 'sigweb_apa_mangue_de_pedras', label: 'AEIs_2016_Select', layer: 'sigweb:apa_mangue_de_pedras' },
  { key: 'sigweb_apa_marinha', label: 'APA_Marinha', layer: 'sigweb:apa_marinha' },
  { key: 'sigweb_apa_pau_brasil', label: 'APA_Pau_Brasil', layer: 'sigweb:apa_pau_brasil' },
  { key: 'sigweb_apa_pesca_artesanal', label: 'APA_Pesca_Artesanal', layer: 'sigweb:apa_pesca_artesanal' },
  { key: 'sigweb_app_topo_de_morro', label: 'APP_Topo_de_Morro', layer: 'sigweb:app_topo_de_morro' },
  { key: 'sigweb_bairros2005', label: 'Bairros2005', layer: 'sigweb:bairros2005' },
  { key: 'sigweb_coord_apa_marinha', label: 'Coord_APA_Marinha', layer: 'sigweb:coord_apa_marinha' },
  { key: 'sigweb_corais_bardot', label: 'Corais_Bardot', layer: 'sigweb:corais_bardot' },
  { key: 'sigweb_corais_joao_fernandes', label: 'Corais_João_Fernandes', layer: 'sigweb:corais_joao_fernandes' },
  { key: 'sigweb_corais_tartaruga', label: 'Corais_Tartaruga', layer: 'sigweb:corais_tartaruga' },
  { key: 'sigweb_curvas', label: 'Curvas', layer: 'sigweb:curvas' },
  { key: 'sigweb_inepac', label: 'INEPAC', layer: 'sigweb:inepac' },
  { key: 'sigweb_parque_geriba', label: 'Parque_Geriba', layer: 'sigweb:parque_geriba' },
  { key: 'sigweb_parque_lagoinha', label: 'Parque_Lagoinha', layer: 'sigweb:parque_lagoinha' },
  { key: 'sigweb_parque_municipal_das_dunas', label: 'Parque_Municipal_das_Dunas', layer: 'sigweb:parque_municipal_das_dunas' },
  { key: 'sigweb_pecs_atualizado_buzios', label: 'PECS_Atualizado_Buzios', layer: 'sigweb:pecs_atualizado_buzios' },
  { key: 'sigweb_pecs_zoneamento_portal_inea', label: 'PECS_Zoneamento_Portal_INEA', layer: 'sigweb:pecs_zoneamento_portal_inea' },
  { key: 'sigweb_protecao_afloramento_rochoso_5m', label: 'Protecao_Afloramento_Rochoso_5m', layer: 'sigweb:protecao_afloramento_rochoso_5m' },
  { key: 'ne_boundary_lines', label: 'Boundary Lines', layer: 'ne:boundary_lines' },
  { key: 'ne_coastlines', label: 'Coastlines', layer: 'ne:coastlines' },
  { key: 'ne_countries', label: 'Countries', layer: 'ne:countries' },
  { key: 'ne_disputed_areas', label: 'Disputed Areas', layer: 'ne:disputed_areas' },
  { key: 'ne_populated_places', label: 'Populated Places', layer: 'ne:populated_places' },
];

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
  // Estado para controlar temporariamente o valor do input de cada camada
  const [layerPositions, setLayerPositions] = useState({});

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

  // Função para mover camada para cima
  function moveLayerUp(layerKey) {
    const map = mapRef.current;
    const layer = layerRefs.current[layerKey];
    if (!map || !layer) return;

    const layers = [...map.getLayers().getArray()];
    const idx = layers.indexOf(layer);
    if (idx > 1) { // 0 geralmente é o OSM base
      layers.splice(idx, 1);
      layers.splice(idx - 1, 0, layer);
      map.setLayers(layers); // Use setLayers para atualizar todas de uma vez
    }
  }

  // Função para mover camada para baixo
  function moveLayerDown(layerKey) {
    const map = mapRef.current;
    const layer = layerRefs.current[layerKey];
    if (!map || !layer) return;

    const layers = [...map.getLayers().getArray()];
    const idx = layers.indexOf(layer);
    if (idx !== -1 && idx < layers.length - 1) {
      layers.splice(idx, 1);
      layers.splice(idx + 1, 0, layer);
      map.setLayers(layers); // Use setLayers para atualizar todas de uma vez
    }
  }

  function moveLayerToPosition(layerKey, position) {
    const map = mapRef.current;
    const layer = layerRefs.current[layerKey];
    if (!map || !layer) return;

    const layers = [...map.getLayers().getArray()];
    const idx = layers.indexOf(layer);
    // O mapa base geralmente está na posição 0
    const min = 1;
    const max = layers.length - 1;
    let newPos = Math.max(min, Math.min(Number(position), max));
    if (idx === -1 || idx === newPos) return;

    layers.splice(idx, 1);
    layers.splice(newPos, 0, layer);
    map.setLayers(layers);
  }

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
                {filteredProtected.map(cfg => {
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
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={e =>
                          setLayersVisibility(v => ({
                            ...v,
                            [cfg.key]: e.target.checked,
                          }))
                        }
                        style={{ marginRight: 6 }}
                      />
                      <span style={{ flex: 1 }}>{cfg.label}</span>
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
                          style={{ width: 40, marginLeft: 8 }}
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
            )}
            {filteredOthers.length > 0 &&
              filteredOthers.map(cfg => {
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
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={e =>
                        setLayersVisibility(v => ({
                          ...v,
                          [cfg.key]: e.target.checked,
                        }))
                      }
                      style={{ marginRight: 6 }}
                    />
                    <span style={{ flex: 1 }}>{cfg.label}</span>
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
                        style={{ width: 40, marginLeft: 8 }}
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