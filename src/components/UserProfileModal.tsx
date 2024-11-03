import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/router';

interface UserProfileModalProps {
  user: {
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
  };
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user }) => {
  const router = useRouter();
  const fallbackInitial = user.name ? user.name[0].toUpperCase() : '?';

  const handleMessageClick = () => {
    // Navigate to chat page with the user's ID
    router.push(`/chat/${user.id}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer w-full h-full">
          {/* This will be your existing UserTile content */}
          <div className="relative pb-[75%]">
            <Avatar className="absolute inset-0 w-full h-full rounded-none">
              <AvatarImage src={user.photoUrl} alt={user.name || 'User'} className="object-cover" />
              <AvatarFallback className="text-4xl">{fallbackInitial}</AvatarFallback>
            </Avatar>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg truncate">{user.name || 'Anonymous User'}</h3>
            <p className="text-sm text-muted-foreground truncate">{user.college || 'College not specified'}</p>
            <div className="mt-2 inline-block bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
              {user.role || 'Role not specified'}
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.photoUrl} alt={user.name || 'User'} />
              <AvatarFallback>{fallbackInitial}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.role}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {user.bio && (
            <div>
              <h3 className="font-semibold">About</h3>
              <p className="text-sm text-muted-foreground">{user.bio}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold">Education</h3>
            <p className="text-sm text-muted-foreground">{user.college}</p>
            {user.course && <p className="text-sm text-muted-foreground">Course: {user.course}</p>}
            {user.semester && <p className="text-sm text-muted-foreground">Semester: {user.semester}</p>}
            {user.branch && <p className="text-sm text-muted-foreground">Branch: {user.branch}</p>}
          </div>
          {user.skills && (
            <div>
              <h3 className="font-semibold">Skills</h3>
              <p className="text-sm text-muted-foreground">{user.skills}</p>
            </div>
          )}
          <div className="pt-4">
            <Button 
              className="w-full" 
              onClick={handleMessageClick}
            >
              Hit Me Up! 🚀
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal; 