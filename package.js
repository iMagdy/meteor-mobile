Package.describe({
  name: 'imagdy:mobile',
  version: '1.0.0',
  summary: 'Everything you need to start a mobile app project on Meteor',
  git: 'https://github.com/iMagdy/meteor-mobile',
  documentation: 'README.md'
});

Npm.depends({
  shelljs: '0.5.3',
  'colors': '1.1.2',
  'figures': '1.4.0'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use([ 'ecmascript', 'underscore', 'reactive-dict', 'reactive-var' ]);
  api.addFiles('meteor.mobile.server.js', 'server');
  api.export('Mobile');
});
