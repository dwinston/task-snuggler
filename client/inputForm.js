Template.inputForm.events({
  "submit #addCommitment": function (evt, templ) {
    evt.preventDefault();
    var title = templ.find("#title").value;
    var numSessions = +templ.find("#numSessions").value;
    var hoursPerSession = +templ.find("#hoursPerSession").value;
    
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    Commitments.insert(
      {
        userId: Meteor.userId(),
        numSessions: numSessions,
        hoursPerSession: hoursPerSession,
        title: title,
        eventIds: [],
        prefs: {},
        color: color
      }, 
      function (err, commitmentId) {
        if (err) { 
          alert(err + ". Are you signed in?");
        } else {
          generateEvents(commitmentId,
                         Session.get("eventGenerationAlgorithm"),
                         0
                        );
        };
      }
    );
  }
});
