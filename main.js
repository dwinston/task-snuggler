Events = new Meteor.Collection("events");
Commitments = new Meteor.Collection("commitments");

var insertCommitmentEvent = function (commitment, startsAt) {
  Events.insert({
    userId: commitment.userId,
    commitmentId: commitment._id,
    title: commitment.title,
    start: startsAt.toDate(),
    end: moment(startsAt).add('hours', commitment.hoursPerSession).toDate(),
    allDay: false,
    lastUpdated: moment().toDate()
  }, function (err, res) {
    Commitments.update(commitment._id, {
      $push: {eventIds: res}});
  });
};

generateEvents = function (commitmentId, algorithm) {
  var commitment = Commitments.findOne(commitmentId);
  var fn = tsnug[algorithm];
  var startsAts = fn(commitment);
  if (_.isEmpty(startsAts)) {
    if (Meteor.isClient) {
      alert("There isn't enough non-conflicting time for this commitment.");
    } else {
      console.log("There isn't enough non-conflicting time " + 
                  "for this commitment.");
    }
  } else {
    _.each(startsAts, function (startsAt) {
      insertCommitmentEvent(commitment, startsAt);
    });
  }  
};
