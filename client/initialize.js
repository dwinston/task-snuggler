Meteor.subscribe("events");
Meteor.subscribe("commitments");
Session.setDefault("eventGenerationAlgorithm","safeRandomMomentFromNow"); 

var shiftTime = function(t, dayDelta, minuteDelta) {
  return moment(t)
    .add('days',dayDelta)
    .add('minutes', minuteDelta)
    .toDate();
};

Meteor.startup(function () {

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });
  
  $('#calendar').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    defaultView: 'agendaWeek',
    selectable: true,
    selectHelper: true,
    editable: true,
    contentHeight: 600,
    firstHour: 9,

    // Events inserted if clicked on empty slots
    select: function(start, end, allDay) {
      var title = prompt('Event Title:');
      if (title) {
        Events.insert({
          userId: Meteor.userId(),
          commitmentId: 0,
	  title: title,
	  start: start,
	  end: end,
	  allDay: allDay
	});
      }
      calendar.fullCalendar('unselect');
    },

    events: function(start, end, callback) {
      callback(Events.find().fetch());
    },

    // Delete event by clicking on it
    eventClick: function(event, jsEvent, view) {
      if (!event.commitmentId){
        var deleteFlag = confirm
        ('Do you really want to delete the ' + event.title + ' event?');
        if (deleteFlag) Events.remove(event._id);
      }
    },

    // Allow events to be moved in the calendar
    eventDrop: function(event,dayDelta,minuteDelta,allDay,revertFunc) {
      tsnug.updateCommitmentPreferences(event, dayDelta, minuteDelta);
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
