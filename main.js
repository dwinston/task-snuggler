Events = new Meteor.Collection("events");
Commitments = new Meteor.Collection("commitments");

var randomDate = function(start, end) {
  return new Date(start.getTime() + 
                  Math.random() * (end.getTime() - start.getTime()));
};

generateEvents = function (commitmentId) {
  var now = new Date();
	var d = now.getDate();
	var m = now.getMonth();
	var y = now.getFullYear();

  console.log('generating events for commitment ' + commitmentId);

  var commitment = Commitments.findOne(commitmentId);
  for (var s=0; s < commitment.numSessions; s++) {
    var endsLatest = new Date(y,m,d+3);
    var startsAt = randomDate(now, endsLatest);
    Events.insert({
      title: commitment.title + ' #' + (s+1),
      start: startsAt,
      end: new Date(startsAt.getTime() + 
                    1000 * 60 * 60 * commitment.hoursPerSession),
      allDay: false
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
