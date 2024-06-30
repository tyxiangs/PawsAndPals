import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Button, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region, LatLng } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';

const INITIAL_REGION = {
  latitude: 1.2966,
  longitude: 103.7764,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const MIN_LATITUDE_DELTA = 0.0001; // Allow more precise zooming
const MAX_LATITUDE_DELTA = 1.0;

interface MarkerData {
  coordinate: LatLng;
  image: string | undefined;
}

const Map = () => {
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const mapRef = useRef<MapView>(null);

  const handleMapPress = async (event: { nativeEvent: { coordinate: LatLng } }) => {
    const { coordinate } = event.nativeEvent;
    openImagePicker(coordinate);
  };

  const openImagePicker = async (coordinate: LatLng) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const image = result.assets[0].uri;
      setMarkers((prevMarkers) => [
        ...prevMarkers,
        { coordinate, image },
      ]);
    }
  };

  const deleteMarker = (index: number) => {
    setMarkers((prevMarkers) => prevMarkers.filter((_, i) => i !== index));
  };

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
        onPress={handleMapPress}
      >
        {markers.map((marker, index) => (
          <Marker key={index} coordinate={marker.coordinate}>
            <Image source={{ uri: marker.image }} style={{ width: 50, height: 50 }} />
            <Callout>
              <Button title="Delete" onPress={() => deleteMarker(index)} />
            </Callout>
          </Marker>
        ))}
      </MapView>
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
