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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto pt-24 px-4 pb-12">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Chat Header */}
          <div className="p-6 border-b bg-white/90 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-indigo-600">
                  <AvatarImage src={receiverProfile?.photoUrl} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 font-medium">
                    {receiverProfile?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{receiverProfile?.name}</h2>
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Online
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => router.push('/chats/overview')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[calc(100vh-320px)] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/30 backdrop-blur-sm">
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
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm font-medium">
                      {profile?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                        isCurrentUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-2">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent rounded-full px-4 py-2"
              />
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 transition-all duration-300 ease-in-out transform hover:scale-105"
                disabled={!newMessage.trim()}
              >
                <span className="mr-2">Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 