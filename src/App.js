import React, { useEffect, useState } from "react";
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core";
import { sortData, prettyPrintStat } from "./util";

import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

import "./App.css";

function App() { 
    const [countries, setCountries] = useState([]);
    const [country, setInputCountry] = useState('worldwide');
    const [countryInfo, setCountryInfo] = useState({});
    const [tableData, setTableData] = useState([]);
    const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
    const [mapZoom, setMapZoom] = useState(3);
    const [mapCountries, setMapCountries] = useState([]);
    const [casesType, setCasesType] = useState("cases");

    //STATE = How to write a variable in REACT

    //useEffect = Runs a piece of code 
    //based on a given condition

    useEffect(() => {
        fetch("https://disease.sh/v3/covid-19/all")
        .then((response) => response.json())
        .then((data) => {
            setCountryInfo(data);
        });
    }, []);

    useEffect(() => {
        const getCountriesData = async () => {
           await fetch ("https://disease.sh/v3/covid-19/countries")
           .then((response) => response.json())
           .then((data) => {
               const countries = data.map((country) => (
                   {
                       name: country.country,
                       value: country.countryInfo.iso2
                   }
               ));
                
               const sortedData = sortData(data);
               setTableData(sortedData);
               setMapCountries(data);
               setCountries(countries);
           });
        };

        getCountriesData();
    }, []);


    //STORES THE SELECTED COUNTRY
    const onCountryChange = async (e) => {
        const countryCode = e.target.value;

        const url = countryCode === 'worldwide' 
        ? "https://disease.sh/v3/covid-19/all" 
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

        await fetch(url)
        .then((response) => response.json())
        .then((data) => {
            setInputCountry(countryCode);

            // All of the data from the country response
            setCountryInfo(data);

            // Zoom in to the selected Country
            setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
            setMapZoom(4);
        });
    };

    return (
        <div className="app">
            <div className="app_left">
                <div className="app_header">
                    <h1>COVID-19 TRACKER</h1>
                    <FormControl className="app_dropdown">
                        <Select variant="outlined" onChange={onCountryChange} value={country} >
                            <MenuItem value="worldwide">Worldwide</MenuItem>
                            {
                                countries.map((country) => 
                                (<MenuItem value={country.value}>{country.name}</MenuItem>))
                            }

                        </Select>
                    </FormControl>
                </div>

                <div className="app_stats">
                    <InfoBox
                        isRed
                        active={casesType === "cases"}
                        onClick={(e) => setCasesType("cases")} 
                        title="Coronavirus cases" 
                        cases={prettyPrintStat(countryInfo.todayCases)} 
                        total={prettyPrintStat(countryInfo.cases)}
                    />
                    <InfoBox
                        active={casesType === "recovered"}
                        onClick={(e) => setCasesType("recovered")} 
                        title="Recovered" 
                        cases={prettyPrintStat(countryInfo.todayRecovered)} 
                        total={prettyPrintStat(countryInfo.recovered)}
                    />
                    <InfoBox
                        isRed
                        active={casesType === "deaths"}
                        onClick={(e) => setCasesType("deaths")}  
                        title="Deaths" 
                        cases={prettyPrintStat(countryInfo.todayDeaths)} 
                        total={prettyPrintStat(countryInfo.deaths)}
                    />
                </div>
                    
                <Map 
                    casesType={casesType}
                    countries={mapCountries} 
                    center={mapCenter} 
                    zoom={mapZoom}
                />

            </div>
            <Card className="app_right">
                <CardContent>
                    <h3>Live Cases by Country</h3>
                        <Table countries={tableData} />
                    <h3 className="app_graphTitle">Worldwide new {casesType}</h3>
                        <LineGraph className="app_graph" casesType={casesType}/>
                </CardContent>
            </Card>
        </div>
    );
}

export default App;