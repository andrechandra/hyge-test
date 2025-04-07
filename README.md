# React Native Radio Podcast App

A feature-rich mobile podcast application built with React Native and Expo, designed to play and manage podcasts from React Native Radio.

## Features

- 🎧 **Podcast Streaming**: Stream episodes directly from React Native Radio
- 📥 **Offline Mode**: Download episodes for offline listening
- ❤️ **Favorites**: Save your favorite episodes for easy access
- 🔄 **Playback Controls**: Play/pause, skip forward/backward, adjust playback speed
- 🔁 **Loop & Shuffle**: Loop episodes or shuffle your playlist
- 💌 **Share Episodes**: Share podcast episodes with friends via system share options
- 🔔 **Notifications**: Get updates about downloads and playback status

## Tech Stack

- React Native
- Expo
- React Context API for state management
- Expo AV for audio playback
- Expo FileSystem for local storage
- AsyncStorage for persistence
- React Native Community components
- Expo Blur for UI effects

## Setup Instructions

### Prerequisites

- Node.js (>=14.0.0)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional for local development)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/andrechandra/hyge-test.git
   cd hyge-test
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the Expo development server

   ```bash
   npx expo start
   ```

4. Run on your preferred platform:
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for web
   - Scan the QR code with Expo Go on your physical device

## Usage

- Browse episodes on the home screen
- Tap an episode to start playback
- Use the mini player at the bottom to control currently playing episode
- Expand the player for more options (speed control, sharing, etc.)
- Download episodes for offline listening by tapping the download icon
- Mark episodes as favorites by tapping the heart icon
- Share episodes with friends using the share button

## Development

The project structure follows a feature-based organization:

- `/context` - Contains Context API providers
- `/components` - Reusable UI components
- `/utils` - Helper functions and utilities
- `/assets` - Images, icons, and other static resources

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React Native Radio](https://reactnativeradio.com/) for the podcast content
- [Expo](https://expo.dev/) for the development framework
- [React Native Community](https://reactnative.dev/community/overview) for their valuable components
