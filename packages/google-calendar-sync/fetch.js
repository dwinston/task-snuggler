calendarList = [];
gCalFunc.getCalendarList = gCalFunc.getEvents = function () {};


Deps.autorun(function () {
  if (Session.get('GCalSync.authorized')) {
    gCalFunc.getCalendarList();
  }
});

Deps.autorun(function () {
  if (Session.get('GCalSync.hasCalendarList')) {
    gCalFunc.getEvents();
  }
});

gCalFunc.getCalendarList = function () {
  HTTP.get(
    gCalAPIprefix + "/users/me/calendarList",
    authHeader,
    function (error, result) {
      if (result.statusCode === 200) {
        calendarList = _.filter(result.data.items, function (c) {
          return c.selected && (c.summary !== "Weather");
        });
        Session.set('GCalSync.hasCalendarList', true);
      }
    });
};

gCalFunc.getEvents = function (calendar) {
  if (arguments.length === 0) {
    _.forEach(calendarList, function (c) { getEvents(c); });
  }
  // fetchSingleCalendarEvents
};
