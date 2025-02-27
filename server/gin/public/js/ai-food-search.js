// Global variables
let queuedImageArray = [],
    queuedForm = document.querySelector("#queued-form"),
    queuedDiv = document.querySelector(".queued-div"),
    inputDiv = document.querySelector(".input-div"),
    input = document.querySelector(".input-div input"),
    serverMessage = document.querySelector(".server-message");

// Your authentication data - TODO: Store securely
const authData = {
access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ind0V0V4NmVjc0dGMzZ1N3dfcVlCbyJ9.eyJpc3MiOiJodHRwczovL3Bhc3Npby51cy5hdXRoMC5jb20vIiwic3ViIjoiZVI0bUxVbmNKTVRqbENiWkxZd3ZERlU1cE9SOHE0bldAY2xpZW50cyIsImF1ZCI6InVuaWZpZWQiLCJpYXQiOjE3NDA2MDc4MzIsImV4cCI6MTc0MDY5NDIzMiwic2NvcGUiOiJyZWFkOmh1YiB3cml0ZTpodWIiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJlUjRtTFVuY0pNVGpsQ2JaTFl3dkRGVTVwT1I4cTRuVyJ9.x5xLEyVYdBC2sFN3QbGmj8OKSYw8NkqXoybcrTQATEgoKZHrkeG1gmOBzl31xtmbqK-cxOfiNXV7P606-Ekt0ly-qd2TA6ExFTgDhulToscn42ANaaYVyNAnNWqnzWEff6GZMD48TEluqc1wkuWnPboPO3qWfW_vnmBSbsbVJxH0sOlDVOsqLRQ902CIeOsoxcz0IEJx48R2Z4n2CF4HS2qRwtYLhvJgkcdVKVsVZWr7_rni2hrPs60klEVGQbFP7cxB-JmQlZap9e2JjJ4Evs1kA7f6mpvDFUjY7Ueft-3a4z0s5V58UnE5NAIL1NN3KaM20V1emt6-yFDizKeWjQ..eyJjdXN0b21lcklkIjoiODRmNjI2MTItZWYwYS0xMWVmLTk5MTktMWU3OTFmMzBmMWQxIiwibGljZW5zZUtleSI6Iml4cnhlanM0anhXS3hWWWprWjFTYVBqUkhQRE5rNExXSGZqMHRqeW0iLCJsaWNlbnNlUHJvZHVjdCI6InVuaWZpZWQifQ==", // Bearer Token    customer_id: "YOUR_CUSTOMER_ID_HERE"
};

// Store analysis results
let analysisResults = [];

// Ensure input element exists before adding event listener
if (input) {
    input.addEventListener("change", () => {
        const files = input.files;
        for (let i = 0; i < files.length; i++) {
            queuedImageArray.push(files[i]);
        }
        queuedForm.reset();
        displayQueuedImages();
    });
}

// Display queued images
function displayQueuedImages() {
    let images = "";
    queuedImageArray.forEach((image, index) => {
        images += `<div class="image">
                    <img src="${URL.createObjectURL(image)}" alt="image">
                    <span onclick="deleteQueuedImage(${index})">&times;</span>
                    </div>`;
    });
    queuedDiv.innerHTML = images;
}

// Delete queued image
function deleteQueuedImage(index) {
    queuedImageArray.splice(index, 1);
    displayQueuedImages();
}

// Listen for form submission
if (queuedForm) {
    queuedForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (queuedImageArray.length === 0) {
            displayServerMessage("Please select at least one image to upload", "error");
            return;
        }

        displayServerMessage("Analyzing images, please wait...", "info");
        analysisResults = [];

        try {
            for (const image of queuedImageArray) {
                const result = await startConversationWithImage(image);
                analysisResults.push(result);
            }

            displayServerMessage(`Successfully processed ${analysisResults.length} images!`, "success");
            queuedImageArray = [];
            displayQueuedImages();

        } catch (error) {
            console.error("API error:", error);
            displayServerMessage(`Processing failed: ${error.message}`, "error");
        }
    });
}

