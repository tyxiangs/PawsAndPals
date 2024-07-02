import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './app/screens/Login';
import MapComponent from './app/screens/MapComponent'; // Ensure this path is correct
import Chat from './app/screens/Chat';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen
          name="MapComponent"
          component={MapComponent}
          options={{ title: 'Map' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

