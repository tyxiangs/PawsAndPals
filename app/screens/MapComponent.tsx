import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, Modal, Text } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { getDatabase, ref, set, remove, onValue } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';

type MarkerType = {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  image: string;
};

const MapComponent = () => {
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [newMarkerCoordinate, setNewMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Fetch markers from Firebase
    const db = getDatabase();
    const markersRef = ref(db, 'markers/');
    onValue(markersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const markersArray = Object.keys(data).map(key => data[key] as MarkerType);
        setMarkers(markersArray);
      }
    });
  }, []);

  const handleMapPress = (event: MapPressEvent) => {
    setNewMarkerCoordinate(event.nativeEvent.coordinate);
    setShowImagePicker(true);
  };

  const handleAddImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled && newMarkerCoordinate) {
      const newMarker: MarkerType = {
        id: Date.now().toString(),
        coordinate: newMarkerCoordinate,
        image: result.assets[0].uri,
      };
      setMarkers([...markers, newMarker]);
      // Save to Firebase
      const db = getDatabase();
      set(ref(db, 'markers/' + newMarker.id), newMarker);
      setShowImagePicker(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    const newMarkers = markers.filter(marker => marker.id !== id);
    setMarkers(newMarkers);
    // Remove from Firebase
    const db = getDatabase();
    remove(ref(db, 'markers/' + id));
    // Deselect image and marker
    setSelectedImage(null);
    setSelectedMarkerId(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 1.2966,
          longitude: 103.7764,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => {
              setSelectedImage(marker.image);
              setSelectedMarkerId(marker.id);
            }}
          >
            <Image source={{ uri: marker.image }} style={styles.markerImage} />
          </Marker>
        ))}
      </MapView>
      {showImagePicker && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showImagePicker}
          onRequestClose={() => setShowImagePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text>Select an image to attach to the selected location:</Text>
              <Button title="Pick Image" onPress={handleAddImage} />
              <Button title="Cancel" onPress={() => setShowImagePicker(false)} />
            </View>
          </View>
        </Modal>
      )}
      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          <Button title="Delete Image" onPress={() => selectedMarkerId && handleDeleteImage(selectedMarkerId)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  markerImage: {
    width: 50,
    height: 50,
  },
  imageContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default MapComponent;
