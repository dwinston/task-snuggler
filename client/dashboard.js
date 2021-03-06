// Template dashboard
Template.dashboard.commitments = function () {
  return Commitments.find({}, {sort: {title: -1}});
};

Template.dashboard.events({
  "click #removeCommitment": function (evt, templ){
    evt.preventDefault();
    var commitment = Commitments.findOne(Session.get("selected_commitment"));
    if (!confirm("Really delete your commitment: \""+commitment.title+"\"?")) { 
      return;
    }
    _.each(commitment.eventIds, function(id){
      Events.remove(id);
    });
    $('#placeholder').html('');
    Commitments.remove(commitment._id);
    Session.set("selected_commitment", ""); // Avoid error with deps.autorun
  },
  "submit #editCommitment": function (evt, templ) {
    evt.preventDefault();
    var commitment = Commitments.findOne(Session.get("selected_commitment"));
    var pastEvents = [];
    _.each(commitment.eventIds, function(id){
      var event = Events.findOne({_id:id});
      if (!moment(event.start).isBefore(moment())) {
        Events.remove(id);
      }
      else {
        pastEvents.push(id);
      }
    });
    Commitments.update(
      commitment._id, 
      {$set: 
       {
         title: templ.find("#titleToEdit").value,
         numSessions: +templ.find("#numSessionsToEdit").value,
         hoursPerSession: +templ.find("#hoursPerSessionToEdit").value,
         eventIds: pastEvents
       }
      }, function (err) {
        if (!err) { 
          generateEvents(commitment._id, 
                         Session.get("eventGenerationAlgorithm"),
                         pastEvents.length
                        ); 
        }
      }
    );
    Session.set("selected_commitment", "");
    $('#placeholder').html('');
  }
});

// Template: commitment
Template.commitment.commitmentEvents = function () {
  return Events.find({commitmentId: this._id}, {sort: {start:1}});
};

Template.commitment.selected = function () {
  return Session.equals("selected_commitment", this._id) ? "selected" : '';
};

Template.commitment.events({
  'dblclick': function () {
    Session.set("selected_commitment", this._id);
    //plotUpdate(Session.get("selected_commitment"));    
  },
  'click #editCommitmentBtn': function(){
    Session.set("selected_commitment", this._id);
  },
  'submit #refreshCommitment': function(evt, templ){
    evt.preventDefault();
    var commitment = Commitments.findOne({_id:this._id});
    var pastEvents = [];
    _.each(commitment.eventIds, function(id){
      var event = Events.findOne({_id:id});
      var checkedEvent = +templ.find("#"+id).checked;
      console.log(checkedEvent);
      if (checkedEvent){ 
        // Generate events according to the chekced boxes
        pastEvents.push(id);
      }
      else{
        Events.remove(id);
      }
    });
    console.log(pastEvents);
    Commitments.update(
      commitment._id, 
      {$set: 
       {
         eventIds: pastEvents
       }
      }, function (err) {
        if (!err) { 
          generateEvents(commitment._id, 
                         Session.get("eventGenerationAlgorithm"),
                         pastEvents.length
                        ); 
        }
      }
    );
  }
});

Template.commitmentCheckBox.checked = function () {
  // Todo: make this update synchronize with the 
  // calendar view
  var event = Events.findOne({_id:this._id});
  if (event){ // Avoid Deps Autorun Error
    var eventStartMoment = moment(event.start);
    if (eventStartMoment.isBefore(moment())){
      // Commitment event has past
      // Do not allocate
      return "checked";
    }
    else {
      return "";
    }
  }
};
