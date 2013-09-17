Meteor.startup(function () {
  // These will be nuked upon 'meteor reset'.
  // To reset e.g. events and commitments,
  // do 'meteor mongo' and then
  // 'db.commitments.remove({})' plus
  // 'db.events.remove({})'.
  if (Meteor.users.find().count() === 0) {
    var usernames = EJSON.parse(Assets.getText("usernames.json"));
    _.each(usernames, function (username) {
      Accounts.createUser({
        username: username,
        password: "foobar"
      });
    });
  }
  var cameronId = Meteor.users.findOne({username: "cameron"})._id;
  var donnyId = Meteor.users.findOne({username: "donny"})._id;

  var defaultEventGenerationAlgorithm = "safeRandomMomentFromNow";
  
  if (Events.find().count() === 0) { 
    var now = moment().startOf('week');
    var d = now.date();
    var m = now.month();
    var y = now.year();
    var events = [
      {
	      userId: donnyId,
        title: 'Meeting',
	      start: new Date(y, m, d+2, 9, 30),
	      end: new Date(y, m, d+2, 10, 30)
      },
      {
	      userId: cameronId,
        title: 'Lunch',
	      start: new Date(y, m, d+1, 12, 0),
	      end: new Date(y, m, d+1, 14, 0)
      },
      {
	      userId: donnyId,
        title: 'Birthday Party',
	      start: new Date(y, m, d+3, 16, 0),
	      end: new Date(y, m, d+3, 18, 30)
      },
      {
	      userId: cameronId,
        title: 'Hacking',
	      start: new Date(y, m, d+5, 16, 0),
	      end: new Date(y, m, d+5, 18, 30)
      },	    
      {
	      userId: donnyId,
        title: 'Ultimate Frisbee',
	      start: new Date(y, m, d+6, 12, 0),
	      end: new Date(y, m, d+6, 14, 0)
      }
    ];

    for (var offset=-1; offset<7; offset++){
      events.push({
        userId: cameronId,
        title: 'Sleep',
        start: new Date(y,m,d+offset,21,0),
        end: new Date(y,m,d+offset+1,9,0)
      });
    }

    _.each(events, function (evt) {
      Events.insert(_.extend(evt, {
        lastUpdated: moment().toDate(),
        commitmentId: 0,
        allDay: false
      }));
    });
    
    if (Commitments.find().count() == 0) {
      Commitments.insert(
        {
          userId: donnyId,
          numSessions: 3,
          hoursPerSession: 1,
          title: "Jog",
          eventIds: [],
          prefs: {}
        }, 
        function (err, res) {
          generateEvents(res, defaultEventGenerationAlgorithm);
        });

      Commitments.insert(
        {
          userId: cameronId,
          numSessions: 2,
          hoursPerSession: 2,
          title: "Code",
          eventIds: [],
          prefs: {}
        }, 
        function (err, res) {
          generateEvents(res, defaultEventGenerationAlgorithm);
        });
    }
  }
});
