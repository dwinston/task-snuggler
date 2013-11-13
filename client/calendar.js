Template.calendar.isGoogleUser = function(){
  return Meteor.user() && 
    Meteor.user().services && 
    Meteor.user().services.google;
}

Template.calendar.rendered = function(){
  var user = Meteor.user();
  if (user) startFullCalendar();
  if (user && user.services && user.services.google){
    GCalSync.setEvents(Events);
    GCalSync.setCalendars(Commitments);
    GCalSync.setAuth(Meteor.user().services.google);
    GCalSync.refresh(moment().startOf('week'));
  }
}

Template.calendar.currentViewWeek = function(){
  var cView = $('#calendar').fullCalendar('getView');
  var startOfWeek = moment(cView.start).startOf('week');
  var endOfWeek = moment(startOfWeek).endOf('week');
  return startOfWeek.format("D, MMM")+' - '+endOfWeek.format("D, MMM");
}

Template.calendar.events({
  'click #todayBtn': function(evt, templ){
    $('#calendar').fullCalendar('today');    
    refetchEvents();
  }, 
  'click #previousWeekBtn': function(evt, templ){
    $('#calendar').fullCalendar('prev');
    refetchEvents();
  },
  'click #nextWeekBtn': function(evt, templ){
    $('#calendar').fullCalendar('next');
    refetchEvents();
  }
});

var refetchEvents = function(){
  var cView = $('#calendar').fullCalendar('getView');
  var startOfWeek = moment(cView.start).startOf('week');

  var user = Meteor.user();
  if (user && user.services && user.services.google){
    GCalSync.refresh(startOfWeek.toDate());
  }
}
