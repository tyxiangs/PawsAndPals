
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../../FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type UserListNavigationProp = NavigationProp<RootStackParamList, 'UserList'>;

const UserList = () => {
  const [users, setUsers] = useState<{ email: string }[]>([]);
  const navigation = useNavigation<UserListNavigationProp>();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => {
        const data = doc.data();
        return { email: data.email || '' }; 
      });
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  const handleSelectUser = (userEmail: string) => {
    navigation.navigate('Chat', { userEmail });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectUser(item.email)} style={styles.userItem}>
            <Text>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default UserList;
