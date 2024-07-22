import React, { useState } from 'react';
import { View, Button, StyleSheet, Text, Modal, TouchableOpacity } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { auth } from '../../FirebaseConfig';

interface HomePageProps {
  navigation: NavigationProp<ParamListBase>;
}

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const currentUser = auth.currentUser;
  const userName = currentUser?.email?.split('@')[0] || 'User';

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigation.navigate('Login');
      })
      .catch(error => {
        console.error('Error logging out: ', error);
      });
  };

  const handleMapPress = () => {
    setModalVisible(true);
  };

  const closeModalAndNavigate = () => {
    setModalVisible(false);
    navigation.navigate('MapComponent');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome back, {userName}!</Text>
      <View style={styles.buttonContainer}>
        <Button title="Map" onPress={handleMapPress} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Active User Chats" onPress={() => navigation.navigate('UserList')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="My Profile" onPress={() => { /* Currently does nothing */ }} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Welcome back, {userName}!</Text>
            <Text style={styles.modalDescription}>
              1. See real-time locations of animal sightings.{'\n'}
              2. Tap the location of your sighting and upload a picture of the animal.{'\n'}
              3. Delete your sightings when you leave the area. If you realise that the animal is no longer at the location, please help to delete the picture as well.{'\n'}
              4. Tap on an animal picture to chat with the user who uploaded it. Make new friends!{'\n\n'}
              Happy animal spotting!
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModalAndNavigate}>
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'orange',
  },
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
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
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'left',
  },
  modalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'orange',
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default HomePage;
