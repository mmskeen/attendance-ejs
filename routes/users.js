var express = require('express');
var router = express.Router();
var db = require("../models");
var helpers = require("../helpers/users");

router.route('/')
	.get(helpers.getUsers)
	.post(helpers.createUser)
  .delete(helpers.deleteUsers);

router.route('/:userId')
	.get(helpers.getUser)
	.put(helpers.replaceUser)
  .patch(helpers.updateUser)
	.delete(helpers.deleteUser);

router.route('/:userId/attendEvent')
  .post(helpers.createAttendEvent)
  .delete(helpers.deleteAttendEvent);

router.route('/:userId/meetingsAttended')
  .get(helpers.getMeetingsAttended);

router.route('/:userId/meetingsHosted')
  .get(helpers.getMeetingsHosted);

module.exports = router;
