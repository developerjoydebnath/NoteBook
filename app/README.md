# NoteBook Mobile App

Mobile application version of Keep-Notes built with Expo, React Native, and NativeWind.

## Features
- Dashboard with Charts (Activity & Categories)
- Note Management (CRUD)
- Bookmark Management (CRUD)
- Authentication (Login, Register, Forgot Password)
- Bottom Tab Navigation

## Tech Stack
- **Framework**: Expo (SDK 52)
- **Navigation**: Expo Router (File-based)
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: Zustand
- **API**: Axios
- **Charts**: react-native-gifted-charts
- **Icons**: lucide-react-native

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the `app` directory:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:5000/api
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```
