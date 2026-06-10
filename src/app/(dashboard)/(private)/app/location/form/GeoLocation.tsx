'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Card,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

// Import CSS & Library
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import '@geoman-io/leaflet-geoman-free'

// Fix Marker Icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux-store'
import {
  deleteGeoArea,
  fetchGeoAreaAll,
  fetchGeoAreaById,
  postGeoArea,
  postGeoAreaUpdate
} from '../slice/geoAreaSlice'
import { toast } from 'react-toastify'
import { useSearchParams } from 'next/navigation'

/* -----------------------------------------------------------
   MapLogic: Integrasi Geoman & View Area (Tanpa useMap)
----------------------------------------------------------- */
interface MapLogicProps {
  mapInstance: L.Map | null;
  tipeArea: 'Point' | 'Circle' | 'Polygon' | '';
  setGeoData: (data: any) => void;
  savedData?: any;
  geoData: any;
}

const MapLogic = ({ mapInstance, tipeArea, setGeoData, savedData, geoData }: MapLogicProps) => {
  const layerGroupRef = useRef<L.FeatureGroup>(L.featureGroup());

  useEffect(() => {
    if (!mapInstance || !mapInstance.pm) return;
    const map = mapInstance;

    // Konfigurasi Toolbar Geoman agar hanya menampilkan Marker, Circle, Polygon
    map.pm.addControls({
      position: 'topleft',
      drawMarker: true,
      drawCircle: true,
      drawPolygon: true,
      drawPolyline: false,
      drawRectangle: false,
      drawText: false,
      editMode: true,
      dragMode: true,
      cutLayer: false,
      removalMode: true,
      visible: false // Kita kendalikan via kode (tipeArea)
    });

    const handleCreate = (e: any) => {
      const { layer, shape } = e;
      const data = layer.toGeoJSON();
      if (shape === 'Circle') {
        data.properties.radius = layer.getRadius();
      }

      layerGroupRef.current.clearLayers();
      layer.addTo(layerGroupRef.current);
      setGeoData(data);
      map.pm.disableDraw();
    };

    map.on('pm:create', handleCreate);
    layerGroupRef.current.addTo(map);

    return () => {
      map.off('pm:create', handleCreate);
    };
  }, [mapInstance, setGeoData]);

  useEffect(() => {
    if (!mapInstance || !mapInstance.pm) return;
    const map = mapInstance;

    if (geoData) {
      map.pm.disableDraw();
      return;
    }

    map.eachLayer((layer: any) => {
      if (layer instanceof L.Path || layer instanceof L.Marker) {
        const isMainGroup = (layer as L.Layer) === (layerGroupRef.current as L.Layer);
        if (!isMainGroup && !layerGroupRef.current.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      }
    });

    const modes: Record<string, string> = {
      Point: 'Marker',
      Circle: 'Circle',
      Polygon: 'Polygon'
    };

    const selectedMode = modes[tipeArea];
    if (selectedMode) {
      setTimeout(() => {
        map.pm.enableDraw(selectedMode, {
          snappable: true,
          cursorMarker: true,
          finishOn: 'dblclick',
          allowSelfIntersection: false,
        });
      }, 100);
    }
  }, [mapInstance, tipeArea, geoData]);

  useEffect(() => {
    if (!mapInstance || !savedData || geoData) return;
    const map = mapInstance;

    layerGroupRef.current.clearLayers();
    const { tipe_geo, latitude, longitude, radius_meter, polygon_json } = savedData;
    const lat = Number(latitude);
    const lng = Number(longitude);

    let layer: L.Layer | null = null;
    try {
      if (tipe_geo === 'POLYGON' && polygon_json) {
        layer = L.geoJSON(polygon_json);
      } else if (tipe_geo === 'CIRCLE' && !isNaN(lat)) {
        layer = L.circle([lat, lng], { radius: Number(radius_meter) || 100 });
      } else if (tipe_geo === 'POINT' && !isNaN(lat)) {
        layer = L.marker([lat, lng]);
      }

      if (layer) {
        layer.addTo(layerGroupRef.current);
        if (tipe_geo === 'POLYGON') {
          map.fitBounds((layer as L.GeoJSON).getBounds(), { padding: [20, 20] });
        } else {
          map.setView([lat, lng], 17);
        }
      }
    } catch (err) { console.error(err); }
  }, [mapInstance, savedData, geoData]);

  return null;
};

/* -----------------------------------------------------------
   Main Component: GeoLocation
----------------------------------------------------------- */
const GeoLocation = ({ data, onClose }: any) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const dispatch = useDispatch<AppDispatch>()
  const { activeArea, datas } = useSelector((state: RootState) => state.geo_areas)

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nama_area: '',
    tipe_area: '' as any,
    toleransi: 10,
    is_aktif: 1,
    keterangan: ''
  })
  const [geoData, setGeoData] = useState<any>(null)

  const searchParams = useSearchParams();
  const idFromQuery = searchParams.get('id');
  const targetId = idFromQuery || data?.id_lokasi;

  const centerPosition = useMemo((): [number, number] => {
    const lat = Number(data?.latitude);
    const lng = Number(data?.longitude);
    return (lat && lng) ? [lat, lng] : [-6.2088, 106.8456];
  }, [data]);

  // INISIASI MAP MANUAL (Ganti MapContainer)
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(centerPosition, 18);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      setMapReady(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, [centerPosition]);

  useEffect(() => {
    const initFetch = async () => {
      if (targetId) {
        try {
          setLoading(true);
          await dispatch(fetchGeoAreaAll({ params: { id_lokasi: targetId } })).unwrap()
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
      }
    };
    initFetch();
  }, [targetId, dispatch]);

  const handleClear = () => {
    setForm({ nama_area: '', tipe_area: '', toleransi: 10, is_aktif: 1, keterangan: '' });
    setGeoData(null);
    toast.info('Form dan peta dibersihkan');
  };

  const handleSave = async () => {
    const { geometry: geoDataMap, properties } = geoData || {};
    const payload = {
      id_lokasi: data.id_lokasi,
      nama_area: form.nama_area,
      tipe_geo: form.tipe_area.toUpperCase(),
      latitude: "", longitude: "",
      radius_meter: properties?.radius ? parseInt(properties.radius) : 0,
      polygon_json: null,
      toleransi_meter: form.toleransi,
      is_active: form.is_aktif === 1,
      keterangan: form.keterangan
    };

    if (geoDataMap) {
      if (geoDataMap.type === 'Polygon') {
        payload.polygon_json = geoData;
      } else if (geoDataMap.coordinates) {
        const [lon, lat] = geoDataMap.coordinates;
        payload.latitude = lat;
        payload.longitude = lon;
      }
    }

    try {
      setLoading(true)
      const res = await dispatch(postGeoArea(payload)).unwrap()
      if (res.status) {
        toast.success('Berhasil menyimpan area baru')
        setGeoData(null)
        await dispatch(fetchGeoAreaAll({ params: { id_lokasi: targetId } })).unwrap()
      }
    } catch (e: any) { toast.error('Gagal menyimpan'); }
    finally { setLoading(false); }
  }

  const handleSetActive = async (id_geo: string) => {
    try {
      setLoading(true)
      const res = await dispatch(postGeoAreaUpdate({ id: id_geo, params: { is_active: true } })).unwrap()
      if (res.status) {
        toast.success('Area berhasil diaktifkan')
        await dispatch(fetchGeoAreaAll({ params: { id_lokasi: targetId } })).unwrap()
      }
    } catch (e) { toast.error('Gagal mengaktifkan area'); }
    finally { setLoading(false) }
  }

  const handleDelete = async (id_geo: string) => {
    try {
      setLoading(true)
      const res = await dispatch(deleteGeoArea(id_geo)).unwrap()
      if (res.status) {
        toast.success('Area berhasil dihapus')
        await dispatch(fetchGeoAreaAll({ params: { id_lokasi: targetId } })).unwrap()
      }
    } catch (e) { toast.error('Gagal menghapus'); }
    finally { setLoading(false) }
  }

  const handleEdit = async (item: any) => {
    try {
      await dispatch(fetchGeoAreaById(item.id_geo)).unwrap();
      setForm({
        nama_area: item.nama_area,
        tipe_area: item.tipe_geo === 'POINT' ? 'Point' : item.tipe_geo === 'CIRCLE' ? 'Circle' : 'Polygon',
        toleransi: item.toleransi_meter,
        is_aktif: item.is_active ? 1 : 0,
        keterangan: item.keterangan || ''
      });

      if (item.tipe_geo === 'POLYGON') {
        setGeoData(item.polygon_json);
      } else {
        setGeoData({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [Number(item.longitude), Number(item.latitude)]
          },
          properties: { radius: Number(item.radius_meter) }
        });
      }
      toast.success('Data dimuat ke form');
    } catch (error) { toast.error('Gagal memuat detail'); }
  };

  const pointCount = geoData?.geometry?.type === 'Polygon'
    ? (geoData.geometry.coordinates[0]?.length || 1) - 1 : 0

  return (
    <Grid container spacing={5} sx={{ position: 'relative' }}>
      {loading && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.6)' }}>
          <CircularProgress />
        </Box>
      )}

      <Grid item xs={12} md={4}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>FORM AREA BARU</Typography>

          <TextField fullWidth label="Nama Area *" size="small" value={form.nama_area} onChange={(e) => setForm({ ...form, nama_area: e.target.value })} />

          <FormControl fullWidth size="small">
            <InputLabel>Tipe Area *</InputLabel>
            <Select
              label="Tipe Area *"
              value={form.tipe_area}
              onChange={(e) => {
                setForm({ ...form, tipe_area: e.target.value as any });
                setGeoData(null);
              }}
            >
              <MenuItem value="">Tipe Area</MenuItem>
              <MenuItem value="Point">Point</MenuItem>
              <MenuItem value="Circle">Circle</MenuItem>
              <MenuItem value="Polygon">Polygon</MenuItem>
            </Select>
          </FormControl>

          <TextField fullWidth label="Toleransi Meter" type="number" size="small" value={form.toleransi} onChange={(e) => setForm({ ...form, toleransi: Number(e.target.value) })} />
          <FormControlLabel control={<Switch checked={form.is_aktif === 1} onChange={(e) => setForm({ ...form, is_aktif: e.target.checked ? 1 : 0 })} />} label="Area Aktif" />
          <TextField fullWidth label="Keterangan" multiline rows={2} size="small" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" color="inherit" fullWidth onClick={handleClear}>Clear</Button>
            <Button variant="contained" fullWidth onClick={handleSave} disabled={!geoData || (form.tipe_area === 'Polygon' && pointCount < 3)} sx={{ bgcolor: '#1a1d23' }}>
              Simpan Area
            </Button>
          </Box>

          <Divider />

          {/* TAMPILAN RIWAYAT AREA GEO (DIPERTAHANKAN) */}
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>RIWAYAT AREA GEO</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
            {datas.length > 0 ? datas.map((item: any) => (
              <Card key={item.id_geo} variant="outlined" sx={{ p: 3, borderLeft: item.is_active ? '4px solid #2e7d32' : '1px solid #ddd' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.nama_area} (v{item.versi})</Typography>
                    <Chip label={item.is_active ? "Aktif" : "Non-Aktif"} size="small" color={item.is_active ? "success" : "default"} sx={{ mt: 1, height: 20 }} />
                  </Box>
                  <Box sx={{ display: 'flex' }}>
                    {!item.is_active && <Button size="small" color="success" onClick={() => handleSetActive(item.id_geo)}>Set Active</Button>}
                    <IconButton size="small" color="primary" onClick={() => handleEdit(item)}><i className="tabler-edit" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id_geo)}><i className="tabler-trash" /></IconButton>
                  </Box>
                </Box>
              </Card>
            )) : <Typography variant="caption" sx={{ textAlign: 'center', p: 2 }}>Belum ada data geo</Typography>}
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} md={8}>
        {/* PENGGANTI MapContainer */}
        <Box
          ref={mapContainerRef}
          id={`map-container-${targetId}`}
          sx={{ height: 600, width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}
        >
          {mapReady && (
            <MapLogic
              mapInstance={mapRef.current}
              tipeArea={form.tipe_area}
              setGeoData={setGeoData}
              savedData={activeArea}
              geoData={geoData}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  )
}

export default GeoLocation;
