const express = require('express'),
    router = express.Router(),
    WebHookController = require('./controller/webhook_controller');
    MultiMediaController = require('./controller/multimedia_controller');

router.get('/v1/web-hook', WebHookController.getAction);
router.post('/v1/web-hook', WebHookController.postAction);

router.get('/v1/listen', MultiMediaController.getAction);

module.exports = router;
