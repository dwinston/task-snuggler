Template.sleepGuard.events({
  "submit #sleepGuardForm": function(evt, templ){
    evt.preventDefault();
    var sleepTime =templ.find("#sleepTime").value;
    var wakeUpTime = templ.find("#wakeUpTime").value;
    
    Meteor.users.update(
      {_id:Meteor.user()._id}, 
      {$set: {
        "profile.sleepTime":sleepTime,
        "profile.wakeUpTime":wakeUpTime
      }}
    );
 
  }
});

Template.sleepGuard.sleepTime = function(){
  return Meteor.user().profile.sleepTime;
};

Template.sleepGuard.wakeUpTime = function(){
  return Meteor.user().profile.wakeUpTime;
};