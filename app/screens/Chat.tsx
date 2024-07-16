import React, { useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat'; 
import { auth, db } from '../../FirebaseConfig';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { Avatar } from 'react-native-elements';
import { collection, addDoc, orderBy, query, onSnapshot, setDoc, doc, Timestamp } from 'firebase/firestore';

type ChatRouteProp = RouteProp<{ Chat: { userEmail: string } }, 'Chat'>;

const Chat = ({ route, navigation }: { route: ChatRouteProp, navigation: any }) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const { userEmail } = route.params;
    const currentUser = auth.currentUser;

    const goHome = () => {
        navigation.navigate('UserList');
    };

    const extractNameFromEmail = (email: string) => {
        return email.split('@')[0];
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ marginLeft: 20 }}>Back</Text>
                </TouchableOpacity>
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
            title: extractNameFromEmail(userEmail),
        });
    }, [navigation, userEmail]);

    useEffect(() => {
        const unsubscribe = getAllMessages();
        return () => unsubscribe();
    }, [userEmail]);

    const getAllMessages = () => {
        const chatRoomId = [currentUser?.email, userEmail].sort().join('_');
        const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    _id: doc.id,
                    ...data,
                    createdAt: data.createdAt.toDate()
                } as IMessage;
            });
            setMessages(messages);
        }, (error) => {
            console.error('Error fetching messages:', error);
        });
    };

    const onSend = useCallback((newMessages: IMessage[] = []) => {
        const chatRoomId = [currentUser?.email, userEmail].sort().join('_');

        newMessages.forEach(async (message) => {
            const messageToSend = {
                ...message,
                createdAt: Timestamp.fromDate(new Date())
            };

            try {
                // Add the message to the chat room
                await addDoc(collection(db, 'chatRooms', chatRoomId, 'messages'), messageToSend);

                // Update User A's chat list
                await setDoc(doc(db, 'users', currentUser?.email!, 'chats', chatRoomId), {
                    userEmail: userEmail,
                    lastMessage: messageToSend.text,
                    lastUpdated: messageToSend.createdAt
                });

                // Update User B's chat list
                await setDoc(doc(db, 'users', userEmail, 'chats', chatRoomId), {
                    userEmail: currentUser?.email!,
                    lastMessage: messageToSend.text,
                    lastUpdated: messageToSend.createdAt
                });
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });
    }, [currentUser?.email, userEmail]);

    return (
        <GiftedChat
            messages={messages}
            showAvatarForEveryMessage={true}
            onSend={(messages) => onSend(messages)}
            user={{
                _id: currentUser?.email || '1',
                name: currentUser?.displayName || 'User',
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



