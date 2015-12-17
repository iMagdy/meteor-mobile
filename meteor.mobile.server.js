class _Mobile {
  constructor() {
    this.version    = '1.0.0';
    this.shell      = Npm.require( 'shelljs/global' );
    this.colors     = Npm.require( 'colors' );
    this.figures    = Npm.require( 'figures' );
    this.fs         = Npm.require( 'fs' );
    this.appDir     = pwd().replace(/\/\.meteor.*$/, '');
    this.appDirs    = ls('-A', this.appDir);
  }

  get( module ) {
    return Npm.require( module );
  }

  prepareClientDir() {
    let isDirExists = _.contains(this.appDirs, 'client');
    if (! isDirExists ) {
      echo(this.figures.error, '[Mobile] Could not find directory: "client" in your project root, creating...' );
      mkdir(this.appDir + '/client');
    }
  }

  preparePackagesDir() {
    let isDirExists = _.contains(this.appDirs, 'packages');
    if (! isDirExists ) {
      echo(this.figures.error, '[Mobile] Could not find directory: "packages" in your project root, creating...' );
      mkdir(this.appDir + '/packages');
    }
  }

  mobileSettingsFile() {
    return {
      "Fast click": true,
      "Launch screen": true,
      "Mobile statusbar": true,
      "Iron Router": false,
      "Flow Router": false,
      "Semantic UI": false,
      "Ionic Framework UI": false,
      "Faker": false,
      "Geolocation": false,
      "Camera": false,
      "Reactive dict": false,
      "Reactive var": false,
      "create meteor's Mobile Config File": false,
      "Moment": false
    };
  }

  isSettingsFileExists() {
    let isDirExists = _.contains(this.appDirs, '.mobile.json');
    if (! isDirExists ) {
      echo(this.figures.error, '[Mobile] Could not find file: ".mobile.json" in your project root, creating...' );
      echo( JSON.stringify(this.mobileSettingsFile(), null, 2) ).to( this.appDir + '/.mobile.json' );
    }
    return true;
  }

  translateFriendlyNames( friendlyName ) {
    let dict = {
      "Fast click": "fastclick",
      "Launch screen": 'launch-screen',
      "Mobile statusbar": 'mobile-status-bar',
      "Iron Router": 'iron:router',
      "Flow Router": 'kadira:flow-router',
      "Semantic UI": 'semantic:ui',
      "Ionic Framework UI": 'driftyco:ionic',
      "Faker": 'digilord:faker',
      "Geolocation": 'mdg:geolocation',
      "Camera": 'mdg:camera',
      "Reactive dict": 'reactive-dict',
      "Reactive var": 'reactive-var',
      "create meteor's Mobile Config File": 'mobile-config',
      "Moment": 'momentjs:moment'
    };
    return dict[friendlyName];
  }

  createMobileConfig() {
    console.log('creating mobile-config');
    let sample = `
        // This section sets up some basic app metadata,
        // the entire section is optional.
        App.info({
          id: 'com.example.matt.uber',
          name: 'über',
          description: 'Get über power in one button click',
          author: 'Matt Development Group',
          email: 'contact@example.com',
          website: 'http://example.com'
        });

        // Set up resources such as icons and launch screens.
        App.icons({
          'iphone': 'icons/icon-60.png',
          'iphone_2x': 'icons/icon-60@2x.png',
          // ... more screen sizes and platforms ...
        });

        App.launchScreens({
          'iphone': 'splash/Default~iphone.png',
          'iphone_2x': 'splash/Default@2x~iphone.png',
          // ... more screen sizes and platforms ...
        });

        // Set PhoneGap/Cordova preferences
        App.setPreference('BackgroundColor', '0xff0000ff');
        App.setPreference('HideKeyboardFormAccessoryBar', true);
        App.setPreference('Orientation', 'default');
        App.setPreference('Orientation', 'all', 'ios');

        // Pass preferences for a particular PhoneGap/Cordova plugin
        App.configurePlugin('com.phonegap.plugins.facebookconnect', {
          APP_ID: '1234567890',
          API_KEY: 'supersecretapikey'
        });
    `;

    if ( cat(this.appDir + '/mobile-config.js') === '' ) {
      echo( sample ).to( this.appDir + '/mobile-config.js' );
    }
    return true;
  }

  check( packages ) {
    this.packages = packages;
    return this;
  }

  using( settingsFile ) {
    let packages = this.packages;
    let settings = JSON.parse(settingsFile);

    for (let packageName in settings) {
      if (settings.hasOwnProperty(packageName)) {
        if ( this.translateFriendlyNames(packageName) === 'mobile-config' ) {
          this.createMobileConfig();
        } else {
          console.log(`[Meteor Mobile]: ${settings[packageName] ? 'installing' : 'removing'}... `, this.translateFriendlyNames(packageName));
          var package = exec(`meteor ${settings[packageName] ? 'add' : 'remove'} ${this.translateFriendlyNames(packageName)}`, { silent: true }).output;
          console.log(package);
        }
      }
    }

  }

  watchSettings( cb ) {
    this.fs.watchFile(this.appDir + '/.mobile.json', function (current, prev) {
      console.log('[Meteor Mobile]: Config changed, updating...');
      cb();
    });
  }

  init() {

    if (! this.isSettingsFileExists() ) {
      console.log(this.figures.star + this.figures.star + this.figures.star + ' ===[[[ Welcome to Meteor Mobile ]]]=== '.green + this.figures.star + this.figures.star + this.figures.star);
      this.prepareClientDir();
    } else {
      // let appPackages = cat( this.appDir + '/.meteor/packages' );
      let appPackages = exec('meteor list', { silent: true }).output;
      let settingsFile = cat( this.appDir + '/.mobile.json' );

      this.watchSettings(() => {
        Mobile.check(appPackages).using(settingsFile)
      });

    }


  }

}

Mobile = new _Mobile();

Mobile.init();
