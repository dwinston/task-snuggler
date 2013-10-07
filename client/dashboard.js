Template.dashboard.commitments = function () {
  return Commitments.find({}, {sort: {title: -1}});
};

Template.commitment.events({
  'click': function () {
    Session.set("selected_commitment", this._id);
    plotUpdate(Session.get("selected_commitment"));    
  }
});

Template.commitment.selected = function () {
  return Session.equals("selected_commitment", this._id) ? "selected" : '';
};

Template.dashboard.events({
  "click #removeCommitment": function (evt, templ){
    evt.preventDefault();
    var commitment = Commitments.findOne(Session.get("selected_commitment"));
    _.each(commitment.eventIds, function(id){
      Events.remove(id);
    });
    $('#placeholder').html('');
    var user = Meteor.user();
    if (user && user.services && user.services.google){
      deleteCalendarFromGCal(commitment);
    }
    Commitments.remove(commitment._id);
    Session.set("selected_commitment", ""); // Avoid error with deps.autorun
  },
  "submit #editCommitment": function (evt, templ) {
    evt.preventDefault();
    var commitment = Commitments.findOne(Session.get("selected_commitment"));
    _.each(commitment.eventIds, function(id){
      Events.remove(id);
    });
    Commitments.update(
      commitment._id, 
      {$set: 
       {
         title: templ.find("#titleToEdit").value,
         numSessions: +templ.find("#numSessionsToEdit").value,
         hoursPerSession: +templ.find("#hoursPerSessionToEdit").value,
         eventIds: []
       }
      }, function (err) {
        if (!err) { 
          generateEvents(commitment._id, 
                         Session.get("eventGenerationAlgorithm")); 
        }
      }
    );
  }
});
