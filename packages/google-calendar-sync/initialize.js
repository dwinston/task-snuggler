authHeader = null;
gCalAPIprefix =  "https://www.googleapis.com/calendar/v3";
appEvents = (typeof Events === "undefined") ? null : Events;
appCalendars = (typeof Calendars == "undefined") ? null : Calendars;
calendarHandler = eventHandler = null;
calendarTitlePrefix = "tsnug: "; // For now, may have a better solution

// Current implementation does not do any error checking and retry
// It assumes a perfect internet connection
// Possible solution: use queue example below to queue up asynchronous 
// events, and does error checking (i.e. if error, retry before next 
// sync event happens)

// TODO: Use a request queue to order HTTP requests.
// Can be implemented in another package
// Look at https://github.com/mbostock/queue -- it might
// be perfect for thi.s
// Danger: below code probably doesn't work or even run
// queue = [];
// callbackWithQueue = function (callback) {
//   callback();
//   queue.shift(); //pop()
//   if (!_.isEmpty(queue)) {
//     var next = _.first(queue);
//     next.request();
//   }
// };
// enqueue = function (request, callback) {
//   if (_.isEmpty(queue)) {
//     queue.push({request: request, callback: callback});
//     request();
//   } else {
//     queue.push({request: request, 
//                 callback: callbackWithQueue(callback)});
//   }
// }


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
    // Fetch calendar list and events
    getCalendarList();
  },

  refresh: function(day){
    curDate = day;
    refreshEvents();
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
  // tsnug TODO: add the numSession and hoursPerSession information
  // into the description of the calendar 
  //
  // TODO: retry functions involving async HTTP requests until they
  // succeed, else fail gracefully somehow
  calendarHandler = appCalendars.find().observe({
    added: function(doc){
      // console.log('In add calendar handler');
      // Inside insertCalendar, events are also inserted
      // Calendar are always commitments and this will do the job for now
      if (doc.gCalId === undefined) insertCalendar(doc);
    }, 
    changed: function (doc, oldDoc) {
      // console.log('In changed calendar handler');
      // For updating calendar name
      // Event names are updated automatically
      // because events are removed and regeneraed
      if (doc.gCalId) updateCalendar(doc);
    },
    removed: function (doc){
      // console.log('In remove calendar handler');
      // Removing calendar means events are also removed
      // Google gives 400 (Bad request) error,but calendar is removed
      if (doc.gCalId) removeCalendar(doc);
    }
  });

  // tsnug TODO: remove field gCalEvent and use commitmentId to identify
  // commitment events
  eventHandler = appEvents.find({gCalEvent: {$ne: true}}).observe({
    added: function(doc){
      // console.log('In add event handler');
      // Only insert events due to change of numSessions
      calendar = appCalendars.findOne({_id:doc.commitmentId});
      if (calendar && 
          calendar.gCalId != undefined && 
          doc.gCalId == undefined){
        // console.log('perform add to GCAL in event handler');
        insertEvent(doc, calendar.gCalId);
      }
    },
    changed:function(doc, oldDoc){
      // console.log('In change event handler');
      // In task snuggled, everytime an edit happens, 
      // task snuggler redoes generateEvents, 
      // which remove events and allocate them again
    },
    removed: function(doc){
      // console.log('In remove event handler');
      // Only remove events due to change of numSessions
      calendar = appCalendars.findOne({_id:doc.commitmentId});
      if (doc.gCalId && calendar.gCalId){
        removeEvent(doc, calendar.gCalId);
      }
    }
  });
};

stopCollectionListener = function(){
  calendarHandler.stop();
  eventHandler.stop();
}
