import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "@shopify/restyle";
import { useFonts } from "expo-font";
import { Asset } from "expo-asset";
import { EventProvider } from "react-native-outside-press";

import {
  Rubik_400Regular,
  Rubik_700Bold,
  Rubik_500Medium,
  Rubik_400Regular_Italic,
  Rubik_700Bold_Italic,
  Rubik_500Medium_Italic,
} from "@expo-google-fonts/rubik";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { RootNavigator } from "./navigation/RootNavigator";
import theme from "./theme";
import { UrqlProvider } from "./providers/UrqlProvider";
import { useAtom } from "jotai";
import { sessionAtom, showNavDrawerAtom } from "./lib/jotai";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import Constants from "expo-constants";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged } from "./lib/firebase";
import { CustomToast } from "./components/CustomToast";
import * as SplashScreen from "expo-splash-screen";
import { useIsLoggedIn } from "./hooks/useIsLoggedIn";
import { useRefreshSession } from "./hooks/useRefreshSession";
import splashImage from "../assets/images/splash.png";
import { RootStackParamList } from "./navigation/types";
import { NavDrawer } from "./components/NavDrawer";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function App() {
  let [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
    Rubik_500Medium,
    Rubik_400Regular_Italic,
    Rubik_700Bold_Italic,
    Rubik_500Medium_Italic,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const isLoggedIn = useIsLoggedIn();
  const [session, setSession] = useAtom(sessionAtom);

  const { refreshSession } = useRefreshSession();

  useEffect(() => {
    const unsubscribeListener = onAuthStateChanged(async () => {
      // Whenever auth state changes, we no longer know what the session is.
      // We must wait for this handler to run to completion, resolving
      // the session to either authenticated or null.
      setSession(undefined);
      refreshSession();
    });

    return () => {
      unsubscribeListener();
    };
  }, [refreshSession, setSession]);

  const sessionLoaded = session !== undefined;
  const appIsReady = fontsLoaded && sessionLoaded;

  return (
    <AnimatedAppLoader
      isAppReady={appIsReady}
      imageUri={Image.resolveAssetSource(splashImage).uri}
    >
      <SafeAreaProvider>
        <UrqlProvider>
          <ThemeProvider theme={theme}>
            <NavigationContainer>
              <EventProvider style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" />
                <RootNavigator />
                <NavDrawer />
              </EventProvider>
            </NavigationContainer>
            <CustomToast />
          </ThemeProvider>
        </UrqlProvider>
      </SafeAreaProvider>
    </AnimatedAppLoader>
  );
}

export default App;

function AnimatedAppLoader({
  children,
  imageUri,
  isAppReady,
}: {
  children: ReactNode;
  imageUri: string;
  isAppReady: boolean;
}) {
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await Asset.fromURI(imageUri).downloadAsync();
      setSplashReady(true);
    }

    prepare();
  }, [imageUri]);

  if (!isSplashReady) {
    return null;
  }

  return (
    <AnimatedSplashScreen imageUri={imageUri} isAppReady={isAppReady}>
      {children}
    </AnimatedSplashScreen>
  );
}

function AnimatedSplashScreen({
  children,
  imageUri,
  isAppReady,
}: {
  children: ReactNode;
  imageUri: string;
  isAppReady: boolean;
}) {
  const animation = useSharedValue(1);

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isAppReady) {
      animation.value = withTiming(0, { duration: 500 });
    }
  }, [isAppReady]);

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync().catch(() => {});
      // Load stuff
    } catch (e) {
      // handle errors
    } finally {
      setImageLoaded(true);
    }
  }, []);

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: Constants.expoConfig?.splash?.backgroundColor,
      opacity: animation.value,
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    return {
      width: "100%",
      height: "100%",
      resizeMode: Constants.expoConfig?.splash?.resizeMode || "contain",
      transform: [
        {
          scale: 2 - animation.value,
        },
      ],
    };
  });

  const appReady = isAppReady && imageLoaded;

  return (
    <View style={{ flex: 1 }}>
      {appReady && children}
      <Animated.View pointerEvents="none" style={backgroundStyle}>
        <Animated.Image
          style={imageStyle}
          source={{ uri: imageUri }}
          onLoadEnd={onImageLoaded}
          fadeDuration={0}
        />
      </Animated.View>
    </View>
  );
}
