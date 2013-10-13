authHeader = null;
gCalAPIprefix =  "https://www.googleapis.com/calendar/v3";

GCalSync = {
  // Input: a Meteor.user().services.google object that has
  //   an accessToken property.
  setAuth: function (googAuth) {
    var auth = 'Bearer' + googAuth.accessToken;
    authHeader = {'Authorization': auth};
    // tsnugTODO: use googAuth.expiresAt to prompt user to reauthenticate.
    Session.set('GCalSync.authorized', true);
  }

  // tsnugTODO: have a required 'setEvents' function and an optional
  //   'setCalendars' function that specify the Meteor.Collection objects
  //   to use. 'setCalendars' would also take as input the name of
  //   its property that enumerates its event ids (default 'eventIds') and
  //   the name of the foreign key in events that refers to its calendar
  //   ('commitmentId' in Task Snuggler).
};
