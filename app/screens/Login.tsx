import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, Button, KeyboardAvoidingView, Image, Alert } from 'react-native';
import { auth, db } from '../../FirebaseConfig'; // Ensure this import is correct
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore'; 
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types'; // Ensure this import is correct

type LoginScreenNavigationProp = NavigationProp<RootStackParamList, 'Login'>;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      navigation.navigate('MapComponent'); // Navigate to Map on successful login
    } catch (error: any) {
      console.log(error);
      Alert.alert('Sign in failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log(response);

      // Save user info to Firestore
      const userDoc = doc(db, 'users', response.user.uid);
      await setDoc(userDoc, {
        email: response.user.email,
        uid: response.user.uid,
      });

      Alert.alert('Account created!', 'You can now log in with your new account.');
    } catch (error: any) {
      console.log(error);
      Alert.alert('Sign up failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/pp_logo.png')} style={styles.logo} />
      <KeyboardAvoidingView behavior="padding">
        <TextInput
          value={email}
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          secureTextEntry={true}
          value={password}
          style={styles.input}
          placeholder="Password"
          autoCapitalize="none"
          onChangeText={(text) => setPassword(text)}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Button title="Login" onPress={signIn} />
            <Button title="Create account" onPress={signUp} />
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
});
