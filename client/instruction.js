Template.instruction.isGoogleUser = function(){
  return Meteor.user() && 
    Meteor.user().services && 
    Meteor.user().services.google;
}
