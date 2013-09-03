Template.dashboard.commitments = function () {
  return Commitments.find({}, {sort: {title: -1}});
};

Template.commitment.events({
  'click': function () {
    Session.set("selected_commitment", this._id);
  }
});

Template.commitment.selected = function () {
  return Session.equals("selected_commitment", this._id) ? "selected" : '';
};

Template.dashboard.commitmentDetails = function() {
  var tmp = Commitments.findOne(Session.get("selected_commitment"));
  return tmp && 
    _.map(tmp.eventIds, function(id) {
      var evt = Events.findOne(id);
      return evt;
    });
};

Template.dashboard.events({
  "click #removeCommitment": function (evt, templ){
    var commitment = Commitments.findOne(Session.get("selected_commitment"));
    _.each(commitment.eventIds, function(id){
      Events.remove(id);
    });
    Commitments.remove(commitment._id);
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
        if (!err) { generateEvents(commitment._id); }
      }
    );
  }
});
