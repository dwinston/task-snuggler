Events = new Meteor.Collection("events");
Commitments = new Meteor.Collection("commitments");

generateEvents = function (commitmentId) {
  var commitment = Commitments.findOne(commitmentId);
  for (var s=0; s < commitment.numSessions; s++) {
    var startsAt = tsnug.safeRandomMomentFromNow(commitment.hoursPerSession);
    Events.insert({
      userId: commitment.userId,
      type: 'commitment',
      title: commitment.title + ' #' + (s+1),
      start: startsAt.toDate(),
      end: moment(startsAt).add('hours', commitment.hoursPerSession).toDate(),
      allDay: false
    }, function (err, res) {
      Commitments.update(commitmentId, {
        $push: {eventIds: res}});
    });
  }
}
