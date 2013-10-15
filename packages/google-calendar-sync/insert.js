Deps.autorun(function () {
  appCalendars && appCalendars.find().observeChanges({
    added: function (id, calendar) {
      insertCalendar(appId, calendar);
    }
  });
});

Deps.autorun(function () {
  var added = Session.get('GCalSync.calendarAdded');
  if (!added) return;
  // tsnugTODO: I don't like that this package reaches into the app's
  // calendars collection and stores a reference to the app calendar's
  // corresponding Google calendar. A polite Meteor package shouldn't 
  // do that. One option around this is to prefix
  // all inserted Google calendars so as to be easily connected to the 
  // database, e.g. the Google calendar summary "tsnug: jogging" corresponds
  // to appCalendars.findOne({title: 'jogging'})
  appCalendars.update(added.appId, {$set: {gCalId: added.calendar.id}});
});

Deps.autorun(function () {
  appEvents && appEvents.find({gCalEvent: {$ne: true}}).observeChanges({
    added: function (id, event) {
    }
  });
});

insertEvent = function(event, calendarId){
  HTTP.post(
    gcalAPIprefix + "/calendars/"+calendarId+"/events",
    {
      headers: authHeader,
      data: {
        summary: event.title, // perhaps change to "tsnug: " + event.title
        start: {dateTime: moment(event.start).format("YYYY-MM-DDTHH:mm:ssZ")},
        end: {dateTime: moment(event.end).format("YYYY-MM-DDTHH:mm:ssZ")}
      }
    },
    insertCallBack);
};

insertCalendar = function(appId, calendar){
  HTTP.post(
    gcalAPIprefix + "/calendars",
    {
      headers: authHeader,
      data: {summary: calendar.title}
    },
    function (error, result) {
      if (result.statusCode === 200) {
        Session.set("GCalSync.calendarAdded", 
                    {appId: appId, calendar: result.data});
      }
    });
};

var insertCallBack = function(error, result){
  if (result.statusCode != 200) console.log('GCalSync: insert failed');
};
