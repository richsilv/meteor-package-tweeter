Future = Npm.require('fibers/future');

twitterSendTweet =  function(string) {

	console.log(twitterCredentials);

	var fut = new Future(), Twit = new TwitMaker({
		consumer_key:         twitterCredentials.apiKey,
		consumer_secret:      twitterCredentials.apiSecret,
		access_token:         twitterCredentials.accessToken,
		access_token_secret:  twitterCredentials.accessSecret
	});
	Twit.post('statuses/update', { status: string }, function(err, data, response) {
		if (err)
			fut.return(err);
		else {
			console.log("probably sent: " + string);
			fut.return(data, response);
		}
	});
	return fut.wait();
};

Meteor.methods({
/*	test: function(string) {
		return twitterSendTweet(string);
	}*/
});