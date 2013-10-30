Package.describe({
  summary: "Sync event collections with a user's Google calendar"
});

Package.on_use(function (api) {
  api.use(['underscore', 'deps', 'session'], 'client');

  // Files are added in order, so e.g. package-scope variables
  // declared in initialize.js are available in subsequently
  // added files.
  api.add_files(['initialize.js', 'fetch.js', 'insert.js', 
                 'update.js', 'remove.js'], 'client');

  api.export('GCalSync', 'client');
});
