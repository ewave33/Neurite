﻿

let aiResponding = false;
let latestUserMessage = null;
let controller = new AbortController();
let shouldContinue = true;


let failCounter = 0;
const MAX_FAILS = 2;

let streamedResponse = "";

async function handleStreamingResponse(response) {
    streamedResponse = "";
    const noteInput = document.getElementById("note-input");
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    const appendContent = async function (content) {
        await new Promise(resolve => setTimeout(resolve, 30));  // Delay response append

        const isScrolledToBottom = noteInput.scrollHeight - noteInput.clientHeight <= noteInput.scrollTop + 1;
        if (shouldContinue) {
            myCodeMirror.replaceRange(content, CodeMirror.Pos(myCodeMirror.lastLine()));
            streamedResponse += content;  // Append the content to the streamedResponse
        }
        if (isScrolledToBottom && !userScrolledUp) {
            noteInput.scrollTop = noteInput.scrollHeight;
            myCodeMirror.scrollTo(null, myCodeMirror.getScrollInfo().height);
        }
        noteInput.dispatchEvent(new Event("input"));
    };

    while (true) {
        const { value, done } = await reader.read();
        // Break the loop if streaming is done or the shouldContinue flag is set to false
        if (done || !shouldContinue) break;

        buffer += decoder.decode(value, { stream: true });

        // If shouldContinue is false, stop processing
        if (!shouldContinue) break;

        // Handle content processing only when shouldContinue is true
        if (shouldContinue) {
            let contentMatch;
            while ((contentMatch = buffer.match(/"content":"((?:[^\\"]|\\.)*)"/)) !== null) {
                const content = JSON.parse('"' + contentMatch[1] + '"');
                if (!shouldContinue) break;

                if (content.trim() !== "[DONE]") {
                    await appendContent(content);
                }
                buffer = buffer.slice(contentMatch.index + contentMatch[0].length);
            }
        }
    }

    // Return the complete streamed response
    return streamedResponse;
}

function getAPIParams(messages, stream) {
    const API_KEY = document.getElementById("api-key-input").value;
    if (!API_KEY) {
        alert("Please enter your API key");
        return null;
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${API_KEY}`);

    const temperature = document.getElementById('model-temperature').value;
    const modelSelect = document.getElementById('model-select');
    const modelInput = document.getElementById('model-input');
    const model = modelSelect.value === 'other' ? modelInput.value : modelSelect.value;
    let max_tokens = document.getElementById('max-tokens-slider').value;

    return {
        headers,
        body: JSON.stringify({
            model,
            messages,
            max_tokens: parseInt(max_tokens),
            temperature: parseFloat(temperature),
            stream
        })
    };
}

async function callchatAPI(messages, stream = false) {
    shouldContinue = true;

    // Update aiResponding and the button
    aiResponding = true;
    document.querySelector('#regen-button use').setAttribute('xlink:href', '#pause-icon');

    // Show loading icon
    document.getElementById("aiLoadingIcon").style.display = 'block';

    // Hide error icon in case it was previously shown
    document.getElementById("aiErrorIcon").style.display = 'none';

    console.log("Messages sent to API:", messages);
    console.log("Token count for messages:", getTokenCount(messages));

    const API_URL = "https://api.openai.com/v1/chat/completions";
    const params = getAPIParams(messages, stream);
    if (!params) return;

    controller = new AbortController();
    let requestOptions = {
        method: "POST",
        headers: params.headers,
        body: params.body,
        signal: controller.signal,
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error calling ChatGPT API:", errorData);
            document.getElementById("aiErrorIcon").style.display = 'block';
            failCounter++;
            if (failCounter >= MAX_FAILS) {
                console.error("Max attempts reached. Stopping further API calls.");
                shouldContinue = false;
                controller.abort();
                return "An error occurred while processing your request.";
            }
        } else {
            failCounter = 0;
        }

        if (stream) {
            let currentResponse = await handleStreamingResponse(response);
            return currentResponse;
        } else {
            const data = await response.json();
            console.log("Token usage:", data.usage);
            return data.choices[0].message.content.trim();
        }
    } catch (error) {
        console.error("Error calling ChatGPT API:", error);
        document.getElementById("aiErrorIcon").style.display = 'block';
        failCounter++;
        if (failCounter >= MAX_FAILS) {
            console.error("Max attempts reached. Stopping further API calls.");
            shouldContinue = false;
            return "An error occurred while processing your request.";
        }
    } finally {
        aiResponding = false;
        document.querySelector('#regen-button use').setAttribute('xlink:href', '#refresh-icon');
        document.getElementById("aiLoadingIcon").style.display = 'none';
    }
}
