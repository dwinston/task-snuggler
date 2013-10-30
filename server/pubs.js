Meteor.publish("events", function () {
  return Events.find({userId: this.userId});
});
Meteor.publish("commitments", function () {
  return Commitments.find({userId: this.userId});
});
Meteor.publish("userData", function () {
  return Meteor.users.find({_id: this.userId},
                           {fields: {'services': 1}});
});
