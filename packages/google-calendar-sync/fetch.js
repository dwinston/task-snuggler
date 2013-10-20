getCalendarList = refreshEvents = getEvents = insertAppEvent = function () {};
Session.setDefault('GCalSync.wantsRefresh', true);

// tsnug TODO: minimize no. of session varialbes used

Deps.autorun(function () {
  if (Session.get('GCalSync.authorized')) {
    getCalendarList();
  }
});

Deps.autorun(function () {
  if (Session.get('GCalSync.hasCalendarList') &&
      Session.get('GCalSync.wantsRefresh')) {
    refreshEvents();
    Session.set('GCalSync.wantsRefresh', false);
  }
});

getCalendarList = function () {
  HTTP.get(
    gCalAPIprefix + "/users/me/calendarList",
    {headers: authHeader},
    function (error, result) {
      if (result.statusCode === 200) {
        calendarList = _.filter(result.data.items, function (c) {
          return c.selected && (c.summary !== "Weather");
        });
        // Insert calendars to GCal collections
        _.each(calendarList, function(c){
          GCalCalendars.insert({
            gCalId: c.id,
            title: c.summary,
          });
        });
        Session.set('GCalSync.hasCalendarList', true);
      }
    });
};

refreshEvents = function(){
  // Remove all events from database and refetch
  GCalEvents.remove({});
  getEvents();
}

getEvents = function (calendar) {
  if (arguments.length === 0) {
    calendarCursor = GCalCalendars.find({});
    calendarCursor.forEach(function (c) { getEvents(c); });
    return;
  }

  // Only fetch events that would display in the current calendar view.
  // tsnug: todo, this should happen inside tsnug instead inside the package
  // ************
  var cView = $('#calendar').fullCalendar('getView');
  var startOfWeek = moment(cView.start).startOf('week');
  var endOfWeek = moment(startOfWeek).endOf('week');
  // ************

  console.log(calendar);
  HTTP.get(
    gCalAPIprefix + "/calendars/"+calendar.gCalId+"/events",
    {
      headers: authHeader,
      params: {
        singleEvents: true,
        orderBy: "startTime",
        timeMin: startOfWeek.format("YYYY-MM-DDTHH:mm:ssZ"),
        timeMax: endOfWeek.format("YYYY-MM-DDTHH:mm:ssZ")
      }
    },
    function (error, result) {
      if (result.statusCode === 200) {
        console.log(calendar);
        _.forEach(result.data.items, function(event){
          GCalEvents.insert({
            title: event.summary, 
            start: new Date(event.start.dateTime), 
            end: new Date(event.end.dateTime)
          });
        });
      } else {
        console.log("could not fetch events for " + calendar.title);
      }
    });
};