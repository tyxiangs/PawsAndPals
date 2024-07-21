import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { auth } from '../../FirebaseConfig';

interface HomePageProps {
  navigation: NavigationProp<ParamListBase>;
}

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigation.navigate('Login');
      })
      .catch(error => {
        console.error('Error logging out: ', error);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Map" onPress={() => navigation.navigate('MapComponent')} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
  },
});

export default HomePage;
