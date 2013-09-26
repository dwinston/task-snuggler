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

  var defaultEventGenerationAlgorithm = "learnedMomentsFromNow";
  
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
	userId: donnyId,
        title: 'Birthday Party',
	start: new Date(y, m, d+3, 16, 0),
	end: new Date(y, m, d+3, 18, 30)
      },	    
      {
	userId: donnyId,
        title: 'Ultimate Frisbee',
	start: new Date(y, m, d+6, 12, 0),
	end: new Date(y, m, d+6, 14, 0)
      }, 
      {
        userId: cameronId,
        title: 'Occupy 1',
        start: new Date(y, m, d, 0, 0),
        end: new Date(y, m, d+6, 12, 0)
      },
      {
        userId: cameronId,
        title: 'Occupy 2',
        start: new Date(y ,m, d+6, 17, 0),
        end: new Date(y, m, d+7, 0, 0)
      }, 
      {
        userId: cameronId,
        title: 'Break 1',
        start: new Date(y, m, d+6, 13, 0),
        end: new Date(y, m, d+6, 14, 0)
      }, 
      {
        userId: cameronId,
        title: 'Break 2',
        start: new Date(y, m, d+6, 15, 0),
        end: new Date(y, m, d+6, 16, 0)
      },     
    ];

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
          hoursPerSession: 1,
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
