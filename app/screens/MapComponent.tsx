import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';

const INITIAL_REGION = {
  latitude: 1.2966, // Latitude for NUS
  longitude: 103.7764, // Longitude for NUS
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const MIN_LATITUDE_DELTA = 0.001; // Minimum zoom level
const MAX_LATITUDE_DELTA = 1.0; // Maximum zoom level

const Map = () => {
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const mapRef = useRef<MapView>(null);

  const zoomIn = () => {
    setRegion((prevRegion) => ({
      ...prevRegion,
      latitudeDelta: Math.max(prevRegion.latitudeDelta / 2, MIN_LATITUDE_DELTA),
      longitudeDelta: Math.max(prevRegion.longitudeDelta / 2, MIN_LATITUDE_DELTA),
    }));
  };

  const zoomOut = () => {
    setRegion((prevRegion) => ({
      ...prevRegion,
      latitudeDelta: Math.min(prevRegion.latitudeDelta * 2, MAX_LATITUDE_DELTA),
      longitudeDelta: Math.min(prevRegion.longitudeDelta * 2, MAX_LATITUDE_DELTA),
    }));
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [region]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        provider={PROVIDER_GOOGLE}
      />
      <View style={styles.buttonContainer}>
        <Button title="Zoom In" onPress={zoomIn} />
        <Button title="Zoom Out" onPress={zoomOut} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});

export default Map;

