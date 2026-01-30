module.exports = {
    dependencies: {
      'react-native-paystack-webview': {
        root: './node_modules/react-native-paystack-webview',
        platforms: {
          ios: {
            // Provide the podspec path if available, or use an empty object if not needed
            podspecPath: './node_modules/react-native-paystack-webview/react-native-paystack-webview.podspec',
          },
          android: {
            // If no additional configuration is needed on Android, leave this empty:
            // (This informs the auto‑linking process that the package is present.)
          },
        },
      },
    },
  };
  