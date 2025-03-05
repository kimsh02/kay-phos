// Global variables
let queuedImageArray = [],
    queuedForm = document.querySelector("#queued-form"),
    queuedDiv = document.querySelector(".queued-div"),
    inputDiv = document.querySelector(".input-div"),
    input = document.querySelector(".input-div input"),
    serverMessage = document.querySelector(".server-message");

// Your authentication data - TODO: Store securely
const authData = {
    access_token: "",
    customer_id:  ""
};


// TODO Secure
async function getAccessToken() {
    try {
        // Your license key - replace with your actual key
        const licenseKey = 'ixrxejs4jxWKxVYjkZ1SaPjRHPDNk4LWHfj0tjym';

        // Construct the token request URL
        const tokenUrl = `https://api.passiolife.com/v2/token-cache/unified/oauth/token/${licenseKey}`;

        // Make the POST request to get the access token
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the response
        const tokenData = await response.json();

        // Return an object with both access token and customer ID
        return {
            access_token: tokenData.access_token,
            customer_id: tokenData.customer_id,
            expires_in: tokenData.expires_in,
            token_type: tokenData.token_type
        };
    } catch (error) {
        console.error('Failed to retrieve access token:', error);
        // You might want to handle this error more gracefully in your application
        throw error;
    }
}
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
        images += `<div class="image" data-index="${index}">
                    <img src="${URL.createObjectURL(image)}" alt="image">
                    <span class="delete-image">&times;</span>
                    </div>`;
    });
    queuedDiv.innerHTML = images;
}

// Add event delegation for delete functionality
queuedDiv.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.delete-image');
    if (deleteButton) {
        const imageContainer = deleteButton.closest('.image');
        const index = parseInt(imageContainer.dataset.index, 10);
        deleteQueuedImage(index);
    }
});

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
// Convert image to base64
function convertImageToBase64(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Upload image and start conversation
async function startConversationWithImage(imageFile) {
    console.log("📤 Sending file to API:", imageFile.name);
    let token_data;
    try {
        token_data = await getAccessToken();
        authData.access_token = token_data.access_token;
        authData.customer_id = token_data.customer_id
    } catch (error) {
        // Handle token retrieval error
        displayServerMessage('Failed to refresh access token', 'error');
    }

    const base64Image = await convertImageToBase64(imageFile);
    const accessToken = authData.access_token;

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Passio-ID": authData.customer_id,
        "Content-Type": "application/json"
    };

    const url = "https://api.passiolife.com/v2/products/nutrition-advisor/threads";

    try {
        const response = await fetch(url, { method: "POST", headers });
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);

        const result = await response.json();
        console.log("✅ Thread Created:", result);

        if (result.threadId) {
            const messageId = await sendMessageToThread(result.threadId, base64Image, accessToken);
            console.log("⏳ Waiting for API to process image...");
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay

            if (messageId) await runVisualFoodExtraction(result.threadId, messageId, accessToken);
        }
    } catch (error) {
        console.error("❌ Error in API request:", error);
    }
}

// Send a message to the created thread with the image
async function sendMessageToThread(threadId, base64Image, accessToken) {
    const toolname = "VisualFoodExtraction";
    const url = `https://api.passiolife.com/v2/products/nutrition-advisor/threads/${threadId}/messages/tools/vision/${toolname}`;
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Passio-ID": authData.customer_id,
        "Content-Type": "application/json"
    };

    const requestBody = {
        "message": null,
        "image": base64Image
    };

    try {
        const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(requestBody) });
        if (!response.ok) throw new Error(`Error sending message: ${response.status}`);

        const result = await response.json();
        console.log("✅ Image Processed Successfully:", result);

        if (result.actionResponse?.data) {
            let extractedData = JSON.parse(result.actionResponse.data);
            console.log("✅ Extracted Food Data:", extractedData);
            displayExtractedFood(extractedData);
        } else {
            console.warn("⚠️ No extracted food data found.");
        }

        return result.messageId;
    } catch (error) {
        console.error("❌ Error processing image:", error);
        return null;
    }
}


// Display extracted food items
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
