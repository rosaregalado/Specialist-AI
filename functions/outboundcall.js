exports.handler = function (context, event, callback) {
  // The pre-initialized Twilio Client is available from the `context` object
  const twilioClient = context.getTwilioClient();

  // Query parameters or values sent in a POST body can be accessed from `event`
  const from = '+15102758665';
  const to = event.To;
  const {name, keyword, additionaldata} = event;
  const queryParams = new URLSearchParams({name, keyword, additionaldata}); ""
  // const url = `http://localhost:3000/transcribe?${queryParams.toString()}`;
  const url = `https://healthnow-8569-dev.twil.io/transcribe?${queryParams.toString()}`;
  twilioClient.calls
  .create({ to, from, record: true, url })
  .then((call) => {
      console.log(`Call successfully placed: ${url}`);
      // Make sure to only call `callback` once everything is finished, and to pass
      // null as the first parameter to signal successful execution.
      return callback(null, `Success! ${JSON.stringify(event)}`);
  })
  .catch((error) => {
      console.error(error);
      return callback(error);
  });
};
