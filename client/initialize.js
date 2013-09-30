Meteor.subscribe("events");
Meteor.subscribe("commitments");
Meteor.subscribe("userData");
Session.setDefault("eventGenerationAlgorithm","learnedMomentsFromNow"); 
Session.setDefault("scratchTime", 10); // seconds before new pref persists

plotUpdate = function(CommitmentId){
  var commitment = Commitments.findOne(CommitmentId);
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
    requestPermissions: {
      google: ['openid','email',
               'https://www.googleapis.com/auth/calendar.readonly']
    },
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
      if(Meteor.user().services.google){
        alert('Please go back to GCal to edit your one-off events');
        return;
      };
      var title = prompt('Event Title:');
      if (title) {
        Events.insert({
          userId: Meteor.userId(),
          commitmentId: 0,
	  title: title,
	  start: start,
	  end: end,
	  allDay: allDay,
          gCalEvent: fasle
	});
      }
    },
    
    events: function(start, end, callback) {
      callback(Events.find().fetch());
    },

    // Delete event by clicking on it
    eventClick: function(event, jsEvent, view) {
      if (!event.commitmentId && !event.gCalEvent){
        var deleteFlag = confirm
        ('Do you really want to delete the ' + event.title + ' event?');
        if (deleteFlag) Events.remove(event._id);
      }
    },

    // Allow events to be moved in the calendar
    eventDrop: function(event,dayDelta,minuteDelta,allDay,revertFunc) {
      if (event.commitmentId){
        tsnug.updateCommitmentPreferences(event, dayDelta, minuteDelta);
        Session.set("selected_commitment", event.commitmentId);   
        plotUpdate(event.commitmentId);
      }
      Events.remove(event._id);
      event.lastUpdated = moment().toDate();
      Events.insert(event);
    }
  });
  
  Deps.autorun(function () {
    Events.find();
    $('#calendar').fullCalendar(
      'refetchEvents'
    );
  })
});

Template.copyright.yearOfProduction = function(){
  return moment().year();
};
