tsnug.randomMomentFromNow = function(opts) {
  var min = moment().startOf('hour').add('hours', 1);
  var max = moment(min).endOf('week');
  var hoursToGo = max.diff(min, 'hours');
  var offset = _.random(hoursToGo);
  return moment(min).
    hour(min.hour() + offset).
    subtract('minutes', _.first(_.shuffle([0, 30])));
};
