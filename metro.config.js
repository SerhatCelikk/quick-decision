const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Support for .env files via react-native-dotenv (babel plugin handles this)
config.resolver.sourceExts.push('cjs');

module.exports = config;
