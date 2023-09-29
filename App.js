import React, {useEffect} from 'react';
import HomeScreen from './screens/HomeScreen';
import SplashScreen from 'react-native-splash-screen';

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return <HomeScreen />;
};

export default App;
