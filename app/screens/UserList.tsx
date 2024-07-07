import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db, auth } from '../../FirebaseConfig';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type UserListNavigationProp = NavigationProp<RootStackParamList, 'UserList'>;

const UserList = () => {
  const [users, setUsers] = useState<{ email: string }[]>([]);
  const navigation = useNavigation<UserListNavigationProp>();

  useEffect(() => {
    const fetchUsers = () => {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '!=', auth.currentUser?.email));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { email: data.email || '' };
        });
        setUsers(userList);
      });

      // Clean up subscription on unmount
      return () => unsubscribe();
    };

    fetchUsers();
  }, []);

  const handleSelectUser = (userEmail: string) => {
    navigation.navigate('Chat', { userEmail });
  };

  // Function to extract the name from the email
  const extractNameFromEmail = (email: string) => {
    return email.split('@')[0];
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectUser(item.email)} style={styles.userItem}>
            <Text>{extractNameFromEmail(item.email)}</Text>
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
