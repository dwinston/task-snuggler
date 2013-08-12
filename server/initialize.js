Meteor.startup(function () {
  if (Events.find().count() === 0) {
    
    var date = new Date();
	  var d = date.getDate();
	  var m = date.getMonth();
	  var y = date.getFullYear();

	  var events = [
		  {
			  title: 'Meeting',
			  start: new Date(y, m, d, 10, 30),
			  allDay: false
		  },
		  {
			  title: 'Lunch',
			  start: new Date(y, m, d, 12, 0),
			  end: new Date(y, m, d, 14, 0),
			  allDay: false
		  },
		  {
			  title: 'Birthday Party',
			  start: new Date(y, m, d+1, 19, 0),
			  end: new Date(y, m, d+1, 22, 30),
			  allDay: false
		  }
	  ];

    var sleepStart = function (offset) {
      return new Date(y,m,d+offset,21,0);
    }
    var sleepEnd = function (offset) {
      return new Date(y,m,d+offset+1,9,0);
    }
    _.each([0,1,2,3], function (offset) {
      events.push({
        title: 'Sleep',
        start: sleepStart(offset),
        end: sleepEnd(offset),
        allDay: false
      });
    });

    _.each(events, function (evt) {
      Events.insert(evt);
    });
    
    if (Commitments.find().count() == 0) {
      Commitments.insert({
        numSessions: 3,
        hoursPerSession: 1,
        title: "Jogging",
        eventIds: []
      }, function (err, res) {
        generateEvents(res);
      });
    }

  }
});
