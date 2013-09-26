Template.instruction.isGoogleUser = function(){
  console.log(Meteor.user());
  if (Meteor.user()){
    if (Meteor.user().services.google) return true;
  }
  return false;
}