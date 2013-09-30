Template.mainPage.alreadyLogin = function(){
  if (Meteor.user()) return true;
  else return false;
}