import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './App';

ReactDOM.render(
    <Router>
        <AppRoutes />
    </Router>,
    document.getElementById('main')
);