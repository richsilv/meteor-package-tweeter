var keyLevels = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000];
var remote = DDP.connect('https://atmosphere.meteor.com');
var heartbeatOutstanding = false;
var sub, localHost = (Meteor.absoluteUrl() === 'http://localhost:3000/');

function subFunc() {
	if (sub) sub.stop();
	sub = remote.subscribe('allPackages');
};
sub = remote.subscribe('allPackages');

Packages = new Meteor.Collection('packages', {connection: remote});

Meteor.startup(function() {

	twitterCredentials = SecureData.findOne({name: "twitterCredentials"});

	Packages.find().observe({
		added: function(doc) {
			var thisPackage = PackageTracker.findOne({name: doc.name});
			if (!thisPackage) {
				PackageTracker.insert({name: doc.name, installCount: doc.installCount});
				var tweetString = ("New Package: " + doc.name + ', ' + doc.description).slice(0,140);
				console.log(tweetString);
				if (!localHost) twitterSendTweet(tweetString);
			}
			else if (doc.installCount > thisPackage.installCount) {
				console.log(doc.name, "has new downloads");
				_.each(keyLevels, function(level) {
					console.log("checking", level);
					if (doc.installCount >= level && thisPackage.installCount < level) {
						var tweetString = "Package '" + doc.name + "'' has reached " + level.toString() + " downloads!";
						console.log(tweetString);
						if (!localHost) twitterSendTweet(tweetString);
						PackageTracker.update(thisPackage, {$set: {installCount: doc.installCount}});
					}
				})
			}
		},
		changed: function(doc) {
			console.log("change detected in package " + doc.name);
			var thisPackage = PackageTracker.findOne({name: doc.name});
			if (!thisPackage) {
				PackageTracket.insert({name: doc.name, installCount: doc.installCount});
				console.log(("New Package: " + doc.name + ', ' + doc.description).slice(0,140));
			}
			else if (doc.installCount > thisPackage.installCount) {
				_.each(keyLevels, function(level) {
					if (doc.installCount >= level && thisPackage.installCount < level) {
						console.log("Package " + doc.name + " has reached " + level.toString() + " downloads!");
						PackageTracker.update(thisPackage, {$set: {installCount: doc.installCount}});
					}
				})
			}
		}
	});

	Meteor.setInterval(function () {
	  if (! heartbeatOutstanding) {
	    remote.call("heartbeat", function () {
	      heartbeatOutstanding = false;
	    });
	    heartbeatOutstanding = true;
	  }
	}, 3000);

	Meteor.setInterval(subFunc, 60000);

	remote.onReconnect = function () {
	  console.log("RECONNECTING REMOTE");
	};
});