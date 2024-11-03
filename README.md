# Hackmate (In Progress)

![image](https://github.com/user-attachments/assets/0f0b56ca-8fc2-492c-a592-8100e67743e4)


Hackmate is a platform designed to help college students and hackathon participants connect with teammates based on skills and shared interests. The application allows users to search for and message potential teammates, with a focus on connecting students from the same college or university.

![image](https://github.com/user-attachments/assets/035ee572-512a-4cf4-aaeb-150548000e60)
![image](https://github.com/user-attachments/assets/a96aaea6-91ef-4a3a-9012-117f71b8c990)
![image](https://github.com/user-attachments/assets/c0b5ddf3-592b-4629-81b3-f8860260900b)
![image](https://github.com/user-attachments/assets/4d53505b-0ec6-4f26-ac79-ca60e7b52393)
![image](https://github.com/user-attachments/assets/ffae9b94-b393-4218-a8ae-4f5538935166)



## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Skill-Based Search**: Users can search for teammates based on specific skills, with results prioritized by college.
- **User Profiles**: Users can create and manage profiles with details such as bio, skills, and social links.
- **Real-Time Messaging**: Firebase-powered chat functionality allows users to communicate instantly.
- **Responsive UI**: Built with Next.js and Tailwind CSS for a seamless user experience on all devices.
- **College-Based Prioritization**: Search results highlight users from the same college for easier connections.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Firebase Authentication and Firestore Database
- **Real-Time Messaging**: Firebase Firestore (for messaging data)
- **Deployment**: Vercel
- **UI Components**: Radix UI, shadcn, Lucide Icons
- **Animations**: Framer Motion

## Installation

### Prerequisites
- **Node.js** (v14 or later) and **npm**
- **Firebase Project**: Set up a Firebase project with Firestore and Authentication enabled.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hackmate.git
   cd hackmate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase by setting up your credentials in the `.env` file (see below).

4. Run the development server:
   ```bash
   npm run dev
   ```

The application should now be running at `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the root directory and add your Firebase configuration values:

```plaintext
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Usage

- **User Authentication**: Sign up or log in using email and password authentication.
- **Search for Teammates**: Navigate to the dashboard to search for teammates based on skills. 
- **Real-Time Chat**: Use the messaging feature to connect with other users in real-time.
  
## Contributing

Contributions are welcome! If you have ideas for new features or improvements, please open an issue or submit a pull request.

