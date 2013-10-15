calendarList = [];
getCalendarList = refreshEvents = getEvents = insertAppEvent = function () {};
Session.setDefault('GCalSync.wantsRefresh', true);


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
        Session.set('GCalSync.hasCalendarList', true);
      }
    });
};

refreshEvents = function () {
  var now = moment().toDate();
  appEvents.find({
    gCalEvent: true, lastUpdated: {$lt: now}
  }).forEach(function (gCalEvent) {
    appEvents.remove(gCalEvent._id);
  });
  getEvents();
};

getEvents = function (calendar) {
  if (arguments.length === 0) {
    _.forEach(calendarList, function (c) { getEvents(c); });
    return;
  }
  var appCal = appCalendars.findOne({gCalId: calendar.id});
  if (appCal) {
    // App manages this calendar. Do not override with
    // event modififications made in Google Calendar.
    return;
  }

  // Only fetch events that would display in the current calendar view.
  var cView = $('#calendar').fullCalendar('getView');
  var startOfWeek = moment(cView.start).startOf('week');
  var endOfWeek = moment(startOfWeek).endOf('week');

  HTTP.get(
    gCalAPIprefix + "/calendars/"+calendar.id+"/events",
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
        _.forEach(result.data.items, insertAppEvent);
      } else {
        console.log("could not fetch events for " + calendar.id);
      }
    });
};

insertAppEvent = function (event) {
  appEvent = {
    gCalEvent: true,
    userId: Meteor.userId(), 
    title: event.summary, 
    start: new Date(event.start.dateTime), 
    end: new Date(event.end.dateTime), 
    allDay: false, 
    lastUpdated: moment().toDate(),
    editable: false
  };
  appEvent[appEventHasOne] = 0; // e.g. event["commitmentId"] = 0
  appEvents.insert(appEvent);
};
