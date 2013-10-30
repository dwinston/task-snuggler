authHeader = null;
gCalAPIprefix =  "https://www.googleapis.com/calendar/v3";
appEvents = (typeof Events === "undefined") ? null : Events;
appCalendars = (typeof Calendars == "undefined") ? null : Calendars;
calendarHandler = eventHandler = null;
calendarTitlePrefix = "tsnug: "; // For now, may have a better solution

GCalSync = {
  // Input: a Meteor.user().services.google object that has
  //   an accessToken property.
  setAuth: function (googAuth) {
    var auth = 'Bearer ' + googAuth.accessToken;
    authHeader = {'Authorization': auth};
    // tsnugTODO: use googAuth.expiresAt to prompt user to reauthenticate.
    Session.set('GCalSync.authorized', true);
    // starts to observe changes for collections in task snugglers
    startCollectionListener();
  },

  setEvents: function (meteorCollection) {
    appEvents = meteorCollection;
  },

  // Input: the Meteor.Collection to use, and options that specify 
  // what enumerates its event ids (default 'eventIds') and
  // the name of the foreign key in appEvents that refers to its calendar
  // ('commitmentId' in Task Snuggler).  
  setCalendars: function (meteorCollection, options) {
    appCalendars = meteorCollection;
  }, 

  // Called when  user log outs
  exit: function(){
    stopCollectionListener();
  }
};

startCollectionListener = function(){
  // tsnug TODO: add the numSession and hoursPerSession
  // information into the description of the calendar
  calendarHandler = appCalendars.find().observe({
    added: function(doc){
      // Inside insertCalendar, events are also inserted
      // Bug: everytime web app refreshes,
      // the calendar is re-inserted
      if (!doc.gCalId) insertCalendar(doc);
    }, 
    changed: function (newDoc, oldDoc){
      // Inside updateCalendar, event names are also updated
      if (newDoc.gCalId) updateCalendar(newDoc);
    },
    removed: function (doc){
      // Removing calendar means events are also removed
      removeCalendar(doc);
    }
  });

  // tsnug TODO: remove field gCalEvent and use commitmentId to identify
  // commitment events
  eventHnadler = appEvents.find({gCalEvent: {$ne: true}}).observe({
    added: function(doc){},
    changed:function(newDoc, oldDoc){
      calendar = appCalendars.findOne({_id:newDoc.commitmentId});
      updateEvent(newDoc, calendar.gCalId);
    },
    removed: function(doc){
      // Only remove events due to change of numSessions
    }
  });
};

stopCollectionListener = function(){
  calendarHandler.stop();
  eventHandler.stop();
}