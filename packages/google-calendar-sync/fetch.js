calendarList = [];
curDate = Date(); // Current week view
getCalendarList = refreshEvents = getEvents = insertAppEvent = function () {};

getCalendarList = function () {
  //console.log("In getCalendarList");
  HTTP.get(
    gCalAPIprefix + "/users/me/calendarList",
    {headers: authHeader},
    function (error, result) {
      if (result.statusCode === 200) {
        calendarList = _.filter(result.data.items, function (c) {
          return c.selected && (c.summary !== "Weather");
        });
        refreshEvents();
      }
    });
};

// Todo: avoid refetching events if it is already fetched once
// Currently, it is fetched whenever the user changes view

refreshEvents = function () {
  //console.log("In refreshEvents");
  var now = moment().toDate();
  appEvents.find({
    gCalEvent: true, 
    // Todo: is lastUpdated field still necessary?
    lastUpdated: {$lt: now}
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
    // i.e. do not fetch commitment events
    return;
  }

  var startOfWeek = moment(curDate).startOf('week');
  var endOfWeek = moment(curDate).endOf('week');

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
        _.forEach(result.data.items, function(event){
          insertAppEvent(event);
        });
      } else {
        console.log("could not fetch events for " + calendar.title);
      }
    });
};

var insertAppEvent = function(event){
  // Todo: synchronize the google calendar coloring 
  // with the color in task snuggler
  appEvent = {
    // google calendar events are recognized by this fied
    gCalEvent: true, 
    userId: Meteor.userId(), 
    title: event.summary, 
    start: new Date(event.start.dateTime), 
    end: new Date(event.end.dateTime), 
    allDay: false, 
    commitmentId: 0,
    // Todo: is lastUpdated field still necessary?
    lastUpdated: moment().toDate(),
    editable: false
  };
  appEvents.insert(appEvent);
}