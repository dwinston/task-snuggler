//////
// Client calls refreshGCalEvents()
//////

var googleCalendars = [];

var insertEvent = function (event) {
  Events.insert({
    gCalEvent: true,
    userId: Meteor.userId(), 
    title: event.summary, 
    start: new Date(event.start.dateTime), 
    end: new Date(event.end.dateTime), 
    commitmentId: 0, 
    allDay: false, 
    lastUpdated: moment().toDate()
  });
};

var insertEvents = function(cIdx) {
  return function (error, result) {
    if (result.statusCode === 200) {
      console.log('Fetched events from calendar '+ (cIdx+1) + ' of ' + 
                  googleCalendars.length + '. Inserting...');
      _.forEach(result.data.items, insertEvent);
    }
  };
};

var fetchAndInsertEvents =  function (calendar, cIdx) {
  var gcalAPIprefix = "https://www.googleapis.com/calendar/v3";
  var Auth = 'Bearer ' + Meteor.user().services.google.accessToken;
  HTTP.get(
    gcalAPIprefix + "/calendars/"+calendar.id+"/events",
    {headers: {'Authorization': Auth},
     params: {
       singleEvents: true,
       orderBy: "startTime",
       timeMin: moment().format("YYYY-MM-DDTHH:mm:ssZ"),
       timeMax: moment().endOf('week').format("YYYY-MM-DDTHH:mm:ssZ")
     }},
    insertEvents(cIdx));
};

// Visible to user in GCal UI, and not Weather
var isSelected = function (c) {
  return c.selected && (c.summary !== "Weather");
};

var tryToFetchAndInsertEvents = function (error, result) {
  if (result.statusCode === 200) {
    googleCalendars = _.filter(result.data.items, isSelected);
    console.log('Found ' + googleCalendars.length + ' active calendars. ' + 
                'Fetching events...');
    _.forEach(googleCalendars, function (c,i) { fetchAndInsertEvents(c,i); });
  }
};

var getCalendarsAndThen =  function(doThis) {
  var gcalAPIprefix = "https://www.googleapis.com/calendar/v3";
  var Auth = 'Bearer ' + Meteor.user().services.google.accessToken;
  HTTP.get(gcalAPIprefix + "/users/me/calendarList",
           {headers: {'Authorization': Auth}},
           doThis);
};

refreshGCalEvents = function() {
  var pastImported = Events.find({
    gCalEvent: true, 
    lastUpdated: {$lt: moment().toDate()}
  });

  getCalendarsAndThen(tryToFetchAndInsertEvents);

  console.log('Removing previously imported events...');
  pastImported.forEach(function (gCalEvent) {
    Events.remove(gCalEvent._id);
  });
};

Meteor.startup(function () {
  Deps.autorun(function (c) {
    var user = Meteor.user();
    if (user && user.services && user.services.google) {
      c.stop(); // otherwise, runs twice in rapid succession, doubling events
      refreshGCalEvents();
    }
  });
});
