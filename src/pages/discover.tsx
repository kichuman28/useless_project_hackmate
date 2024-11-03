'use client'
import "../app/globals.css";
import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { Card } from "@/components/ui/card";
import UserProfileModal from '@/components/UserProfileModal';

interface UserProfile {
  id: string;
  name?: string;
  photoUrl?: string;
  college?: string;
  role?: string;
  skills?: string;
  bio?: string;
  course?: string;
  semester?: string;
  branch?: string;
}

const DiscoverPage: React.FC = () => {
  const { loading } = useProtectedRoute();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;

      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs
          .filter(doc => doc.id !== user.uid)
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as UserProfile));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-24 px-4">
        <h1 className="text-3xl font-bold mb-8">Discover Users</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <UserProfileModal user={user} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
