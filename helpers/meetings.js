const db = require('../models');
const mongoose = require('mongoose');

///////////////////// Helper Function ////////////////////////////
function getMeetingCode(count, cb) {
  if (count > 8999) {
    console.log( "Number of meetings: " + count + " exceeds max of 8,999. Code = 10000" );
    cb(10000);
  } else {
    const randNum = Math.floor(9000 * Math.random()) + 1000;
    db.Meeting.findOne({ code: randNum }, function(err, foundMeeting) {
      if (err) {
        console.log("getMeetingCode err: " + err);
        cb(0);
      } else if (foundMeeting) {
        getMeetingCode(count, cb);
      } else {
        console.log("about to return from getMeetingCode: " + randNum);
        cb(randNum);
      }
    });
  }
}


exports.getMeetings = function(req, res) {
  db.Meeting.find().populate("host").populate("attendees").exec()
    .then(function(meetings) {
        res.json(meetings);
    })
    .catch(function(err) {
        res.send(err);
    })
};

exports.createMeeting = function(req, res) {
  db.Meeting.count({}, function(err, count) {
    if (err) {
      console.log("Meeting.count err: " + err);
      res.send(err);
    } else {
      getMeetingCode(count, function(meetingCode) {
        console.log("line new 170: " + meetingCode);
        console.log("My body: " + req.body);
        console.log(req.body);
        console.log(mongoose.Types.ObjectId.isValid(req.body.host));
        db.User.findById(req.body.host, function(err, foundUser) {
          if (err) {
            console.log("Error finding user of host id: " + err);
            res.send("Error finding user of host id: " + err);
          } else if (!foundUser) {
            console.log("No user with matching ID found.");
          } else {
            const newMeeting = new db.Meeting({
              title: req.body.title,
              // date: req.body.date,
              // time: req.body.time,
              // notes: req.body.notes,
              host: foundUser._id,
              code: meetingCode
            });
            console.log("New Meeting object: " + newMeeting);
            newMeeting.save(function(err) {
              if (!err) {
                console.log("New meeting saved!");
                res.send(meetingCode.toString());
              } else {
                console.log("New meeting save error: " + err);
                res.send(err);
              }
            });
          }
        });
      });
    }
  });
};

exports.getMeeting = function(req, res) {
	db.Meeting.findById(req.params.meetingId).populate("host").populate("attendees")
	.then(function(foundMeeting) {
		res.json(foundMeeting);
	})
	.catch(function(err) {
		res.send("Meeting not found: " + err);
	});
};

exports.replaceMeeting = function(req, res) {
	db.Meeting.replaceOne({_id: req.params.meetingId}, req.body, {new: true})
	.then(function(meeting) {
		res.json(meeting);
	})
	.catch(function(err) {
		res.send(err);
	})
};

exports.updateMeeting = function(req, res) {
	db.Meeting.findOneAndUpdate({_id: req.params.meetingId}, req.body, {new: true})
	.then(function(meeting) {
		res.json(meeting);
	})
	.catch(function(err) {
		res.send(err);
	})
};

exports.deleteMeeting = function(req, res) {
	db.Meeting.deleteOne({_id: req.params.meetingId})
	.then(function() {
		res.json({message: 'Successfully deleted meeting!'});
	})
	.catch(function(err) {
		res.send(err);
	})
};



module.exports = exports;
