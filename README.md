#Specialist AI
--------------------------------------------------------------------

##Introduction

Specialist AI, formerly known as 'Health Now,' was born out of a passion to address the growing concerns about mental health among students and the limited accessibility to therapy and counseling. This project emerged from the crucible of a students' hackathon in April, where the challenge was to craft an app/product to enhance the physical and mental well-being of college students.

##Inspiration

The inspiration for Specialist AI stemmed from the undeniable need for accessible mental health resources for students. With mental health becoming an increasingly pressing issue, this project was designed to create a solution that effortlessly provides students with guidance and resources to nurture their holistic well-being.

##Technology Stack

Specialist AI is a testament to innovation and integration, developed using a blend of cutting-edge technologies:

Node.js: The backbone of the application, ensuring a seamless and responsive backend.

Twilio's API: The gateway to communication, enabling the bot to initiate and participate in meaningful conversations.

OpenAI API: The heart and soul of the bot's intellect, training it to understand and respond to natural language inputs with empathy and accuracy.

##How It Works

The essence of Specialist AI lies in its simplicity:

1 - The user will submit a form with their phone number, name, specialist needed (mental health, culinary expert, or fitness coach) and any additional info. 

2 - The AI specialist bot will call the phone number and have a personalized conversation with the user.

##Demo

The submission of the form creates a POST request to the server to trigger the call from the AI Specialist. This is an example of how the form request would look like: 

```{"To":"+1(510)-520-4320", "name": "monica", "keyword": "therapy", "additionaldata": "my dog died"```

```{"To":"+1(510)-520-4320", "name": "rosa", "keyword": "cooking", "additionaldata": "prepare for a weight lifting session"}```

```{"To":"+1(510)-520-4320", "name": "chloe", "keyword": "fitness", "additionaldata": "prepare for a weight lifting session"}```


