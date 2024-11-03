'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, storage } from '../lib/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../components/Navbar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import "../app/globals.css";

interface ProfileData {
  name: string;
  bio: string;
  skills: string;
  college: string;
  course: string;
  semester: string;
  branch: string;
  linkedIn: string;
  github: string;
  role: string;
  photoUrl?: string;
  followers?: number;
  following?: number;
  projects: {
    description: string;
    github: string;
    deployed: string;
  }[];
}

const ProfileView: React.FC<{ profile: ProfileData; user: any; onEdit: () => void }> = ({ profile, user, onEdit }) => {
  return (
    <div className="max-w-4xl mx-auto mt-24 p-4">
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-lg"></div>
        <Avatar className="w-32 h-32 absolute bottom-0 left-8 transform translate-y-1/2 border-4 border-white">
          <AvatarImage src={profile.photoUrl} alt="Profile" />
          <AvatarFallback>{profile.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
      </div>
      <div className="mt-16 px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{profile.name || user.displayName || 'Anonymous User'}</h1>
            <p className="text-gray-600 text-sm mt-1">{profile.college || 'College not specified'}</p>
          </div>
          <Button onClick={onEdit}>Edit Profile</Button>
        </div>
        <p className="text-gray-600 mt-2">{profile.followers || 0} Followers · {profile.following || 0} Following</p>
        <p className="mt-4">{profile.bio}</p>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Education</h2>
          <p>Course: {profile.course}</p>
          <p>Semester: {profile.semester}</p>
          <p>Branch: {profile.branch}</p>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Skills</h2>
          <p>{profile.skills}</p>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Role</h2>
          <p>{profile.role}</p>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Projects</h2>
          {profile.projects && profile.projects.length > 0 ? (
            profile.projects.map((project, index) => (
              <div key={index} className="mt-2">
                <p><strong>Description:</strong> {project.description}</p>
                <p><strong>GitHub:</strong> <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{project.github}</a></p>
                <p><strong>Deployed:</strong> <a href={project.deployed} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{project.deployed}</a></p>
              </div>
            ))
          ) : (
            <p>No projects added yet.</p>
          )}
        </div>
        <div className="mt-6 flex space-x-4">
          {profile.linkedIn && (
            <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              LinkedIn
            </a>
          )}
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    bio: '',
    skills: '',
    college: '',
    course: '',
    semester: '',
    branch: '',
    linkedIn: '',
    github: '',
    role: '',
    followers: 0,
    following: 0,
    projects: [], // Initialize with an empty array
  });
  const [isEditing, setIsEditing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as ProfileData;
        setProfile({
          ...data,
          name: data.name || user.displayName || 'Anonymous User',
          projects: data.projects || [], // Ensure projects is always an array
        });
      } else {
        setProfile(prev => ({ 
          ...prev, 
          name: user.displayName || 'Anonymous User',
          projects: [], // Set an empty array if no profile exists
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfile({ ...profile, [name]: value });
  };

  const handleProjectChange = (index: number, field: string, value: string) => {
    const updatedProjects = [...profile.projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProfile({ ...profile, projects: updatedProjects });
  };

  const addProject = () => {
    setProfile({ ...profile, projects: [...profile.projects, { description: '', github: '', deployed: '' }] });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setIsSubmitting(true);
      try {
        let photoUrl = profile.photoUrl;

        if (photo) {
          const photoRef = ref(storage, `profile-photos/${user.uid}`);
          await uploadBytes(photoRef, photo);
          photoUrl = await getDownloadURL(photoRef);
        }

        const updatedProfile: ProfileData = {
          ...profile,
          photoUrl,
        };

        await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
        setProfile(updatedProfile);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error("Error updating profile:", error);
        alert('An error occurred while updating your profile.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="pt-20">
        {isEditing ? (
          <div className="container mx-auto mt-10 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Edit Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile.photoUrl} alt={profile.name || 'User'} />
                      <AvatarFallback>{profile.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <Input type="file" onChange={handlePhotoChange} accept="image/*" />
                  </div>
                  <div>
                    <label className="block mb-1">Name</label>
                    <Input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Bio</label>
                    <Textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">College</label>
                    <Input
                      type="text"
                      name="college"
                      value={profile.college}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Course</label>
                    <Input
                      type="text"
                      name="course"
                      value={profile.course}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Semester</label>
                    <Input
                      type="text"
                      name="semester"
                      value={profile.semester}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Branch</label>
                    <Input
                      type="text"
                      name="branch"
                      value={profile.branch}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Skills (comma-separated)</label>
                    <Input
                      type="text"
                      name="skills"
                      value={profile.skills}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Role</label>
                    <Select onValueChange={(value) => handleSelectChange('role', value)} value={profile.role}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your primary role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                        <SelectItem value="fullstack">Full Stack</SelectItem>
                        <SelectItem value="devops">DevOps</SelectItem>
                        <SelectItem value="ml">Machine Learning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-1">LinkedIn</label>
                    <Input
                      type="url"
                      name="linkedIn"
                      value={profile.linkedIn}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">GitHub</label>
                    <Input
                      type="url"
                      name="github"
                      value={profile.github}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Projects</label>
                    {profile.projects.map((project, index) => (
                      <div key={index} className="mb-4">
                        <Textarea
                          value={project.description}
                          onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                          placeholder="Project Description"
                          className="mb-2 w-full"
                        />
                        <Input
                          value={project.github}
                          onChange={(e) => handleProjectChange(index, 'github', e.target.value)}
                          placeholder="GitHub Repository URL"
                          className="mb-2 w-full"
                        />
                        <Input
                          value={project.deployed}
                          onChange={(e) => handleProjectChange(index, 'deployed', e.target.value)}
                          placeholder="Deployed Project URL"
                          className="mb-2 w-full"
                        />
                      </div>
                    ))}
                    <Button onClick={addProject} type="button" variant="outline" className="mb-4">Add Another Project</Button>
                  </div>
                  <div className="flex space-x-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update Profile'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <ProfileView profile={profile} user={user} onEdit={() => setIsEditing(true)} />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
