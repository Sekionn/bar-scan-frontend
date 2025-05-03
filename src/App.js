import React, { Component } from 'react';
import './App.css';

export default class App extends Component {
    static displayName = App.name;

    constructor(props) {
        super(props);
        this.state = { items: [], loading: true };
    }

    componentDidMount() {
        this.populateWeatherData();
    }

    static renderForecastsTable(items) {
        return (
            <table id='tableDesign' className='tableheader' aria-labelledby="tabelLabel">
                <thead>
                    <tr >
                        <th>Reol</th>
                        <th>Stregkode</th>
                        <th>Antal</th>
                        <th>Dato</th>
                    </tr>
                </thead>
                <tbody >
                    {items.map(forecast =>
                        <tr key={forecast.id}>
                            <td>{forecast.shelfOfOrigin}</td>
                            <td>{forecast.barcode}</td>
                            <td>{forecast.amountCounted}</td>
                            <td>{forecast.date}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    addMockData() {
        const item = {
            shelfOfOrigin: 1,
            barcode: "11111",
            amountCounted: 14,
        };

        fetch(process.env.REACT_APP_Backed_URL + 'Items', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': '*'
            },
            body: JSON.stringify(item)
        })
    }

    async createFile() {
        fetch(process.env.REACT_APP_Backed_URL + 'Items/Export', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then((data) => data.json()).then((data) => {
            const element = document.createElement("a");
            const file = new Blob([data],
                { type: 'text/plain;charset=utf-8' });
            element.href = URL.createObjectURL(file);
            element.download = "Status.txt";
            document.body.appendChild(element);
            element.click();
        })

    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
            : App.renderForecastsTable(this.state.items);
        return (
            <div>
                <div id='contentContainer'>
                    <h1 id="tabelLabel" >Alle scannede stregkoder</h1>
                    {contents}
                    <button onClick={this.addMockData}>Add mock data</button>
                    <button id='exportButton' onClick={this.createFile}>Export</button>
                </div>
                

            </div>
        );
    }

    

    async populateWeatherData() {
        const response = await fetch(process.env.REACT_APP_Backed_URL + 'Items');
        const data = await response.json();
        this.setState({ items: data, loading: false });
    }
}