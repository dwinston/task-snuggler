(function () {

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/google-calendar-sync/initialize.js                                 //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
authHeader = null;                                                             // 1
gCalAPIprefix =  "https://www.googleapis.com/calendar/v3";                     // 2
appEvents = (typeof Events === "undefined") ? null : Events;                   // 3
appCalendars = (typeof Calendars == "undefined") ? null : Calendars;           // 4
                                                                               // 5
// Options for specifying the relationship between the application's           // 6
// event and calendar collections.                                             // 7
appCalendarHasMany = "eventIds";                                               // 8
appEventHasOne     = "calendarId";                                             // 9
                                                                               // 10
GCalSync = {                                                                   // 11
  // Input: a Meteor.user().services.google object that has                    // 12
  //   an accessToken property.                                                // 13
  setAuth: function (googAuth) {                                               // 14
    var auth = 'Bearer ' + googAuth.accessToken;                               // 15
    authHeader = {'Authorization': auth};                                      // 16
    // tsnugTODO: use googAuth.expiresAt to prompt user to reauthenticate.     // 17
    Session.set('GCalSync.authorized', true);                                  // 18
  },                                                                           // 19
                                                                               // 20
  setEvents: function (meteorCollection) {                                     // 21
    appEvents = meteorCollection;                                              // 22
  },                                                                           // 23
                                                                               // 24
  // Input: the Meteor.Collection to use, and options that specify             // 25
  // what enumerates its event ids (default 'eventIds') and                    // 26
  // the name of the foreign key in appEvents that refers to its calendar      // 27
  // ('commitmentId' in Task Snuggler).                                        // 28
  setCalendars: function (meteorCollection, options) {                         // 29
    appCalendarHasMany = options.eventIds || "eventIds";                       // 30
    appEventHasOne = options.eventForeignKey || "calendarId";                  // 31
    appCalendars = meteorCollection;                                           // 32
  }                                                                            // 33
};                                                                             // 34
                                                                               // 35
/////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/google-calendar-sync/fetch.js                                      //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
calendarList = [];                                                             // 1
getCalendarList = refreshEvents = getEvents = insertAppEvent = function () {}; // 2
Session.setDefault('GCalSync.wantsRefresh', true);                             // 3
                                                                               // 4
                                                                               // 5
Deps.autorun(function () {                                                     // 6
  if (Session.get('GCalSync.authorized')) {                                    // 7
    getCalendarList();                                                         // 8
  }                                                                            // 9
});                                                                            // 10
                                                                               // 11
Deps.autorun(function () {                                                     // 12
  if (Session.get('GCalSync.hasCalendarList') &&                               // 13
      Session.get('GCalSync.wantsRefresh')) {                                  // 14
    refreshEvents();                                                           // 15
    Session.set('GCalSync.wantsRefresh', false);                               // 16
  }                                                                            // 17
});                                                                            // 18
                                                                               // 19
getCalendarList = function () {                                                // 20
  HTTP.get(                                                                    // 21
    gCalAPIprefix + "/users/me/calendarList",                                  // 22
    {headers: authHeader},                                                     // 23
    function (error, result) {                                                 // 24
      if (result.statusCode === 200) {                                         // 25
        calendarList = _.filter(result.data.items, function (c) {              // 26
          return c.selected && (c.summary !== "Weather");                      // 27
        });                                                                    // 28
        Session.set('GCalSync.hasCalendarList', true);                         // 29
      }                                                                        // 30
    });                                                                        // 31
};                                                                             // 32
                                                                               // 33
refreshEvents = function () {                                                  // 34
  var now = moment().toDate();                                                 // 35
  appEvents.find({                                                             // 36
    gCalEvent: true, lastUpdated: {$lt: now}                                   // 37
  }).forEach(function (gCalEvent) {                                            // 38
    appEvents.remove(gCalEvent._id);                                           // 39
  });                                                                          // 40
  getEvents();                                                                 // 41
};                                                                             // 42
                                                                               // 43
getEvents = function (calendar) {                                              // 44
  if (arguments.length === 0) {                                                // 45
    _.forEach(calendarList, function (c) { getEvents(c); });                   // 46
    return;                                                                    // 47
  }                                                                            // 48
  var appCal = appCalendars.findOne({gCalId: calendar.id});                    // 49
  if (appCal) {                                                                // 50
    // App manages this calendar. Do not override with                         // 51
    // event modififications made in Google Calendar.                          // 52
    return;                                                                    // 53
  }                                                                            // 54
                                                                               // 55
  // Only fetch events that would display in the current calendar view.        // 56
  var cView = $('#calendar').fullCalendar('getView');                          // 57
  var startOfWeek = moment(cView.start).startOf('week');                       // 58
  var endOfWeek = moment(startOfWeek).endOf('week');                           // 59
                                                                               // 60
  HTTP.get(                                                                    // 61
    gCalAPIprefix + "/calendars/"+calendar.id+"/events",                       // 62
    {                                                                          // 63
      headers: authHeader,                                                     // 64
      params: {                                                                // 65
        singleEvents: true,                                                    // 66
        orderBy: "startTime",                                                  // 67
        timeMin: startOfWeek.format("YYYY-MM-DDTHH:mm:ssZ"),                   // 68
        timeMax: endOfWeek.format("YYYY-MM-DDTHH:mm:ssZ")                      // 69
      }                                                                        // 70
    },                                                                         // 71
    function (error, result) {                                                 // 72
      if (result.statusCode === 200) {                                         // 73
        _.forEach(result.data.items, insertAppEvent);                          // 74
      } else {                                                                 // 75
        console.log("could not fetch events for " + calendar.id);              // 76
      }                                                                        // 77
    });                                                                        // 78
};                                                                             // 79
                                                                               // 80
insertAppEvent = function (event) {                                            // 81
  appEvent = {                                                                 // 82
    gCalEvent: true,                                                           // 83
    userId: Meteor.userId(),                                                   // 84
    title: event.summary,                                                      // 85
    start: new Date(event.start.dateTime),                                     // 86
    end: new Date(event.end.dateTime),                                         // 87
    allDay: false,                                                             // 88
    lastUpdated: moment().toDate(),                                            // 89
    editable: false                                                            // 90
  };                                                                           // 91
  appEvent[appEventHasOne] = 0; // e.g. event["commitmentId"] = 0              // 92
  appEvents.insert(appEvent);                                                  // 93
};                                                                             // 94
                                                                               // 95
/////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/google-calendar-sync/insert.js                                     //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
Deps.autorun(function () {                                                     // 1
  appCalendars && appCalendars.find().observeChanges({                         // 2
    added: function (id, calendar) {                                           // 3
      insertCalendar(appId, calendar);                                         // 4
    }                                                                          // 5
  });                                                                          // 6
});                                                                            // 7
                                                                               // 8
Deps.autorun(function () {                                                     // 9
  var added = Session.get('GCalSync.calendarAdded');                           // 10
  if (!added) return;                                                          // 11
  // tsnugTODO: I don't like that this package reaches into the app's          // 12
  // calendars collection and stores a reference to the app calendar's         // 13
  // corresponding Google calendar. A polite Meteor package shouldn't          // 14
  // do that. One option around this is to prefix                              // 15
  // all inserted Google calendars so as to be easily connected to the         // 16
  // database, e.g. the Google calendar summary "tsnug: jogging" corresponds   // 17
  // to appCalendars.findOne({title: 'jogging'})                               // 18
  appCalendars.update(added.appId, {$set: {gCalId: added.calendar.id}});       // 19
});                                                                            // 20
                                                                               // 21
Deps.autorun(function () {                                                     // 22
  appEvents && appEvents.find({gCalEvent: {$ne: true}}).observeChanges({       // 23
    added: function (id, event) {                                              // 24
    }                                                                          // 25
  });                                                                          // 26
});                                                                            // 27
                                                                               // 28
insertEvent = function(event, calendarId){                                     // 29
  HTTP.post(                                                                   // 30
    gcalAPIprefix + "/calendars/"+calendarId+"/events",                        // 31
    {                                                                          // 32
      headers: authHeader,                                                     // 33
      data: {                                                                  // 34
        summary: event.title, // perhaps change to "tsnug: " + event.title     // 35
        start: {dateTime: moment(event.start).format("YYYY-MM-DDTHH:mm:ssZ")}, // 36
        end: {dateTime: moment(event.end).format("YYYY-MM-DDTHH:mm:ssZ")}      // 37
      }                                                                        // 38
    },                                                                         // 39
    insertCallBack);                                                           // 40
};                                                                             // 41
                                                                               // 42
insertCalendar = function(appId, calendar){                                    // 43
  HTTP.post(                                                                   // 44
    gcalAPIprefix + "/calendars",                                              // 45
    {                                                                          // 46
      headers: authHeader,                                                     // 47
      data: {summary: calendar.title}                                          // 48
    },                                                                         // 49
    function (error, result) {                                                 // 50
      if (result.statusCode === 200) {                                         // 51
        Session.set("GCalSync.calendarAdded",                                  // 52
                    {appId: appId, calendar: result.data});                    // 53
      }                                                                        // 54
    });                                                                        // 55
};                                                                             // 56
                                                                               // 57
var insertCallBack = function(error, result){                                  // 58
  if (result.statusCode != 200) console.log('GCalSync: insert failed');        // 59
};                                                                             // 60
                                                                               // 61
/////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/google-calendar-sync/update.js                                     //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
updateEvent = function (calendarId, event){                                    // 1
  HTTP.put(                                                                    // 2
    gcalAPIprefix + "/calendars/" + calendarId + "/events/" + event.gCalId,    // 3
    {                                                                          // 4
      headers: authHeader,                                                     // 5
      data: {                                                                  // 6
        summary: event.title,                                                  // 7
        start: event.start,                                                    // 8
        end: event.end                                                         // 9
      }                                                                        // 10
    },                                                                         // 11
    updateCallBack                                                             // 12
  );                                                                           // 13
};                                                                             // 14
                                                                               // 15
updateCalendar = function(calendar){                                           // 16
  HTTP.put(                                                                    // 17
    gcalAPIprefix + "/calendars/" + calendarId,                                // 18
    {                                                                          // 19
      headers: authHeader,                                                     // 20
      data: {                                                                  // 21
        summary: calendar.title                                                // 22
      }                                                                        // 23
    },                                                                         // 24
    updateCallBack                                                             // 25
  );                                                                           // 26
};                                                                             // 27
                                                                               // 28
var updateCallBack = function (error, result){                                 // 29
  if (result.statusCode != 200) console.log('return code not 200');            // 30
};                                                                             // 31
                                                                               // 32
/////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/google-calendar-sync/remove.js                                     //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
removeCalendar = function(calendarId){                                         // 1
  HTTP.del(                                                                    // 2
    gcalAPIprefix + "/calendars/"+calendarId,                                  // 3
    {headers: authHeader},                                                     // 4
    removeCallBack                                                             // 5
  );                                                                           // 6
};                                                                             // 7
                                                                               // 8
removeEvent = function (eventId, calendarId){                                  // 9
  HTTP.del(                                                                    // 10
    gcalAPIprefix + "/calendars/"+calendarId+"/events/"+eventId,               // 11
    {headers: authHeader},                                                     // 12
    removeCallBack                                                             // 13
  );                                                                           // 14
};                                                                             // 15
                                                                               // 16
var removeCallBack = function(error, result){                                  // 17
  if (result.statusCode != 200) console.log('return code not 200');            // 18
};                                                                             // 19
                                                                               // 20
/////////////////////////////////////////////////////////////////////////////////

}).call(this);
