import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/core';
import api from '../services/api';

import colors from '../styles/colors';
import fonts from '../styles/fonts';
import { Header } from '../components/Header';
import { EnviromentButton } from '../components/EnviromentButton';
import { PlantCardPrimary } from '../components/PlantCardPrimary';
import {  Load } from '../components/Load';

interface EnviromentProps{
    key: string;
    title: string;
}

interface PlantProps{
    id: string;
    name: string;
    about: string;
    water_tips: string;
    photo: string;
    environments: [string];
    frequency: {
      times: number;
      repeat_every: string;
    }
}

export function PlantSelect(){
    const [enviroments, setEnviroments] = useState<EnviromentProps[]>([]);
    const [plants, setPlants] = useState<PlantProps[]>([]);
    const [filteredPplants, setFilteredPlants] = useState<PlantProps[]>([]);
    const [enviromentsSelected, setEnviromentsSelected] = useState('all');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const navigation = useNavigation();

    function handleEnviromentSelected(enviroment: string){
        setEnviromentsSelected(enviroment);

        if(enviroment == 'all')
            return setFilteredPlants(plants);
            
        const filtered = plants.filter(plant => 
            plant.environments.includes(enviroment)    
        );

        setFilteredPlants(filtered);
    }

    function handleFetchMore(distance: number){
        if(distance < 1)
            return;

        setLoadingMore(true);
        setPage(oldValue => oldValue + 1);
        fetchPlants();
    }

    async function fetchPlants() {

        try {
             const  { data }  = await api
             .get(`plants?_sort=name&_order=asc&_page=${page}&_limit=8`);
             
             if(!data)
                return setLoading(true);
             
             if(page > 1){
                 setPlants(oldValue => [...oldValue, ...data]);
                 setFilteredPlants(oldValue => [...oldValue, ...data]);
             }else{
                 setPlants(data);
                 setFilteredPlants(data);
             }

             setLoading(false);
             setLoadingMore(false);
           
             console.log(data);
  
            } catch(error) {
             console.log(error)
          }            
     }

    function handlePlantSelect(plant: PlantProps) {
        navigation.navigate('PlantSave', { plant });
    }

    useEffect(() => {
        
        fetchPlants();
    },[]);

    
    useEffect(() => {
        async function fetchEnviroment() {

           try {
                const  { data }  = await api
                .get('plants_environments?_sort=title&_order=asc');
                setEnviroments([
                    {
                        key: 'all',
                        title: 'Todos',
                    },
                    ...data
                ]);
     
                console.log(data);
     
            } catch(error) {
               console.log(error)
            }            
        }
        fetchEnviroment();
    },[]);

    if(loading)
        return <Load />
    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Header />
                <Text style={styles.title}>
                    Em qual ambiente
                </Text>
                <Text style={styles.subtitle}>
                    você quer colocar sua planta?
                </Text>
            </View>
            <View>
                <FlatList
                    data={enviroments}
                    keyExtractor={(item) => String(item.key)}
                    renderItem={({ item }) => (
                    <EnviromentButton 
                        title={item.title}
                        active={ item.key === enviromentsSelected }
                        onPress={() => handleEnviromentSelected(item.key)}
                    /> 
                )} 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.enviromentList}
                />
                
            </View>
            <View style={styles.plants}>
                <FlatList 
                    data={filteredPplants}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <PlantCardPrimary 
                            data={item}
                            onPress={() => handlePlantSelect(item)}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    numColumns={2}
                    onEndReachedThreshold={0.1}
                    onEndReached={({ distanceFromEnd }) =>
                        handleFetchMore(distanceFromEnd)
                    }
                    ListFooterComponent={
                        loadingMore
                        ? <ActivityIndicator color={colors.green} />
                        : <></>
                    }
                />
                
            </View>

        </View>
    )

}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: colors.background
    },
    header:{
        paddingHorizontal: 30
    },
    title:{
        fontSize: 17,
        color: colors.heading,
        fontFamily: fonts.heading,
        lineHeight: 20,
        marginTop: 15
    },
    subtitle:{
        fontFamily: fonts.text,
        fontSize: 17,
        lineHeight: 20,
        color: colors.heading

    },
    enviromentList:{
        height: 40,
        justifyContent: 'center',
        paddingBottom: 5,
        marginLeft: 32,
        marginVertical: 32,
        paddingRight: 32
    },
    plants:{
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: 'center'

    }
});