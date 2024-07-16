import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db, auth } from '../../FirebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type UserListNavigationProp = NavigationProp<RootStackParamList, 'UserList'>;

type ChatListItem = {
  userEmail: string;
  lastMessage: string;
  lastUpdated: any;
};

const UserList = () => {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const navigation = useNavigation<UserListNavigationProp>();

  useEffect(() => {
    const fetchChats = () => {
      const userChatsRef = collection(db, 'users', auth.currentUser?.email || '', 'chats');
      const q = query(userChatsRef);

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            userEmail: data.userEmail,
            lastMessage: data.lastMessage,
            lastUpdated: data.lastUpdated,
          } as ChatListItem;
        });
        setChats(chatList);
      });

      return () => unsubscribe();
    };

    fetchChats();
  }, []);

  const handleSelectChat = (userEmail: string) => {
    navigation.navigate('Chat', { userEmail });
  };

  const extractNameFromEmail = (email: string) => {
    return email.split('@')[0];
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.userEmail}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectChat(item.userEmail)} style={styles.chatItem}>
            <Text>{extractNameFromEmail(item.userEmail)}</Text>
            <Text>{item.lastMessage}</Text>
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
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default UserList;


