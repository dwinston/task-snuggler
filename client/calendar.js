Template.calendar.rendered = function(){
  var user = Meteor.user();
  if (user) startFullCalendar();
  if (user && user.services && user.services.google){
    //refreshGCalEvents();
    GCalSync.setEvents(Events);
    GCalSync.setCalendars(Commitments);
    GCalSync.setAuth(Meteor.user().services.google);
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
  var user = Meteor.user();
  if (user && user.services && user.services.google){
    //refreshGCalEvents();
  }
}
