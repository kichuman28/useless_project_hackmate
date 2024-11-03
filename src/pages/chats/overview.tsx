'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from '../../components/Navbar';
import { format } from 'date-fns';
import "../../app/globals.css"
import Link from 'next/link';

interface ChatUser {
  id: string;
  name: string;
  photoUrl?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}

const ChatsOverviewPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchChatUsers = async () => {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('participants', 'array-contains', user.uid),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const userMap = new Map<string, ChatUser>();
        
        for (const docSnapshot of snapshot.docs) {
          const message = docSnapshot.data();
          const otherUserId = message.senderId === user.uid ? 
            message.receiverId : message.senderId;

          if (!userMap.has(otherUserId)) {
            // Fetch user profile
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            const userData = userDoc.data();
            
            if (userData) {
              userMap.set(otherUserId, {
                id: otherUserId,
                name: (userData as any).name || (userData as any).displayName || 'Anonymous',
                photoUrl: (userData as any).photoUrl || (userData as any).photoURL,
                lastMessage: message.content,
                lastMessageTime: message.timestamp.toDate(),
                unreadCount: 0 // You can implement unread count logic here
              });
            }
          }
        }

        setChatUsers(Array.from(userMap.values()));
        setIsLoading(false);
      });

      return () => unsubscribe();
    };

    fetchChatUsers();
  }, [user]);

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // If message is from today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return format(messageDate, 'h:mm a');
    }
    
    // If message is from this year, show month and day
    if (messageDate.getFullYear() === now.getFullYear()) {
      return format(messageDate, 'MMM d');
    }
    
    // Otherwise show month, day and year
    return format(messageDate, 'MMM d, yyyy');
  };

  const handleChatSelect = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your messages</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto pt-24 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
          
          <div className="divide-y">
            {chatUsers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No messages yet</p>
                <p className="text-sm text-gray-400">
                  Start a conversation by discovering other hackers!
                </p>
              </div>
            ) : (
              chatUsers.map((chatUser) => (
                <div
                  key={chatUser.id}
                  onClick={() => handleChatSelect(chatUser.id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chatUser.photoUrl} />
                      <AvatarFallback>{chatUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {chatUser.name}
                        </h3>
                        {chatUser.lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(chatUser.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      {chatUser.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {chatUser.lastMessage}
                        </p>
                      )}
                    </div>
                    {chatUser.unreadCount ? (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs">
                        {chatUser.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsOverviewPage; 