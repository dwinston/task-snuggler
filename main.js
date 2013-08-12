Events = new Meteor.Collection("events");
Commitments = new Meteor.Collection("commitments");

// the Date returned must lie on a minutePin.
// e.g. minutePins = [0, 30] means the returned date
// must be on the hour or on a half hour
var randomDateFromNow = function(daysFromNow, minutePins) {
  var date = new Date();
	var d = date.getDate();
	var m = date.getMonth();
  var h = date.getHours();
	var y = date.getFullYear();

  var d_offset = Math.floor(Math.random() * daysFromNow);
  date.setDate(d + d_offset);
  var h_new = Math.floor(Math.random() * 24);
  var minutes = _.first(_.shuffle(minutePins));
  date.setHours(h_new);
  date.setMinutes(minutes);

  return date;
};

generateEvents = function (commitmentId) {

  console.log('generating events for commitment ' + commitmentId);

  var commitment = Commitments.findOne(commitmentId);
  for (var s=0; s < commitment.numSessions; s++) {
    var startsAt = randomDateFromNow(3, [0, 30]);
    Events.insert({
      title: commitment.title + ' #' + (s+1),
      start: startsAt,
      end: new Date(startsAt.getTime() + 
                    1000 * 60 * 60 * commitment.hoursPerSession),
      allDay: false
    }, function (err, res) {
      Commitments.update(commitmentId, {
        $push: {eventIds: res}
      });
      console.log('added 1 event ID to commitment');
    })
  }
}

if (Meteor.isClient) {

  Meteor.startup(function () {
		
		$('#calendar').fullCalendar({
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			},
      defaultView: 'agendaWeek',
      contentHeight: 600,
      firstHour: 9,
			editable: true,
      events: function(start, end, callback) {
        callback(Events.find().fetch());
      }
		});

		Deps.autorun(function () {
      Events.find();
      $('#calendar').fullCalendar(
        'refetchEvents'
		  );
    });
	});
}
