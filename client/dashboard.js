Template.dashboard.helpers({
  events: function () {
    var changed = Session.get("eventsChanged");
    return events;
  }
});
