// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebaseConfig';
import { collection, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import '../app/globals.css';
import ProtectedRoute from '../components/ProtectedRoute';

interface UserProfile {
  id: string;
  name: string;
  photoUrl?: string;
  college: string;
  skills: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchCurrentUserName();
      fetchUsers();
    }
  }, [user, loading, router]);

  const fetchCurrentUserName = async () => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentUserName(data.name || user.displayName || 'User');
      } else {
        setCurrentUserName(user.displayName || 'User');
      }
    }
  };

  const fetchUsers = async () => {
    if (!user) return;
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('id', '!=', user.uid));
    try {
      const querySnapshot = await getDocs(q);
      const fetchedUsers = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Anonymous User',
          photoUrl: data.photoUrl,
          college: data.college,
          skills: data.skills,
        } as UserProfile;
      });
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.college?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-yellow-300 p-6">
        <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Welcome, {currentUserName}!
          </h2>
          <p className="mt-2 text-gray-600 text-center">
            Here you can search for teammates for your next hackathon.
          </p>
          <div className="mt-6">
            <h3 className="text-2xl font-semibold text-gray-700">Discover Other Hackers</h3>
            <Input
              type="text"
              placeholder="Search by name, skills, or college"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-4 mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map(user => (
                <Card key={user.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={user.photoUrl} alt={user.name} />
                        <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>College:</strong> {user.college || 'Not specified'}</p>
                    <p><strong>Skills:</strong> {user.skills || 'Not specified'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default Dashboard;
