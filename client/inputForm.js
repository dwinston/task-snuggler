Template.inputForm.events({
  "submit #addCommitment": function (evt, templ) {
    evt.preventDefault();
    var title = templ.find("#title").value;
    var numSessions = +templ.find("#numSessions").value;
    var hoursPerSession = +templ.find("#hoursPerSession").value;
    
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
      }
    );     
  }
});
