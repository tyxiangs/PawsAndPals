import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, Modal, Text } from 'react-native';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import { getDatabase, ref, set, remove, onValue } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

type MarkerType = {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  image: string;
};

interface MapComponentProps {
  navigation: NavigationProp<ParamListBase>;
}

const MapComponent: React.FC<MapComponentProps> = ({ navigation }) => {
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [newMarkerCoordinate, setNewMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 1.2966,
    longitude: 103.7764,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
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
      const imageUri = result.assets[0].uri;

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const storage = getStorage();
      const imageRef = storageRef(storage, `images/${Date.now().toString()}`);

      await uploadBytes(imageRef, blob);

      const downloadURL = await getDownloadURL(imageRef);

      const newMarker: MarkerType = {
        id: Date.now().toString(),
        coordinate: newMarkerCoordinate,
        image: downloadURL,
      };

      setMarkers([...markers, newMarker]);

      const db = getDatabase();
      set(ref(db, 'markers/' + newMarker.id), newMarker);

      setShowImagePicker(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    const newMarkers = markers.filter(marker => marker.id !== id);
    setMarkers(newMarkers);
    const db = getDatabase();
    remove(ref(db, 'markers/' + id));
    setSelectedImage(null);
    setSelectedMarkerId(null);
  };

  const handleZoomIn = () => {
    setRegion((prevRegion) => {
      const newLatitudeDelta = prevRegion.latitudeDelta / 2;
      const newLongitudeDelta = prevRegion.longitudeDelta / 2;

      const minDelta = 0.0001;

      return {
        ...prevRegion,
        latitudeDelta: Math.max(newLatitudeDelta, minDelta),
        longitudeDelta: Math.max(newLongitudeDelta, minDelta),
      };
    });
  };

  const handleZoomOut = () => {
    setRegion((prevRegion) => ({
      ...prevRegion,
      latitudeDelta: prevRegion.latitudeDelta * 2,
      longitudeDelta: prevRegion.longitudeDelta * 2,
    }));
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={setRegion}
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
      <View style={styles.buttonContainer}>
        <Button title="Zoom In" onPress={handleZoomIn} />
        <Button title="Zoom Out" onPress={handleZoomOut} />
        <Button
          title="Go to Chat"
          onPress={() => navigation.navigate('UserList')}
        />
      </View>
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
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
  },
});

export default MapComponent;






