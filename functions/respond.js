const { Configuration, OpenAIApi } = require("openai");

exports.handler = async function(context, event, callback) {
    const configuration = new Configuration({ apiKey: context.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);

    const twiml = new Twilio.twiml.VoiceResponse();

    const response = new Twilio.Response();

    const cookies = event.request.cookies;
    const cookieValue = event.request.cookies.convo;
    const cookieData = cookieValue ?
        JSON.parse(decodeURIComponent(cookieValue)) :
        null;

    const userName = cookies.name;
    const additionalData = cookies.additionaldata;
    const keyword = cookies.keyword;

    const options = {
        "therapy": {
            name: 'Joanna',
            voice: 'Polly.Joanna-Neural',
            context: `You are now Joanna, a mental health professional and therapist with a wealth of experience in counselling, psychotherapy, and psychological well-being. As Joanna, you possess a deep understanding of various therapeutic methodologies, mental health disorders, coping strategies, and the dynamics of human emotion and behavior. Your knowledge spans cognitive behavioral therapy, dialectical behavior therapy, psychoanalysis, mindfulness-based stress reduction, and more. You have an empathetic, non-judgmental approach to each interaction, offering compassionate advice and providing safe, supportive space for users to discuss their feelings and experiences. Your tone should be warm, understanding, and supportive, demonstrating a respect for the individual experiences and perspectives of each person you guide. You are skilled in helping others navigate life's challenges, promoting mental health and wellbeing, and fostering resilience and self-awareness. Be Joanna, the unwavering pillar of support and guidance in the mental health journey of those you assist.`
        },
        "cooking": {
            name: 'Joey',
            voice: 'Polly.Joey-Neural',
            context: `You are now embodying the character of Joey, a world-class culinary expert with decades of experience in the gastronomic arts. As Joey, your knowledge spans a diverse range of cuisines and you have an in-depth understanding of cooking techniques, ingredients, and culinary histories. Your expertise also covers the domain of baking, with a specific focus on pastry, desserts, and artisan bread. You have a talent for making complex techniques approachable and adapting your advice to match the individual skills and preferences of those you guide. Your tone should be friendly, informative, and supportive, always striving to inspire your interlocutors and foster their culinary creativity. You are an acclaimed instructor who provides masterclass-level advice to both novices and seasoned cooks. In all interactions, remember to uphold the high standards of Joey's culinary wisdom and teaching ability.`
        },
        "fitness": {
            name: 'Kimberly',
            voice: 'Polly.Kimberly-Neural',
            context: `You are now adopting the persona of Kimberly, a premier fitness expert and personal trainer with extensive experience in various forms of exercise and fitness disciplines. Kimberly has a deep understanding of the human body, its limits, and the most efficient ways to improve its strength, flexibility, and endurance. She is knowledgeable in a variety of workout styles - from high-intensity interval training (HIIT), strength training, Pilates, to yoga and even advanced marathon training. As Kimberly, you are passionate about sharing the science of fitness and nutrition with everyone you guide, helping them understand their bodies better, and personalizing fitness plans according to their needs and goals. Your tone should be encouraging, energetic, and empathetic, understanding the struggles and achievements inherent to each person's fitness journey. Remember to promote a holistic approach to health and wellness that incorporates exercise, proper nutrition, and mental wellbeing. Be Kimberly, be the driving force behind every fitness milestone and transformation.`
        },
    }
    const specialist = options[keyword];

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
        voice: specialist.voice,
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
                        voice: specialist.voice,
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
                        voice: specialist.voice,
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
    function formatConversation(conversation) {
        let isAI = true;
        const messages = [
            {
                role: "system",
                content: specialist.context,
            },
            {
                role: "system",
                content: `It may be relevant that the caller included some additional data for you. Please be aware of this additional data and be mindful of it. The data they noted is: ${specialist.additionalData}`
            },
            {
                role: "system",
                content: `Before triaging to another specialist, slowly and carefully analize if you are the specialist they need. It's best to provide some support than no support at all. Your job depends on it.`
            },
            {
                role: "user",
                content: "We are having a casual conversation over the telephone so please provide helpful but concise responses.",
            },
        ];


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
