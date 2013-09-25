Events = new Meteor.Collection("events");
Commitments = new Meteor.Collection("commitments");

var insertCommitmentEvent = function (commitment, startsAt) {
  Events.insert({
    userId: commitment.userId,
    commitmentId: commitment._id,
    title: commitment.title,
    start: startsAt.toDate(),
    end: moment(startsAt).add('hours', commitment.hoursPerSession).toDate(),
    allDay: false,
    lastUpdated: moment().toDate()
  }, function (err, res) {
    Commitments.update(commitment._id, {
      $push: {eventIds: res}});
  });
};

generateEvents = function (commitmentId, algorithm) {
  var commitment = Commitments.findOne(commitmentId);
  var fn = tsnug[algorithm];
  var startsAts = fn(commitment);
  if (_.isEmpty(startsAts)) {
    if (Meteor.isClient) {
      alert("There isn't enough non-conflicting time for this commitment.");
    } else {
      console.log("There isn't enough non-conflicting time " + 
                  "for this commitment.");
    }
  } else {
    _.each(startsAts, function (startsAt) {
      insertCommitmentEvent(commitment, startsAt);
    });
  }  
};


//////
// Playground for Google Calendar API
//////

importedEvents = [], importedCalendars = [], primaryCalendar = null;

Meteor.methods({
  getCalendars: function() {
    var gcalAPIprefix = "https://www.googleapis.com/calendar/v3";
    var Auth = 'Bearer ' + Meteor.user().services.google.accessToken;
    HTTP.get(
      gcalAPIprefix + "/users/me/calendarList",
      {headers: {'Authorization': Auth}},
      function(err,res) {
        if (res.statusCode === 200) {
          var calendars = res.data.items;
          importedCalendars = calendars;
          if (Meteor.isClient) console.log(calendars);
          var primaryCal = _.find(calendars, function (c) {
            return c.primary;
          });
          primaryCalendar = primaryCal;
          if (Meteor.isClient) console.log(primaryCal);
        }
      }
    );
  },
  getEvents: function (calendar) {
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
       }
      },
      function(err,res) {
        if (res.statusCode === 200) {
          var events = res.data.items;
          importedEvents = events;
          if (Meteor.isClient) console.log(events);
          
        }
      }
    );
  }
});
