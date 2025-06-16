
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapContainer } from '@/components/maps/map/MapContainer';
import { MapboxTokenCheck } from '@/components/maps/MapboxTokenCheck';
import { Event } from '@/types/events';
import { logger } from '@/utils/logger';
import 'mapbox-gl/dist/mapbox-gl.css';

interface EventLocationMapProps {
  events: Event[];
  onSelectEvent?: (eventId: string) => void;
}

export const EventLocationMap = ({ events, onSelectEvent }: EventLocationMapProps) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const log = logger.createLogger({ component: 'EventLocationMap' });
  
  // Get Mapbox token from environment variables
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  const handleMapInit = (container: HTMLDivElement) => {
    try {
      if (!mapboxToken) {
        throw new Error('Mapbox token is missing');
      }
      
      // Set the access token
      mapboxgl.accessToken = mapboxToken;
      
      // Create a new map instance
      const newMap = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [34.9, 32.3], // Default to central Israel
        zoom: 8
      });
      
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Save map instance
      setMap(newMap);
      
      // Wait for map to load before adding markers
      newMap.on('load', () => {
        setLoading(false);
      });
      
      log.info('Map initialized for events');
    } catch (error) {
      log.error('Error initializing events map', { error });
      setError('Failed to initialize map');
      setLoading(false);
    }
  };
  
  // Add markers for events when map is ready or events change
  useEffect(() => {
    if (!map || loading) return;
    
    // Clear previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Check if we have events with locations
    const eventsWithLocation = events.filter(event => 
      event.location_coordinates && 
      typeof event.location_coordinates.lat === 'number' && 
      typeof event.location_coordinates.lng === 'number'
    );
    
    if (eventsWithLocation.length === 0) {
      log.info('No events with location data found');
      return;
    }
    
    // Add new markers for each event
    const markers = eventsWithLocation.map(event => {
      // We already filtered for events with coordinates above
      const coords = event.location_coordinates!;
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="text-right p-2">
          <h3 class="font-bold">${event.title}</h3>
          <p>${event.location_name || 'No location name'}</p>
          <p class="text-sm text-gray-600">${new Date(event.main_time).toLocaleDateString('he-IL')}</p>
        </div>`
      );
      
      const marker = new mapboxgl.Marker({
        color: "#3b82f6"
      })
        .setLngLat([coords.lng, coords.lat])
        .setPopup(popup)
        .addTo(map);
      
      // Add click handler if needed
      if (onSelectEvent) {
        marker.getElement().addEventListener('click', () => {
          onSelectEvent(event.id);
        });
      }
      
      return marker;
    });
    
    // Save references to markers for later cleanup
    markersRef.current = markers;
    
    // Fit map to show all markers if we have any
    if (markers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      eventsWithLocation.forEach(event => {
        // We already filtered for events with coordinates above
        const coords = event.location_coordinates!;
        bounds.extend([coords.lng, coords.lat]);
      });
      
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
    
    log.info(`Added ${markers.length} event markers to map`);
  }, [map, events, loading, onSelectEvent, log]);
  
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The map will reinitialize on next render cycle
  };
  
  return (
    <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
      <MapboxTokenCheck>
        <MapContainer
          loading={loading}
          error={error}
          onRetry={handleRetry}
          onMapInit={handleMapInit}
          className="w-full h-full"
        />
      </MapboxTokenCheck>
    </div>
  );
};
