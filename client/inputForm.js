Template.inputForm.events({
  "submit #inputForm": function (evt, templ) {
    evt.preventDefault();
    var title = templ.find("#title").value;
    var numSessions = +templ.find("#numSessions").value;
    var hoursPerSession = +templ.find("#hoursPerSession").value;
    
    if (Session.equals("selected_commitment", "new_commitment")){
      Commitments.insert(
        {
          userId: Meteor.userId(),
          numSessions: numSessions,
          hoursPerSession: hoursPerSession,
          title: title,
          eventIds: []
        }, 
        function (err, commitmentId) {
          if (err) { 
            alert(err + ". Are you signed in?");
          } else {
            generateEvents(commitmentId);
          };
        });     
    }
    else{
      var commitment = Commitments.findOne(Session.get("selected_commitment"));
      _.each(commitment.eventIds, function(id){
        Events.remove(id);
      });
      Commitments.update(commitment._id,
                         { $set: 
                           {
                             'title': title,
                             'numSessions': numSessions,
                             'hoursPerSession': hoursPerSession,
                             'eventIds': []
                           },
                         });
      generateEvents(commitment._id);
    }
  },

  "reset #inputForm": function (evt, tmpl){
    var commitment = Commitments.findOne(Session.get("selected_commitment"));
    _.each(commitment.eventIds, function(id){
      Events.remove(id);
    });
    Commitments.remove(commitment._id);
  }
});
