exports.handler = function (context, event, callback) {
    // The pre-initialized Twilio Client is available from the `context` object
    const twilioClient = context.getTwilioClient();

    // Query parameters or values sent in a POST body can be accessed from `event`
    const from = '+15102758665';
    const to = event.To;
    // const to = event.To || '+15105204320';
    // Note that TwiML can be hosted at a URL and accessed by Twilio
    const url = event.Url || 'http://demo.twilio.com/docs/voice.xml';

    // Use `calls.create` to place a phone call. Be sure to chain with `then`
    // and `catch` to properly handle the promise and call `callback` _after_ the
    // call is placed successfully!
    // Note the addition of the `record` configuration flag for `calls.create`
    twilioClient.calls
    .create({ to, from, record: true, url })
    .then((call) => {
        console.log('Call successfully placed');
        console.log(call.sid);
        // Make sure to only call `callback` once everything is finished, and to pass
        // null as the first parameter to signal successful execution.
        return callback(null, `Success! Call SID: ${call.sid}`);
    })
    .catch((error) => {
        console.error(error);
        return callback(error);
    });
};

// exports.handler = function(context, event, callback) {
//     // Create a TwiML Voice Response object to build the response
//     const twiml = new Twilio.twiml.VoiceResponse();

//     // If no previous conversation is present, or if the conversation is empty, start the conversation
//     if (!event.request.cookies.convo) {
//         // Greet the user with a message using AWS Polly Neural voice
//         twiml.say({
//                 voice: 'Polly.Joanna-Neural',
//             },
//             "Hey! I'm Joanna, a health proffessional chatbot. How are you doing?"
//         );
//     }

//     // listen to the user's speech and pass the input to the /respond Function
//     twiml.gather({
//         speechTimeout: 'auto',
//         speechModel: 'experimental_conversations',
//         input: 'speech',
//         action: '/respond',
//     });

//     // Create a Twilio Response object
//     const response = new Twilio.Response();

//     // Set the response content type to XML (TwiML)
//     response.appendHeader('Content-Type', 'application/xml');

//     // Set the response body to the generated TwiML
//     response.setBody(twiml.toString());

//     // If no conversation cookie is present, set an empty conversation cookie
//     if (!event.request.cookies.convo) {
//         response.setCookie('convo', '', ['Path=/']);
//     }

//     // Return the response to Twilio
//     return callback(null, response);
// };

