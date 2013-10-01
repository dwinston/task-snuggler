Template.calendar.rendered = function(){
  var user = Meteor.user();
  if (user) startFullCalendar();
  if (user && user.services && user.services.google){
    refreshGCalEvents();
  }
}