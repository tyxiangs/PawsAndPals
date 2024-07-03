import React, { useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat'; 
import { auth, db } from '../../FirebaseConfig';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { Avatar } from 'react-native-elements';
import { collection, addDoc, orderBy, query, onSnapshot, Timestamp } from 'firebase/firestore';

type ChatNavigationProp = NavigationProp<RootStackParamList, 'Chat'>;

const Chat = ({ navigation }: { navigation: ChatNavigationProp }) => {
    const [messages, setMessages] = useState<IMessage[]>([]);

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
                            uri: auth?.currentUser?.photoURL || 'https://placeimg.com/140/140/any',
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
                    <Text>Back Home</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        getAllMessages();
    }, []);

    const getAllMessages = () => {
        const messagesRef = collection(db, 'messages');
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
        newMessages.forEach((message) => {
            const messageToSend = {
                ...message,
                createdAt: Timestamp.fromDate(new Date()) // Save current date as Firestore timestamp
            };
            addDoc(collection(db, 'messages'), messageToSend);
        });
    }, []);

    return (
        <GiftedChat
            messages={messages}
            showAvatarForEveryMessage={true}
            onSend={(messages) => onSend(messages)}
            user={{
                _id: auth?.currentUser?.email || '1',
                name: auth?.currentUser?.displayName || 'Jolin',
                avatar: auth?.currentUser?.photoURL || 'https://placeimg.com/140/140/any',
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
