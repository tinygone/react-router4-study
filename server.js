var swig = require('swig');
var React = require('react');
//var Router = require('react-router-dom');
import routes from "./app/routes";
import {
    BrowserRouter as Router, Route, match, Link, RouterContext
} from 'react-router-dom';


var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

/*app.use(function(req, res) {
    Router.run(routes, req.path, function(Handler) {
        var html = React.renderToString(React.createElement(Handler));
        var page = swig.renderFile('views/index.html', { html: html });
        res.send(page);
    });
});*/
app.get('*', (req, res) => {
    match(
        {routes, location: req.url},
        (err, redirectLocation, renderProps) => {

            // in case of error display the error message
            if (err) {
                return res.status(500).send(err.message);
            }

            // in case of redirect propagate the redirect to the browser
            if (redirectLocation) {
                return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
            }

            // generate the React markup for the current route
            let markup;
            if (renderProps) {
                // if the current route matched we have renderProps
                markup = renderToString(<RouterContext {...renderProps}/>);
            } else {
                // otherwise we can render a 404 page
                //markup = renderToString(<NotFoundPage/>);
                //res.status(404);
            }

            // render the index template with the embedded React markup
            return res.render('index', {markup});
        }
    );
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
