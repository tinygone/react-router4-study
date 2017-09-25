import React from 'react';
import { Provider } from 'react-redux';
import configureStore from '../store/Store';
import { syncHistoryWithStore } from 'react-router-redux';
import routes from '../routes';
import { BrowserRouter as Router } from 'react-router-dom'

const store = configureStore();

export default class AppRoutes extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <Router routes={routes} />
            </Provider>
        );
    }
}
