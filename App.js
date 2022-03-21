import * as React from 'react';
import MapView, { Overlay } from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, Image, Alert, SafeAreaView, Platform } from 'react-native';
import moment from 'moment';
import * as Location from 'expo-location';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const API_KEY = "55775263cf6b51639e5c66491f37ec2c";

var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: 7.445350,
        longitude: 125.808334,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      date: null,
      temp: null,
      icon: null,
      address: null
    }
  }

  componentDidMount(){
    let today = new Date();
    let today_formatted = moment(today).format('ddd D, MMMM')
    this.setState({ date: today_formatted})
    this.getWeatherInfo()
  }

  getWeatherInfo = async () => {
    const { region } = this.state
    let lat = region.latitude;
    let long = region.longitude;

    let SOURCE = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${API_KEY}`
    try {
      let response = await fetch(SOURCE);
      let json = await response.json();
      if(json) {
        this.setWeatherInfo(json);
      } else {
        Alert.alert(
          'Error',
          'Something went wrong.',
          [{ text: 'OK', onPress: () => { console.log('OK Pressed')}}],
          { cancelable: false }
        );
      }
    } catch (error) {
       console.error(error);
    }
  }

  setWeatherInfo = (data) => {
    var temp = data.main.temp.toString().substring(0, 2) + "." + data.main.temp.toString()[2] + "°C";
    this.setState({ 
      temp: temp,
      icon: data.weather[0].icon
    })
  }

  setAddressName = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }
    const { region } = this.state
    let latitude = region.latitude;
    let longitude = region.longitude;
    let response = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });
    if(response) {
      this.checkAddressNames(response[0])
    }
  }

  checkAddressNames = (data) => {
    let city = data.city ? data.city + ", " : "";
    let subregion = data.subregion;
    let address = `${city}${subregion}`
    this.setState({ address })
  }
 
  render() {
    const { date, temp, icon, address } = this.state;
    return (
      <View style={styles.container}>
        {Platform.OS === 'ios' ? <SafeAreaView></SafeAreaView> :
        <View style={{backgroundColor: "transparent", height: getStatusBarHeight(), width: width}}></View>}
        <MapView style={styles.map} 
          initialRegion={{
            latitude: 7.445350,
            longitude: 125.808334,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          region={this.state.region}
          onRegionChangeComplete={(region) => {
            this.setState({ region: region })
            this.setAddressName();
            this.getWeatherInfo();
          }}
          />
        <View style={styles.weather}>
          <View style={{flexDirection:'row', alignItems:'center', marginTop:10, marginHorizontal:20}}>
            <Text style={styles.today}>Today</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
          <View style={{flexDirection:'row', alignItems:'center', marginHorizontal:20}}>
            <Text style={styles.temp}>{temp}</Text>
            <Image
              source={{ uri: `http://openweathermap.org/img/w/${icon}.png`}}
              style={styles.icon}
              />
          </View>
          <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', marginBottom:10}}>
            <Image
              source={require('./assets/location.png')}
              style={styles.pin}
              />
            <Text style={styles.address}>{address}</Text>
          </View>
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: width,
    height: height,
  },
  today: {
    color: 'white',
    fontSize: 25,
    flex: 1,
  },
  date: {
    color: 'white',
    fontSize: 15,
    flex: 1,
    textAlign: 'right'
  },
  temp:  {
    flex: 1,
    color: 'white',
    fontSize: 50,
    alignContent: 'flex-end'
  },
  icon: {
    width: 100, 
    height: 100,  
    resizeMode: 'contain',
  },
  pin: {
    width: 20, 
    height: 20,  
    resizeMode: 'contain',
  },
  address: {
    color: 'white',
    fontSize: 20,
    flexWrap: 'wrap',
    flexShrink: 1
  },
  weather: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    backgroundColor: 'rgba(0, 51, 102, 0.4)',
    borderRadius: 5, 
    width: width * 0.70,
    overflow: 'hidden'
  },
});