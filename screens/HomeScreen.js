/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {useCallback, useEffect, useState} from 'react';
import {MagnifyingGlassIcon, XMarkIcon} from 'react-native-heroicons/outline';
import {CalendarDaysIcon, MapPinIcon} from 'react-native-heroicons/solid';
import {debounce} from 'lodash';
import {theme} from '../theme';
import {fetchLocations, fetchWeatherForecast} from '../api/weather';
import * as Progress from 'react-native-progress';
import MyComponent from './statusBar';
import {weatherImages} from '../constants';
import {getData, storeData} from '../utils/asyncStorage';
import {KeyboardAvoidingView} from 'react-native';
import {Platform} from 'react-native';

const HomeScreen = () => {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({});

  const handleSearch = search => {
    if (search && search.length > 2) {
      fetchLocations({cityName: search}).then(data => {
        setLocations(data);
      });
    }
  };

  const handleLocation = loc => {
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7',
    }).then(data => {
      setLoading(false);
      setWeather(data);
      storeData('city', loc.name);
    });
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'Ambala';
    if (myCity) {
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const {location, current} = weather;

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -150}>
      <View style={styles.container}>
        <MyComponent style="light" />
        <Image
          blurRadius={2}
          source={require('../assets/images/bg1.png')}
          style={styles.backgroundImage}
        />
        {loading ? (
          <View style={styles.loadingContainer}>
            <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
          </View>
        ) : (
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.searchContainer}>
              <View
                style={[
                  styles.searchInputContainer,
                  {
                    backgroundColor: showSearch
                      ? theme.bgWhite(0.3)
                      : 'transparent',
                  },
                ]}>
                {showSearch ? (
                  <TextInput
                    onChangeText={handleTextDebounce}
                    placeholder="Search City"
                    placeholderTextColor={'lightgray'}
                    style={styles.searchInput}
                  />
                ) : null}
                <TouchableOpacity
                  onPress={() => toggleSearch(!showSearch)}
                  style={[
                    styles.searchButton,
                    {
                      backgroundColor: theme.bgWhite(0.4),
                    },
                  ]}>
                  {showSearch ? (
                    <XMarkIcon size={30} color="white" />
                  ) : (
                    <MagnifyingGlassIcon size={30} color="white" />
                  )}
                </TouchableOpacity>
              </View>
              {locations.length > 0 && showSearch ? (
                <View style={styles.locationList}>
                  {locations.map((loc, index) => {
                    let showBorder = index + 1 !== locations.length;
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleLocation(loc)}
                        style={[
                          styles.locationListItem,
                          showBorder && styles.locationListItemWithBorder,
                        ]}>
                        <MapPinIcon size="20" color="gray" />
                        <Text style={styles.locationListItemText}>
                          {loc?.name}, {loc?.country}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <View style={styles.forecastContainer}>
              <View style={styles.forecastLocationContainer}>
                <Text style={styles.forecastLocationText}>
                  {location?.name}, {location?.region}
                </Text>
              </View>

              <View style={styles.forecastWeatherIconContainer}>
                <Image
                  source={weatherImages[current?.condition?.text || 'other']}
                  style={styles.forecastWeatherIcon}
                />
              </View>

              <View style={styles.forecastDegreeContainer}>
                <Text style={styles.forecastDegreeText}>
                  {current?.temp_c}&#176;
                </Text>
                <Text style={styles.forecastConditionText}>
                  {current?.condition?.text}
                </Text>
              </View>

              <View style={styles.forecastStatsContainer}>
                <View style={styles.forecastStatItem}>
                  <Image
                    source={require('../assets/icons/wind.png')}
                    style={styles.forecastStatIcon}
                  />
                  <Text style={styles.forecastStatText}>
                    {current?.wind_kph}km
                  </Text>
                </View>
                <View style={styles.forecastStatItem}>
                  <Image
                    source={require('../assets/icons/drop.png')}
                    style={styles.forecastStatIcon}
                  />
                  <Text style={styles.forecastStatText}>
                    {current?.humidity}%
                  </Text>
                </View>
                <View style={styles.forecastStatItem}>
                  <Image
                    source={require('../assets/icons/sun.png')}
                    style={styles.forecastStatIcon}
                  />
                  <Text style={styles.forecastStatText}>
                    {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.forecastDailyContainer}>
              <View style={styles.forecastDailyHeader}>
                <CalendarDaysIcon size={22} color="white" />
                <Text style={styles.forecastDailyHeaderText}>
                  Daily forecast
                </Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={styles.forecastDailyScrollView}
                showsHorizontalScrollIndicator={false}>
                {weather?.forecast?.forecastday?.map((item, index) => {
                  const date = new Date(item.date);
                  const options = {weekday: 'long'};
                  let dayName = date.toLocaleDateString('en-US', options);
                  dayName = dayName.split(',')[0];

                  return (
                    <View
                      key={index}
                      style={[
                        styles.forecastDailyItem,
                        {backgroundColor: theme.bgWhite(0.15)},
                      ]}>
                      <Image
                        source={
                          weatherImages[item?.day?.condition?.text || 'other']
                        }
                        style={styles.forecastDailyIcon}
                      />
                      <Text style={styles.forecastDailyDayName}>{dayName}</Text>
                      <Text style={styles.forecastDailyTemp}>
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  searchContainer: {
    height: '10%',
    marginHorizontal: 20,
    zIndex: 50,
    top: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    paddingLeft: 16,
    height: 30,
    paddingBottom: 1,
    fontSize: 20,
    color: 'white',
  },
  searchButton: {
    borderRadius: 999,
    padding: 10,
    margin: 5,
    backgroundColor: 'transparent',
  },
  locationList: {
    width: '100%',
    marginTop: 10,
  },
  locationListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  locationListItemText: {
    color: '#333',
    fontSize: 18,
    marginLeft: 10,
  },
  locationListItemWithBorder: {
    borderBottomWidth: 2,
  },
  forecastContainer: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  forecastLocationText: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold', //
  },
  forecastCountryText: {
    color: 'gray',
    fontSize: 17,
    fontWeight: 'bold',
  },
  forecastWeatherIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
  },
  forecastWeatherIcon: {
    width: 170,
    height: 170,
  },
  forecastDegreeContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forecastLocationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  forecastDegreeText: {
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: 75,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  forecastConditionText: {
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  forecastStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  forecastStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    marginLeft: -5,
  },
  forecastStatIcon: {
    width: 25,
    height: 25,
  },
  forecastStatText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 2,
  },

  forecastDailyContainer: {
    marginBottom: 20,
  },
  forecastDailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  forecastDailyHeaderText: {
    color: 'white',
    fontSize: 18,
    margin: 10,
  },
  forecastDailyScrollView: {
    paddingHorizontal: 15,
  },
  forecastDailyItem: {
    width: 95,
    borderRadius: 18,
    paddingVertical: 20,
    marginRight: 15,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forecastDailyIcon: {
    width: 50,
    height: 50,
  },
  forecastDailyDayName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  forecastDailyTemp: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HomeScreen;
