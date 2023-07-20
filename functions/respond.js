const { Configuration, OpenAIApi } = require("openai");

exports.handler = async function(context, event, callback) {
    const configuration = new Configuration({ apiKey: context.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);

    const twiml = new Twilio.twiml.VoiceResponse();

    const response = new Twilio.Response();

    const cookieValue = event.request.cookies.convo;
    const cookieData = cookieValue ?
        JSON.parse(decodeURIComponent(cookieValue)) :
        null;

    let voiceInput = event.SpeechResult;

    const conversation = cookieData?.conversation || [];
    conversation.push(`user: ${voiceInput}`);

    // get the AI's response based on the conversation history and user profile
    const aiResponse = await generateAIResponse(conversation.join(";"), cookieData?.profile);

    const cleanedAiResponse = aiResponse.replace(/^\w+:\s*/i, "").trim();

    // add the AI's response to the conversation history
    conversation.push(`assistant: ${aiResponse}`);

    while (conversation.length > 10) {
        conversation.shift();
    }

    twiml.say({
        voice: "Polly.Joanna-Neural",
    },
        cleanedAiResponse
    );

    twiml.redirect({
        method: "POST",
    },
        `/transcribe`
    );

    response.appendHeader("Content-Type", "application/xml");
    response.setBody(twiml.toString());

    
    const newCookieValue = encodeURIComponent(
        JSON.stringify({
            conversation,
            profile: cookieData?.profile,
        })
    );
    response.setCookie("convo", newCookieValue, ["Path=/"]);

    // return the response
    return callback(null, response);

    // generate the AI response based on the conversation history and user profile
    async function generateAIResponse(conversation, userProfile) {
        const messages = formatConversation(conversation, userProfile);
        return await createChatCompletion(messages);
    }

    // create a chat completion using the OpenAI API
    async function createChatCompletion(messages) {
        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: messages,
                temperature: 0.8, 
                max_tokens: 100,
            });
            // check for error code
            if (completion.status === 500) {
                console.error("Error: OpenAI API returned a 500 status code."); // Log an error message indicating that the OpenAI API returned a 500 status code
                twiml.say({
                        // provide an error message to the user
                        voice: "Polly.Joanna-Neural",
                    },
                    "Oops, looks like I got an error from the OpenAI API on that request. Let's try that again."
                );
                twiml.redirect({
                        // redirect the user to the /transcribe endpoint
                        method: "POST",
                    },
                    `/transcribe`
                );
                response.appendHeader("Content-Type", "application/xml"); 
                response.setBody(twiml.toString()); 
                return callback(null, response); 
            }
            return completion.data.choices[0].message.content;
        } catch (error) {
            // check if the error is a timeout error
            if (error.code === "ETIMEDOUT" || error.code === "ESOCKETTIMEDOUT") {
                console.error("Error: OpenAI API request timed out.");
                twiml.say({
                        // provide an error message to the user
                        voice: "Polly.Joanna-Neural",
                    },
                    "I'm sorry, but it's taking me a little bit too long to respond. Let's try that again, one more time."
                );
                twiml.redirect({
                        // redirect element to redirect the user to the /transcribe endpoint
                        method: "POST",
                    },
                    `/transcribe`
                );
                response.appendHeader("Content-Type", "application/xml"); 
                response.setBody(twiml.toString()); 
                return callback(null, response); 
            } else {
                console.error("Error during OpenAI API request:", error);
                throw error;
            }
        }
    }

    // format the conversation history and user profile into a format that the OpenAI API can understand
    function formatConversation(conversation, userProfile) {
        let isAI = true;
        const messages = [
            {
                role: "system",
                content: "You are a specialist with names and are a very personable bot. You will use these name or pronouns throughout the conversation to make it personable."
            },
            {
                role: "system",
                content: "You are a mental health professional specializing in student health. You can provide advice and ask students questions to help diagnose, or you can triage to other medical professinals. You should be very helpul only around this topic as it relates to University students. You should not provide any information or help regarding any other topics not related students health."
            },
            {
                role: "system",
                content: "At the users first greeting, ask me questions to diagnose how i am feeling today, one question at a time, and take it from there - unless the user immediately express something important in the first message"
            },
            {
                role: "user",
                content: "We are having a casual conversation over the telephone so please provide helpful but concise responses.",
            },
        ];

        // add user profile information to the conversation history
        if (userProfile) {
            messages.push({
                role: "system",
                content: `User Profile: Name - ${userProfile.name}, Pronouns - ${userProfile.pronouns}, concerns - ${userProfile.concerns}`,
            });
        }

        // alternate between 'assistant' and 'user' roles
        for (const message of conversation.split(";")) {
            const role = isAI ? "assistant" : "user";
            messages.push({
                role: role,
                content: message,
            });
            isAI = !isAI;
        }
        return messages;
    }
};
