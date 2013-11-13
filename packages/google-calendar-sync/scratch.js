/*

Brainstorming an implementation method for google-calendar-sync package

// in google-calendar-sync package
//yield these
GCalEvents = new Meteor.Collection({connection: null});
GCalCalendars = new Meteor.Collection({connection: null});
//and also keep them synced
Deps.autorun(function () {
  var newOnes = GCalEvents.find().observe({
    added: function (id, doc) { // HTTP.post new event to GCal
    }
      //...
  });
});


// commitment = {title: "jogging"} -> for each  event, {title: "jogging"}
// naming convention GCalcalendar = {summary: "tsnug: jogging"}
var commonCalPrefix = "tsnug: " + {commitment,event}.title; 


// in app

Events.find().observe({
  added: function (id, doc) { GCalSync.insert(doc) },
  removed: function (id, doc) { if (doc.gCalEvent) { GCalSync.remove(doc); }}
});

// refresh: remove old + fetch and insert new
Events.find({commitmentId: {$ne: undefined}}).forEach(function (evt) { 
  Events.remove(evt._id);
});
GCalSync.fetch().removeTSNugCalendars().forEach(function (evt) { Events.insert(
  _.extend(evt, {gCalEvent: true, allday: false})) })

GCalSync.fetch().forEach(function (evt) Events.insert(evt); );

// create new event:
evt = Events.insert(...); // GCalEvents.insert(evt);
*/