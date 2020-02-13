var express = require('express');
var router = express.Router();
var db = require("../models");
var helpers = require("../helpers/meetings");

router.route('/')
	.get(helpers.getMeetings)
	.post(helpers.createMeeting);

router.route('/:meetingId')
	.get(helpers.getMeeting)
	.put(helpers.replaceMeeting)
  .patch(helpers.updateMeeting)
	.delete(helpers.deleteMeeting);

module.exports = router;
