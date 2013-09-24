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
  if (algorithm.slice(-13) === "MomentFromNow") {
    var startsAt;
    _.times(commitment.numSessions, function () {
      startsAt = fn(commitment.hoursPerSession);
      insertCommitmentEvent(commitment, startsAt);
    });
  } else if (algorithm.slice(-14) === "MomentsFromNow") {
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
  }  
}
