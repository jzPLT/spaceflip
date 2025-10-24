# Spaceflip 🚀

A spaceship shooter game built for Fire TV OS using React Native and Expo. Navigate through space, dodge asteroids, and survive as long as possible in this fast-paced arcade-style game.

## Features

- **Fire TV Optimized**: Built specifically for Fire TV with remote control support
- **Cross-Platform**: Supports both Fire TV and Android TV
- **Voice Control**: Alexa voice integration for enhanced gameplay
- **Responsive Controls**: Optimized for TV remote navigation
- **Real-time Physics**: Smooth spaceship movement and collision detection

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android TV builds)
- Xcode (for Apple TV builds, macOS only)

## Installation

```bash
# Clone the repository
git clone https://github.com/jzPLT/spaceflip.git
cd spaceflip

# Install dependencies
npm install
```

## Development

### For Fire TV/Android TV Development:
```bash
# Start development server with TV mode enabled
npm start

# Build and run on Android TV
npm run android

# Prebuild with TV modifications
npm run prebuild:tv
```

### For Mobile Development:
```bash
# Standard Expo development
npm run prebuild
npm run ios     # iOS
npm run android # Android mobile
```

### Web Development:
```bash
npm run web
```

## Building for Production

### Fire TV/Android TV:
1. Enable TV mode: `EXPO_TV=1` environment variable
2. Run prebuild: `npm run prebuild:tv`
3. Build APK using Android Studio or EAS Build

### Apple TV:
1. Run prebuild: `npm run prebuild:tv` 
2. Open iOS project in Xcode
3. Build for Apple TV target

## Deployment

### Fire TV Store:
1. Build production APK with TV optimizations
2. Test on Fire TV device
3. Submit to Amazon Appstore

### Google Play (Android TV):
1. Build Android App Bundle (AAB)
2. Upload to Google Play Console
3. Enable Android TV distribution

## Game Controls

- **D-Pad**: Move spaceship
- **Select/OK**: Fire weapons
- **Menu**: Pause game
- **Back**: Exit to menu
- **Voice**: "Alexa, fire!" or "Alexa, pause game"

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── services/      # Game services (Alexa, etc.)
├── assets.ts      # Asset management
├── constants.ts   # Game constants
├── gameLogic.ts   # Core game logic
└── types.ts       # TypeScript types
```

## TV-Specific Features

- **TV-safe areas**: UI elements positioned for TV screens
- **Focus management**: Proper navigation with remote controls
- **TV banners**: Custom app icons and banners for TV launchers
- **Performance optimized**: 60fps gameplay on Fire TV hardware

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on Fire TV device
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
