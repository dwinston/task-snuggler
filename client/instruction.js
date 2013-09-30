Template.instruction.isGoogleUser = function(){
  if (Meteor.user()){
    if (Meteor.user().services.google) return true;
  }
  return false;
}