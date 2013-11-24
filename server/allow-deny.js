// Allow a user to create/update/remove her own documents

Meteor.startup(function() {
  Commitments.allow({
    insert: function (userId, doc) {
      return (userId && doc.userId === userId);
    },
    update: function (userId, doc, fieldNames, modifier) {
      return (userId && doc.userId === userId);
    },
    remove: function (userId, doc) {
      return (userId && doc.userId === userId);
    }
  });

  Events.allow({
    insert: function (userId, doc) {
      return (userId && doc.userId === userId);
    },
    update: function (userId, doc, fieldNames, modifier) {
      return (userId && doc.userId === userId);
    },
    remove: function (userId, doc) {
      return (userId && doc.userId === userId);
    }
  });

});
