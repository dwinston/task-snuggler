Meteor.subscribe("events");
Meteor.subscribe("commitments");

var shiftTime = function(t, dayDelta, minuteDelta) {
  return moment(t)
    .add('days',dayDelta)
    .add('minutes', minuteDelta)
    .toDate();
};

Meteor.startup(function () {
	
	$('#calendar').fullCalendar({
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
    defaultView: 'agendaWeek',
    selectable: true,
    selectHelper: true,
    select: function(start, end, allDay) {
			var title = prompt('Event Title:');
			if (title) {
        Events.insert({
          userId: Meteor.userId(),
					title: title,
					start: start,
					end: end,
					allDay: allDay
				});
			}
			calendar.fullCalendar('unselect');
		},
    contentHeight: 600,
    firstHour: 9,
		editable: true,
    events: function(start, end, callback) {
      callback(Events.find().fetch());
    },
    eventDrop: function(event,dayDelta,minuteDelta,allDay,revertFunc) {
      Events.remove(event._id);
      Events.insert(event);
    }
	});

	Deps.autorun(function () {
    Events.find();
    $('#calendar').fullCalendar(
      'refetchEvents'
		);
  });
});
