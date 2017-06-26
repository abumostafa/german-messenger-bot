const express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    config = require('./config/default'),
    path = require('path'),
    dict = require('./src/service/dictionary');

app.use(bodyParser.json());
app.use(require('./src/routes'));

app.get('/app/privacy', (request, response, next) => {
    response.sendFile(path.join(__dirname + '/static/html/privacy.html'));
});

app.get('/', (request, response, next) => {

    const { query } = request;

    try {
        dict
            .lookup((query.q))
            .then((body) => {
                response.json(body)
            })
            .catch(err => response.send(err));
    } catch (e) {
        next(e);
        response.send(e)
    }
});

app.listen(config.server.port, () => {

    console.log('Server running on port %s', config.server.port)
});