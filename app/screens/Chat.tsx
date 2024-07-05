import React, { useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat'; 
import { auth, db } from '../../FirebaseConfig';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Avatar } from 'react-native-elements';
import { collection, addDoc, orderBy, query, onSnapshot, Timestamp } from 'firebase/firestore';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

const Chat = ({ route, navigation }: { route: ChatRouteProp, navigation: any }) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const { userEmail } = route.params;
    const currentUser = auth.currentUser;

    const goHome = () => {
        navigation.navigate('MapComponent');
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <View style={{ marginLeft: 20 }}>
                    <Avatar
                        rounded
                        source={{
                            uri: currentUser?.photoURL || 'https://placeimg.com/140/140/any',
                        }}
                    />
                </View>
            ),
            headerRight: () => (
                <TouchableOpacity
                    style={{
                        marginRight: 10,
                    }}
                    onPress={goHome}
                >
                    <Text>Back to chats</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        getAllMessages();
    }, []);

    const getAllMessages = () => {
        const chatRoomId = [currentUser?.email, userEmail].sort().join('_');
        const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));
        onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    _id: doc.id,
                    ...data,
                    createdAt: data.createdAt.toDate()
                } as IMessage;
            });
            setMessages(messages);
        });
    };

    const onSend = useCallback((newMessages: IMessage[] = []) => {
        setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, newMessages)
        );
        const chatRoomId = [currentUser?.email, userEmail].sort().join('_');
        newMessages.forEach((message) => {
            const messageToSend = {
                ...message,
                createdAt: Timestamp.fromDate(new Date())
            };
            addDoc(collection(db, 'chatRooms', chatRoomId, 'messages'), messageToSend);
        });
    }, []);

    return (
        <GiftedChat
            messages={messages}
            showAvatarForEveryMessage={true}
            onSend={(messages) => onSend(messages)}
            user={{
                _id: currentUser?.email || '1',
                name: currentUser?.displayName || 'Jolin',
                avatar: currentUser?.photoURL || 'https://placeimg.com/140/140/any',
            }}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Chat;
