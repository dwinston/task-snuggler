Template.dashboard.commitments = function () {
  return Commitments.find({}, {sort: {title: -1}});
};

Template.commitment.events({
  'click': function () {
    Session.set("selected_commitment", this._id);
    $('#title').val(this.title);
    $('#numSessions').val(this.numSessions);
    $('#hoursPerSession').val(this.hoursPerSession);
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
  "click #newCommitment": function(evt){
    Session.set("selected_commitment", "new_commitment");
  }
});