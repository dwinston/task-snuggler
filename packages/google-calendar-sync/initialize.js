authHeader = null;
gCalAPIprefix =  "https://www.googleapis.com/calendar/v3";
appEvents = (typeof Events === "undefined") ? null : Events;
appCalendars = (typeof Calendars == "undefined") ? null : Calendars;

// Options for specifying the relationship between the application's
// event and calendar collections.
appCalendarHasMany = "eventIds";
appEventHasOne     = "calendarId";

GCalSync = {
  // Input: a Meteor.user().services.google object that has
  //   an accessToken property.
  setAuth: function (googAuth) {
    var auth = 'Bearer ' + googAuth.accessToken;
    authHeader = {'Authorization': auth};
    // tsnugTODO: use googAuth.expiresAt to prompt user to reauthenticate.
    Session.set('GCalSync.authorized', true);
  },

  setEvents: function (meteorCollection) {
    appEvents = meteorCollection;
  },

  // Input: the Meteor.Collection to use, and options that specify 
  // what enumerates its event ids (default 'eventIds') and
  // the name of the foreign key in appEvents that refers to its calendar
  // ('commitmentId' in Task Snuggler).  
  setCalendars: function (meteorCollection, options) {
    appCalendarHasMany = options.eventIds || "eventIds";
    appEventHasOne = options.eventForeignKey || "calendarId";
    appCalendars = meteorCollection;
  }
};
