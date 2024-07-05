import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './app/screens/Login';
import MapComponent from './app/screens/MapComponent'; // Ensure this path is correct
import Chat from './app/screens/Chat';
import { RootStackParamList } from './types';
import UserList from './app/screens/UserList';

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
        <Stack.Screen 
          name="UserList" 
          component={UserList}
          options={{ 
            title: 'Active users',
            headerTitleAlign: 'center',
          }}
          />
         <Stack.Screen name="Chat" component={Chat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

