// template with meteor/underscore package?
// meteorite/momentjs?

Package.describe({
  summary: "Sync event collections with a user's Google calendar"
});

Package.on_use(function (api) {
  api.use(['deps', 'session'], 'client');
  api.add_files(['initialize.js', 'fetch.js', 'insert.js', 
                 'update.js', 'remove.js'], 'client');

  api.export('GCalSync', 'client');
});
