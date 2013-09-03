Meteor.publish("events", function () {
  return Events.find({userId: this.userId});
});
Meteor.publish("commitments", function () {
  return Commitments.find({userId: this.userId});
});
