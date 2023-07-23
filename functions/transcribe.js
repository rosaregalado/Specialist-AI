
exports.handler = function(context, event, callback) {
    const {name, keyword, additionaldata} = event;
    // Create a TwiML Voice Response object to build the response
    const twiml = new Twilio.twiml.VoiceResponse();

    const options = {
        "therapy": {
            name: 'Joanna',
            voice: 'Polly.Joanna-Neural',
            intro: `Hey, ${name}! I'm Joanna, a mental health proffessional chatbot. You mentioned ${additionaldata}. Please say more.`
        },
        "cooking": {
            name: 'Joey',
            voice: 'Polly.Joey-Neural',
            intro: `Hey, ${name}! I'm Joey, a professional chef and cooking instructor. You mentioned ${additionaldata}. Please say more.`
        },
        "fitness": {
            name: 'Kimberly',
            voice: 'Polly.Kimberly-Neural',
            intro: `Hey, ${name}! I'm Kimberly, a fitness instructor and life coach. You mentioned ${additionaldata}. Please say more.`
        },
    }

    // If no previous conversation is present, or if the conversation is empty, start the conversation
    if (!event.request.cookies.convo) {
        // Greet the user with a message using AWS Polly Neural voice
        const specialist = options[keyword];
        twiml.say({
                voice: specialist.voice,
            },
            specialist.intro
        );
    }

    // listen to the user's speech and pass the input to the /respond Function
    twiml.gather({
        speechTimeout: 'auto',
        speechModel: 'experimental_conversations',
        input: 'speech',
        action: '/respond',
    });

    // Create a Twilio Response object
    const response = new Twilio.Response();

    // Set the response content type to XML (TwiML)
    response.appendHeader('Content-Type', 'application/xml');

    // Set the response body to the generated TwiML
    response.setBody(twiml.toString());

    // If no conversation cookie is present, set an empty conversation cookie
    if (!event.request.cookies.convo) {
        response.setCookie('convo', '', ['Path=/']);
        response.setCookie('name', name, ['Path=/']);
        response.setCookie('keyword', keyword, ['Path=/']);
        response.setCookie('additionaldata', additionaldata, ['Path=/']);
    }

    // Return the response to Twilio
    return callback(null, response);
};

