const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for Supabase packages
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Ensure proper resolution of node_modules
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
