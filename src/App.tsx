import { Component } from 'react';
import './App.css';
import { apiFetch } from './api';

interface Product {
    id: number;
    shelfOfOrigin: number;
    barcode: string;
    amountCounted: number;
    date?: string;
}

interface AppState {
    items: Product[];
    loading: boolean;
}

export default class App extends Component<Record<string, never>, AppState> {
    static displayName = App.name;

    constructor(props: Record<string, never>) {
        super(props);
        this.state = { items: [], loading: true };
    }

    componentDidMount() {
        this.populateProducts();
    }

    static renderItemsTable(items: Product[]) {
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
                    {items.map(item =>
                        <tr key={item.id}>
                            <td>{item.shelfOfOrigin}</td>
                            <td>{item.barcode}</td>
                            <td>{item.amountCounted}</td>
                            <td>{item.date}</td>
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

        return apiFetch('products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
        })
    }

    createFile = () => {
        const element = document.createElement('a');
        const file = new Blob([JSON.stringify(this.state.items, null, 2)],
            { type: 'application/json;charset=utf-8' });
        const objectUrl = URL.createObjectURL(file);
        element.href = objectUrl;
        element.download = 'Status.json';
        document.body.appendChild(element);
        element.click();
        element.remove();
        URL.revokeObjectURL(objectUrl);
    }

    render() {
        const contents = this.state.loading
            ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
            : App.renderItemsTable(this.state.items);
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

    

    async populateProducts() {
        const response = await apiFetch('products');
        const data: Product[] = await response.json();
        this.setState({ items: data, loading: false });
    }
}
