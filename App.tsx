import { StatusBar } from 'expo-status-bar';
import { useReducer, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
const { StorageAccessFramework } = FileSystem;


const initialState = {
  weight: 0,
  height: 0,
  inches: 0,
  unit: 'imperial',
  unitsOpen: false
};

function reducer(state, action) {
  switch (action.type) {
    case 'weight':
      return {...state, weight: action.payload};
    case 'height':
      return {...state, height: action.payload};
    case 'inches':
      return {...state, inches: action.payload};
    case 'unit':
      let newWeight = 0
      let newHeight = 0
      let newInches = 0
      console.log(action.payload)
      if(action.payload === 'imperial') {
        newWeight = state.weight * 2.20462262185

        let totalInches = state.height * 39.370
        console.log(totalInches)
        newHeight = state.height * 3.280839895
        console.log(newHeight)
        newHeight = Math.round(newHeight)
        console.log(newHeight)
        let totalHeight = newHeight * 12
        console.log(totalHeight)
        newInches = totalInches - totalHeight
      } else {
        newWeight = state.weight * 0.45359237

        let heightToInches = state.height * 12

        newInches = heightToInches + state.inches

        newHeight = newInches * 0.0254
      }
      return {
        ...state,
        unit: action.payload,
        unitsOpen: false,
        height: newHeight,
        inches: newInches,
        weight: newWeight.toFixed(0)
      };
    case 'init': 
      return{...state, height: action.payload.height, inches: action.payload.inches, weight: action.payload.weight, unit: action.payload.unit}
    case 'open': 
      return{...state, unitsOpen: !state.unitsOpen}
    default:
      throw new Error();
  }
}

export default function App() {

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if(Platform.OS === 'ios') {
      const handleIosSave = async() => {
        let savedData = await AsyncStorage.getItem('savedData')

        let parsedData = JSON.parse(savedData)

        dispatch({type: 'init', parsedData})
      }

      handleIosSave()
    } else {
      const handleAndroidSave = async() => {
        let saveUri = await AsyncStorage.getItem('uri')
        if(saveUri) {
          console.log(saveUri)
          let newUri = saveUri.split('')
          newUri.pop()
          newUri.shift()
          let finalUri = newUri.join('')
          let data = await FileSystem.readAsStringAsync(finalUri, { encoding: FileSystem.EncodingType.UTF8 })
          let finalData = JSON.parse(data)
          dispatch({type: 'init', payload: finalData})
        }
      }

      handleAndroidSave()
    }
  }, [])

  const onSave = async () => {
    // StorageAccessFramework is not supported on IOS so data will be saved via AsyncStorage
    if(Platform.OS === 'ios') {
      const saveIos = async() => {
        await AsyncStorage.setItem('savedData', JSON.stringify(state))
      }

      saveIos()
    } else {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        try {
          StorageAccessFramework.createFileAsync( permissions.directoryUri, "savedData", "application/json")
              .then(async(uri) => {
                console.log(uri)
                  await FileSystem.writeAsStringAsync(uri, JSON.stringify(state), { encoding: FileSystem.EncodingType.UTF8 })
                        .catch(e => {
                          console.log(e)
                        })
                  await AsyncStorage.setItem('uri', JSON.stringify(uri))
              })
              .catch(async(e) => {
                await AsyncStorage.setItem('savedData', JSON.stringify(state))
                console.log(e);
              });
      } catch (e) {
        await AsyncStorage.setItem('savedData', JSON.stringify(state))
        console.log(e)
      }
      } else {
        const elseSave = async() => {
          await AsyncStorage.setItem('savedData', JSON.stringify(state))
        }

        elseSave()
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={{height: '50%', width: '65%', marginTop: '55%', marginLeft: '15%', backgroundColor: '#fff', paddingTop: 25, borderWidth: 0, borderRadius: 15}}>

          <View style={{flex: 0, alignItems: 'center'}}>
            <Text style={{marginBottom: 10}}>Height</Text>
            {state.unit === 'imperial' ? <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, width: 75, height: 50, marginHorizontal: 10}}>
                <TextInput keyboardType="numeric" style={{width: '75%', paddingLeft: 10}}  value={state.height === '' ? state.height : `${Math.round(state.height)}`} onChangeText={(text) => dispatch({type: 'height', payload: text})} />
                <Text>{state.unit === 'imperial' ? 'ft' : 'm'}</Text>
              </View>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, width: 75, height: 50, marginHorizontal: 10}}>
                <TextInput keyboardType="numeric" style={{width: '65%', paddingLeft: 10}} value={state.inches === '' ? state.inches : `${Math.round(state.inches)}`} onChangeText={(text) => dispatch({type: 'inches', payload: text})} />
                <Text>inch</Text>
              </View>
            </View> :<View style={{ flex: 0,flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, width: 100, height: 50}}>
                <TextInput keyboardType="numeric" style={{width: '75%', paddingLeft: 10}} value={state.height === '' ? state.height : `${state.height.toFixed(2)}`} onChangeText={(text) => dispatch({type: 'height', payload: text})} />
                <Text>m</Text>
              </View>}
          </View>

          <View style={{flex: 0, flexDirection: 'row', alignItems: 'center', marginTop: 100}}>
            <View style={{flex: 1, alignItems: 'center' }}>
              <Text style={{marginBottom: 10}}>Weight</Text>
              <View style={{flex: 0, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, width: 100, height: 50}}>
                <TextInput style={{width: '75%', paddingLeft: 10}} keyboardType="numeric" value={`${state.weight}`} onChangeText={(text) => dispatch({type: 'weight', payload: text})} />
                <Text>{state.unit === 'imperial' ? 'lb' : 'kg'}</Text>
              </View>
            </View>

            <View style={{flex: 1, alignItems: 'center'}}>
              <Text style={{marginBottom: 10}}>Unit</Text>
              <View style={state.unitsOpen ? {borderWidth: 1, borderRadius: 10,} : {}}>
                <TouchableOpacity style={!state.unitsOpen ? {borderWidth: 1, borderRadius: 10, width: 80, height: 45, padding: 10} : { width: 80, height: 45, padding: 10}} onPress={() => dispatch({type: 'open', payload: !state.unitsOpen})}>
                  <Text style={{textAlign: 'center'}}>{state.unit !== 'imperial' ? 'Metric' : 'Imperial'}</Text>
                </TouchableOpacity>
                {state.unitsOpen ? <View style={{zIndex: 1, width: 80, backgroundColor: '#fff', bottom: 5}}>
                  <TouchableOpacity onPress={() => dispatch({type: 'unit', payload: state.unit === 'imperial' ? 'metric' : 'imperial'})}><Text style={{textAlign: 'center'}}>{state.unit === 'imperial' ? 'Metric' : 'Imperial'}</Text></TouchableOpacity>
                </View>
               : null}
              </View>
            </View>
        
      </View>
      <TouchableOpacity style={{borderWidth: 1, borderRadius: 10, padding: 15, marginTop: '25%', width: 80, marginLeft: '35%'}} onPress={() => onSave()}><Text style={{textAlign: 'center'}}>Save</Text></TouchableOpacity>
      <StatusBar style="auto" />
    </View>
          </View>
  
         
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue',
  },
});
