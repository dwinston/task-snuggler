//////
// Client calls refreshGCalEvents()
//////

var googleCalendars = [];
var gcalAPIprefix = "https://www.googleapis.com/calendar/v3";

// Fetch Events from Google Calendar
refreshGCalEvents = function() {
  Events.find({gCalEvent: true}).forEach(function (gCalEvent) {
    Events.remove(gCalEvent._id);
  });
  getCalendarLists(fetchAllCalendarEvents);
};

// Update GCal with program's commitment events allocation
updateGCalCommitments = function(){
  getCalendarLists(checkBeforeUpdate);
};

// Delete all old events and the calendar from GCal
deleteCalendarFromGCal = function(commitment){
  var Auth = 'Bearer ' + Meteor.user().services.google.accessToken;
  HTTP.del(
    gcalAPIprefix + "/calendars/"+commitment.gCalId,
    {headers: {'Authorization': Auth}},function(){});    
};

// Insert GCal event in to local database
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
  var commitment = Commitments.findOne({gCalId: calendar.id});
  if (!commitment){
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
  }
};

// Visible to user in GCal UI, and not Weather
var calendarFilter = function (c) {
  return c.selected && (c.summary !== "Weather");
};

// Possible call back function for getCalendar Lists
var fetchAllCalendarEvents = function (error, result) {
  if (result.statusCode === 200) {
    googleCalendars = _.filter(result.data.items, calendarFilter);
    _.forEach(googleCalendars, function (c) { 
      fetchSingleCalendarEvents(c); 
    });
  }
  else console.log('return code not equal to 200');
};

var getCalendarLists =  function(callBackFunc) {
  // TODO: Memoize when appropriate
  var Auth = 'Bearer ' + Meteor.user().services.google.accessToken;
  HTTP.get(gcalAPIprefix + "/users/me/calendarList",
           {headers: {'Authorization': Auth}},
           callBackFunc);
};

// prototype. need to improve / connect to other code
var insertEventIntoGCal = function(calendarId, commitment) {
  var Auth = 'Bearer ' + Meteor.user().services.google.accessToken;
  var eventCursor = Events.find({commitmentId: commitment._id});
  eventCursor.forEach(function(event){
    HTTP.post(
      gcalAPIprefix + "/calendars/"+calendarId+"/events",
      {headers: {'Authorization': Auth},
       data: {
         summary: event.title,
         start: {dateTime: moment(event.start).format("YYYY-MM-DDTHH:mm:ssZ")},
         end: {dateTime: moment(event.end).format("YYYY-MM-DDTHH:mm:ssZ")}
       }},
      function(){}); // Async call back function must be declared!!
  });
};

// Update database and insert new events
var updateCommitmentGCal = function (error, result){
  var cal = result.data;
  var commitment = Commitments.findOne({title: cal.summary});
  Commitments.update(commitment._id, 
                     {
                       $set:{gCalId: cal.id}
                     });
  // Database update might take some time
  insertEventIntoGCal(result.data.id, commitment);
};

// Insert Calendar List
var insertCalendarIntoGCal = function(commitment) {
  var Auth = 'Bearer ' + Meteor.user().services.google.accessToken;
  HTTP.post(
    gcalAPIprefix + "/calendars",
    {
      headers: {'Authorization': Auth},
      data: {summary: commitment.title}
    },
    updateCommitmentGCal);
};

// Possible call back function for getCalendarLists
var checkBeforeUpdate = function(error, result){
  if (result.statusCode === 200) {
    // client subscription to commitments is limited to current user
    Commitments.find().forEach(function (commitment){
      // Check if commitment already exist
      if (_.has(commitment, 'gCalId')) {
        deleteCalendarFromGCal(commitment);        
      }
      insertCalendarIntoGCal(commitment);
    });
  }
  else console.log('return code not equal to 200');
}

