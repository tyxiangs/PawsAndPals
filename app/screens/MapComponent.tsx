import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, Modal, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import { getDatabase, ref, set, remove, onValue } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { auth } from '../../FirebaseConfig';

type MarkerType = {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  image: string;
  userEmail: string;
};

interface MapComponentProps {
  navigation: NavigationProp<ParamListBase>;
}

const MapComponent: React.FC<MapComponentProps> = ({ navigation }) => {
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
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

      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        console.error('No authenticated user found');
        return;
      }

      const newMarker: MarkerType = {
        id: Date.now().toString(),
        coordinate: newMarkerCoordinate,
        image: downloadURL,
        userEmail: currentUser.email,
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
    setSelectedMarker(null);
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

  const handleChatPress = () => {
    if (selectedMarker) {
      navigation.navigate('Chat', { userEmail: selectedMarker.userEmail });
    }
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
              setSelectedMarker(marker);
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
      {selectedImage && selectedMarker && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          <Button title="Chat with User" onPress={handleChatPress} />
          <Button title="Delete Image" onPress={() => handleDeleteImage(selectedMarker.id)} />
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








