Events = new Meteor.Collection("events");
Commitments = new Meteor.Collection("commitments");

var randomMomentFromNow = function(MM) {
  var min = moment().startOf('hour').add('hours', 1);
  var max = moment(min).endOf('week');
  var hoursToGo = max.diff(min, 'hours');
  var offset = _.random(hoursToGo);
  return moment(min).
    hour(min.hour() + offset).
    subtract('minutes', _.first(_.shuffle([0, 30])));
};

generateEvents = function (commitmentId) {

  console.log('generating events for commitment ' + commitmentId);

  var commitment = Commitments.findOne(commitmentId);
  for (var s=0; s < commitment.numSessions; s++) {
    var startsAt = randomMomentFromNow();
    Events.insert({
      title: commitment.title + ' #' + (s+1),
      start: startsAt.toDate(),
      end: moment(startsAt).add('hours', commitment.hoursPerSession).toDate(),
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
