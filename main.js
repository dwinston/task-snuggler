Events = new Meteor.Collection("events");
Commitments = new Meteor.Collection("commitments");

generateEvents = function (commitmentId) {
  var commitment = Commitments.findOne(commitmentId);
  for (var s=0; s < commitment.numSessions; s++) {
    var startsAt = tsnug.safeRandomMomentFromNow(commitment.hoursPerSession);
    Events.insert({
      title: commitment.title + ' #' + (s+1),
      start: startsAt.toDate(),
      end: moment(startsAt).add('hours', commitment.hoursPerSession).toDate(),
      allDay: false
    }, function (err, res) {
      Commitments.update(commitmentId, {
        $push: {eventIds: res}});
    });
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
