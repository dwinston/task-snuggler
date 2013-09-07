Meteor.subscribe("events");
Meteor.subscribe("commitments");
Session.setDefault("eventGenerationAlgorithm","safeRandomMomentFromNow"); 

plotUpdate = function(){
  var commitment = Commitments.findOne(Session.get("selected_commitment"));
  var prefs = commitment.prefs;
  var prefsKey = _.keys(prefs);
  var plotPrefs = [];
  _.each(prefsKey, function(key){
    var tmpKey = moment().startOf('week').add('hour', key/2);
    var tmpValue = prefs[key];
    plotPrefs.push([tmpKey.toDate().getTime(), tmpValue]);
  });
  $.plot($("#placeholder"), [plotPrefs], 
         {
           xaxis:{
             mode: "time",
	     minTickSize: [1, "day"],
             min:moment().startOf('week').toDate().getTime(), 
             max:moment().endOf('week').toDate().getTime()
           },
           yaxis:{
             minTickSize: 1
           },
           series: {
	     bars: {
	       show: true,
	     }
	   }
         });
}

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
	  allDay: allDay, 
          lastUpdated: moment()
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
      plotUpdate();
      Events.remove(event._id);
      event.lastUpdated=moment();
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

Template.copyright.yearOfProduction = function(){
  return moment().year();
};