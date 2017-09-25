import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch
} from 'react-router-dom'

import HomePage from './HomePage';
import { Layout } from './Layout';

export const App = () => (
    <Layout>
        <Switch>
            <Route exact path="/" component={HomePage} />
        </Switch>
    </Layout>
);

export default App;