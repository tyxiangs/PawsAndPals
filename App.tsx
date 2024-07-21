import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './app/screens/Login';
import MapComponent from './app/screens/MapComponent';
import Chat from './app/screens/Chat';
import UserList from './app/screens/UserList';
import HomePage from './app/screens/HomePage';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="HomePage" component={HomePage} />
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
        <Stack.Screen 
          name="Chat" 
          component={Chat} 
          options={({ route }) => ({ title: `Chat with ${route.params.userEmail}` })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;



