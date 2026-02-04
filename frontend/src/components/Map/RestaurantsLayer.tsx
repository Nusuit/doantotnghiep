
import React from 'react';
import { Source, Layer, LayerProps } from 'react-map-gl/mapbox'; // Accessing correct export for Next.js app router env based on previous imports
import { FeatureCollection } from 'geojson';

interface RestaurantsLayerProps {
    data: FeatureCollection;
}

const layerStyle: LayerProps = {
    id: 'restaurants-point',
    type: 'circle',
    paint: {
        'circle-radius': 8,
        'circle-color': [
            'match',
            ['get', 'type'],
            'restaurant', '#22c55e', // Green for restaurants
            'knowledge', '#3b82f6', // Blue
            'leisure', '#f97316',   // Orange
            '#22c55e' // Default green
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
    }
};

const labelStyle: LayerProps = {
    id: 'restaurants-label',
    type: 'symbol',
    layout: {
        'text-field': ['get', 'title'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-offset': [0, 1.2],
        'text-anchor': 'top'
    },
    paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#000000',
        'text-halo-width': 1
    },
    minzoom: 12
};

const RestaurantsLayer: React.FC<RestaurantsLayerProps> = ({ data }) => {
    return (
        <Source id="restaurants-data" type="geojson" data={data}>
            <Layer {...layerStyle} />
            <Layer {...labelStyle} />
        </Source>
    );
};

export default RestaurantsLayer;
