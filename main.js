Commitments = new Meteor.Collection("commitments");
Events = new Meteor.Collection("events");

var insertCommitmentEvent = function (commitment, startsAt) {
  Events.insert({
    backgroundColor: '#FF0000',
    eventBackgroundColor: '#FF0000',
    userId: commitment.userId,
    commitmentId: commitment._id,
    title: commitment.title,
    start: startsAt.toDate(),
    end: moment(startsAt).add('hours', commitment.hoursPerSession).toDate(),
    allDay: false,
    lastUpdated: moment().toDate(),
    color: commitment.color, 
  }, function (err, res) {
    Commitments.update(commitment._id, {
      $push: {eventIds: res}});
  });
};

generateEvents = function (commitmentId, algorithm, numPastEvents) {
  var commitment = Commitments.findOne(commitmentId);
  var fn = tsnug[algorithm];
  // Past events are not allocated
  numPastEvents = numPastEvents || 0;
  // Users sleep time is unavailble for allocation
  // The call of Meteor.user() has an async error on server initialization
  var userProfile = Meteor.user().profile; 
  var guardTime  = [userProfile.sleepTime, userProfile.wakeUpTime];
  var startsAts = fn(commitment, numPastEvents, guardTime);
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
