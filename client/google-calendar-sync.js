//////
// Client calls refreshGCalEvents()
//////

var googleCalendars = [];
var gcalAPIprefix = "https://www.googleapis.com/calendar/v3";

var insertEvent = function (event) {
  Events.insert({
    gCalEvent: true,
    userId: Meteor.userId(), 
    title: event.summary, 
    start: new Date(event.start.dateTime), 
    end: new Date(event.end.dateTime), 
    commitmentId: 0, 
    allDay: false, 
    lastUpdated: moment().toDate(),
    editable: false
  });
};

var insertCalendarEvents = function(error, result) {
    if (result.statusCode === 200) _.forEach(result.data.items, insertEvent);
    else console.log('return code not 200');
};

var fetchSingleCalendarEvents =  function (calendar) {
  var Auth = 'Bearer ' + Meteor.user().services.google.accessToken;
  var cView = $('#calendar').fullCalendar('getView');
  var startOfWeek = moment(cView.start).startOf('week');
  var endOfWeek = moment(startOfWeek).endOf('week');
  HTTP.get(
    gcalAPIprefix + "/calendars/"+calendar.id+"/events",
    {headers: {'Authorization': Auth},
     params: {
       singleEvents: true,
       orderBy: "startTime",
       timeMin: startOfWeek.format("YYYY-MM-DDTHH:mm:ssZ"),
       timeMax: endOfWeek.endOf('week').format("YYYY-MM-DDTHH:mm:ssZ")
     }},
    insertCalendarEvents);
};

// Visible to user in GCal UI, and not Weather
var calendarFilter = function (c) {
  return c.selected && (c.summary !== "Weather");
};

var fetchAllCalendarEvents = function (error, result) {
  if (result.statusCode === 200) {
    googleCalendars = _.filter(result.data.items, calendarFilter);
    _.forEach(googleCalendars, function (c) { 
      fetchSingleCalendarEvents(c); 
    });
  }
  else console.log('return code not equal to 200');
};

var getCalendarLists =  function() {
  var Auth = 'Bearer ' + Meteor.user().services.google.accessToken;
  HTTP.get(gcalAPIprefix + "/users/me/calendarList",
           {headers: {'Authorization': Auth}},
           fetchAllCalendarEvents);
};

refreshGCalEvents = function() {
  Events.find({gCalEvent: true}).forEach(function (gCalEvent) {
    Events.remove(gCalEvent._id);
  });
  getCalendarLists();
};