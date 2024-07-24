import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { authContext } from '../contexts/authContext';

export default function SplashScreen({ navigation }) {
  const { isSignedIn, loading } = useContext(authContext);

  useEffect(() => {
    if (!loading) {
      navigation.replace(isSignedIn ? 'Main' : 'Login');
    }
  }, [loading, isSignedIn, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Instagram</Text>
      <ActivityIndicator size="large" color="#BBA9D4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#5B5CAE',
  },
});