// Upload image and start conversation
async function startConversationWithImage(imageFile) {
    console.log("📤 Sending file to API:", imageFile.name);

    const formData = new FormData();
    formData.append("image", imageFile);

    const headers = {
        "Authorization": `Bearer ${authData.access_token.trim()}`,
        "Content-Type": "application/json"
    };

    const url = "https://api.passiolife.com/v2/products/nutrition-advisor/threads";

    try {
        const response = await fetch(url, { method: "POST", headers: headers, body: formData });

        console.log("🔄 API Response Status:", response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("✅ Thread Created:", result);

        if (result.threadId) {
            console.log("📝 Sending message to thread...");
            const messageId = await sendMessageToThread(result.threadId);
            if (messageId) {
                console.log("⏳ Running VisualFoodExtraction tool...");
                await runVisualFoodExtraction(result.threadId, messageId);
            } else {
                console.warn("⚠️ No messageId received, cannot run tool.");
            }
        } else {
            console.warn("⚠️ No threadId returned, check API docs.");
        }
    } catch (error) {
        console.error("❌ Error in API request:", error);
    }
}

async function sendMessageToThread(threadId) {
    const url = `https://api.passiolife.com/v2/products/nutrition-advisor/threads/${threadId}/messages`;
    const headers = {
        "Authorization": `Bearer ${authData.access_token.trim()}`,
        "Content-Type": "application/json"
    };

    const requestBody = {
        "message": "", // Empty message, just to create a valid message entry
        "inputSensors": ["VisualFoodExtraction"] // Ensure tool is suggested
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Error sending message to thread: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log("✅ Message Sent to Thread:", result);

        return result.messageId; // Needed to execute the tool
    } catch (error) {
        console.error("❌ Error sending message to thread:", error);
        return null;
    }
}




async function runVisualFoodExtraction(threadId, messageId) {
    if (!messageId) {
        console.error("❌ No messageId available, cannot run VisualFoodExtraction.");
        return;
    }

    const url = `https://api.passiolife.com/v2/products/nutrition-advisor/threads/${threadId}/messages`;
    const headers = {
        "Authorization": `Bearer ${authData.access_token.trim()}`,
        "Content-Type": "application/json"
    };

    const requestBody = {
        "messageId": messageId,
        "toolName": "VisualFoodExtraction"
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Error executing VisualFoodExtraction: ${response.status} ${response.statusText}`);
        }

        console.log("✅ Tool executed successfully. Fetching results...");
        await fetchThreadResults(threadId);
    } catch (error) {
        console.error("❌ Error executing tool:", error);
    }
}




async function fetchThreadResults(threadId, retries = 10, delay = 2000) {
    const url = `https://api.passiolife.com/v2/products/nutrition-advisor/threads/${threadId}/messages`;
    const headers = {
        "Authorization": `Bearer ${authData.access_token.trim()}`,
        "Content-Type": "application/json"
    };

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            let response = await fetch(url, { method: "POST", headers: headers });

            if (!response.ok) {
                throw new Error(`Error fetching thread: ${response.status} ${response.statusText}`);
            }

            let result = await response.json();
            console.log(`🔄 Attempt ${attempt + 1}: Thread Response Data:`, result);

            if (result.actionResponse && result.actionResponse.data) {
                let extractedData = JSON.parse(result.actionResponse.data);
                console.log("✅ Extracted Food Data:", extractedData);
                displayExtractedFood(extractedData);
                return;
            }

            console.warn("⚠️ No valid content yet, retrying...");
            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error) {
            console.error("❌ Error fetching thread results:", error);
            return;
        }
    }

    console.error("❌ Max retries reached, no valid response.");
}




// Handle Nutrition Advisor API response
// async function handleAdvisorResponse(response) {
//     console.log("Full API Response:", response); // Debugging log
//
//     if (response && response.content) {
//         console.log("Advisor Response:", response.content);
//         displayResults(response.content);
//     } else {
//         console.warn("No valid content received. API Response:", response);
//         displayServerMessage("No valid results from API.", "error");
//     }
// }


// Display results on screen
function displayExtractedFood(foodItems) {
    let resultsDiv = document.querySelector(".results-div");
    if (!resultsDiv) return;

    let htmlContent = "<h3>Identified Food Items</h3><ul>";
    foodItems.forEach(item => {
        htmlContent += `<li><strong>${item.ingredientName}</strong> - ${item.weightGrams}g</li>`;
    });
    htmlContent += "</ul>";

    resultsDiv.innerHTML = htmlContent;
}



// Display server messages with appropriate styling
function displayServerMessage(message, type) {
    if (!serverMessage) return;
    serverMessage.textContent = message;
    serverMessage.classList.remove("error", "success", "info");
    serverMessage.classList.add(type);
}
