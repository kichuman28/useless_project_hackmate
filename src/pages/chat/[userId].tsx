'use client'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebaseConfig';
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  or,
  and 
} from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from '../../components/Navbar';
import { format } from 'date-fns';
import "../../app/globals.css"

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Timestamp;
}

interface UserProfile {
  id: string;
  name: string;
  photoUrl?: string;
}

const ChatPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverProfile, setReceiverProfile] = useState<UserProfile | null>(null);
  const [senderProfile, setSenderProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (userId && user) {
      // Fetch profiles
      const fetchProfiles = async () => {
        try {
          // Fetch receiver's profile
          const receiverDoc = await getDoc(doc(db, 'users', userId as string));
          if (receiverDoc.exists()) {
            setReceiverProfile({ 
              id: receiverDoc.id, 
              name: receiverDoc.data().name || 'Anonymous',
              photoUrl: receiverDoc.data().photoUrl 
            });
          }

          // Fetch sender's profile
          const senderDoc = await getDoc(doc(db, 'users', user.uid));
          if (senderDoc.exists()) {
            setSenderProfile({ 
              id: senderDoc.id, 
              name: senderDoc.data().name || 'Anonymous',
              photoUrl: senderDoc.data().photoUrl 
            });
          }
        } catch (error) {
          console.error("Error fetching profiles:", error);
        }
      };

      fetchProfiles();

      // Subscribe to messages with improved query
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        or(
          and(
            where('senderId', '==', user.uid),
            where('receiverId', '==', userId)
          ),
          and(
            where('senderId', '==', userId),
            where('receiverId', '==', user.uid)
          )
        ),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const newMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Message));
          setMessages(newMessages);
          scrollToBottom();
        },
        (error) => {
          console.error("Error fetching messages:", error);
          // Handle error appropriately
          if (error.code === 'permission-denied') {
            // Show user-friendly error message
            console.log("You don't have permission to access this chat");
          }
        }
      );

      return () => unsubscribe();
    }
  }, [userId, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !userId) return;

    try {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        content: newMessage,
        senderId: user.uid,
        receiverId: userId,
        timestamp: Timestamp.now(), // Use Firestore Timestamp
        participants: [user.uid, userId]
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessageTime = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    return format(timestamp.toDate(), 'h:mm a');
  };

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  // Update the return statement to handle loading
  if (isLoading && (!receiverProfile || !senderProfile)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto pt-24 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={receiverProfile?.photoUrl} />
              <AvatarFallback>{receiverProfile?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{receiverProfile?.name}</h2>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[60vh] overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === user?.uid;
              const profile = isCurrentUser ? senderProfile : receiverProfile;

              return (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={profile?.photoUrl} />
                    <AvatarFallback>{profile?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 