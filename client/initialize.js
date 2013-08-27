Meteor.subscribe("events");
Meteor.subscribe("commitments");

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
