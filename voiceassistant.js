//voice assistant using Cognitive services and Luis
//get subscription and region
const subKey= " ";
const subReg= " ",
const speechConfig= SpeechConfig.fromSubscription (`${subKey},${subReg}`);//get from Azure


//text to speech
const outputConfig = AudioConfig.fromDefaultSpeakerOutput();
const synthesizer = new sdk.SpeechSynthesizer(speechConfig, outputConfig);
const ssml = xmlToString("ssml.xml");
//speech to text
const audioConfig= AudioConfig.fromDefaultMicrophoneInput();
const recognizer= new SpeechRecognizer(speechConfig,audioConfig);

//add recognizer
recognizer.recognizing = (s, e) => {
    console.log(`RECOGNIZING: Text=${e.result.text}`);
};

recognizer.recognized = (s, e) => {
    if (e.result.reason == ResultReason.RecognizedSpeech) {
        console.log(`RECOGNIZED: Text=${e.result.text}`);
    }
    else if (e.result.reason == ResultReason.NoMatch) {
        console.log("NOMATCH: Speech could not be recognized.");
    }
};

recognizer.canceled = (s, e) => {
    console.log(`CANCELED: Reason=${e.reason}`);

    if (e.reason == CancellationReason.Error) {
        console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
        console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
        console.log("CANCELED: Did you update the subscription info?");
    }

    recognizer.stopContinuousRecognitionAsync();
};

recognizer.sessionStopped = (s, e) => {
    console.log("\n    Session stopped event.");
    recognizer.stopContinuousRecognitionAsync();
};

// add synthesizer 
function synthesizeSpeech() 
{
    synthesizer.speakSsmlAsync
    (
        ssml,
        result =>
         {
            if (result.errorDetails)
             {
                console.error(result.errorDetails);
            } 
            else 
            {
                console.log(JSON.stringify(result));
            }

            synthesizer.close();
        },
        error =>
         {
            console.log(error);
            synthesizer.close();
        });
}
//add luis
//add wake words
//add queues: spotify, tell the time, have a conversation

// function for replacing the xml inner text (****TRY*****)
var text= xmlDoc.getElementsByTagName("mstts:express-as");
text.textContent = "text to speech";

//recognition parameters
// Starts continuous recognition. Uses stopContinuousRecognitionAsync() to stop recognition.
recognizer.startContinuousRecognitionAsync();

// Something later can call, stops recognition.
 recognizer.StopContinuousRecognitionAsync();

