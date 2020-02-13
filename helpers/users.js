const db = require('../models');


exports.getUsers = function(req, res) {
  db.User.find()
    .then(function(foundUsers) {
        res.json(foundUsers);
    })
    .catch(function(err) {
        res.send(err);
    })
};

exports.createUser = function(req, res) {
  const newUser = new db.User({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  });
  newUser.save()
  .then(function(newUser) {
    res.json(newUser);
  })
  .catch(function(err) {
    res.send(err);
  })
}

exports.deleteUsers = function(req, res) {
	db.User.deleteMany()
	.then(function() {
    res.json({message: 'Successfully deleted all users!'});
	})
	.catch(function(err) {
		res.send("Users not deleted: " + err);
	});
};


// route("/users/:userId")

exports.getUser = function(req, res) {
	db.User.findById(req.params.userId)
	.then(function(foundUser) {
		res.json(foundUser);
	})
	.catch(function(err) {
		res.send("User not found: " + err);
	});
};

exports.replaceUser = function(req, res) {
	db.User.replaceOne({_id: req.params.meetingId}, req.body, {new: true})
	.then(function(user) {
		res.json(user);
	})
	.catch(function(err) {
		res.send(err);
	})
};

exports.updateUser = function(req, res) {
	db.User.findOneAndUpdate({_id: req.params.userId}, req.body, {new: true})
	.then(function(user) {
		res.json(user);
	})
	.catch(function(err) {
		res.send(err);
	})
};

exports.deleteUser = function(req, res) {
	db.User.deleteOne({_id: req.params.userId})
	.then(function() {
		res.json({message: 'Successfully deleted user!'});
	})
	.catch(function(err) {
		res.send(err);
	})
};


// route("/users/:userId/attendEvent")

exports.createAttendEvent = function(req, res) {
  db.Meeting.findOne({code: req.body.code}, function(err, foundMeeting) {
    if (foundMeeting) {
      console.log(foundMeeting.attendees);
      if (foundMeeting.attendees.includes(req.params.userId)) {
        res.json({ success: false, error: "You have already attended meeting with code "
          + req.body.code + "." });
      } else {
        foundMeeting.attendees.push(req.params.userId);
        foundMeeting.save();
        res.json({ success: true, description: foundMeeting.title, code: req.body.code });
      }
    } else if (err) {
      res.json({ success: false, error: err });
    } else {
      res.json({ success: false, error: "Meeting #" + req.body.code + " was not found." });
    }
  });
}

exports.deleteAttendEvent = function(req, res) {
  console.log(req.body);
  db.Meeting.findOneAndUpdate({code: req.body.meetingCode},
    {$pull: {attendees: req.params.userId}})
  .then(function() {
    res.json({ success: true, description: "Successfully deleted attendee from meeting",
      code: req.body.meetingCode });
  })
  .catch(function(err) {
    res.send("Failed to delete attendEvent: " + err);
  })
}


// app.route("/users/:userId/meetingsAttended")

exports.getMeetingsAttended = function(req, res) {
  db.Meeting.find({attendees: req.params.userId})
  .then(function(foundMeetings) {
    res.json(foundMeetings);
  })
  .catch(function(err) {
    res.send(err);
  })
}


// app.route("/users/:userId/meetingsHosted")

exports.getMeetingsHosted = function(req, res) {
  db.Meeting.find({host: req.params.userId})
  .then(function(foundMeetings) {
    res.json(foundMeetings);
  })
  .catch(function(err) {
    res.send(err);
  })
}


module.exports = exports;
