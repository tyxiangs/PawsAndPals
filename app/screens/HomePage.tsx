import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { auth } from '../../FirebaseConfig';

interface HomePageProps {
  navigation: NavigationProp<ParamListBase>;
}

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome back, {userName}!</Text>
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
});

export default HomePage;
