// Global variables
let queuedImageArray = [],
    queuedForm = document.querySelector("#queued-form"),
    queuedDiv = document.querySelector(".queued-div"),
    inputDiv = document.querySelector(".input-div"),
    input = document.querySelector(".input-div input"),
    serverMessage = document.querySelector(".server-message");

// Your authentication data - TODO: Store securely
const authData = {
access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ind0V0V4NmVjc0dGMzZ1N3dfcVlCbyJ9.eyJpc3MiOiJodHRwczovL3Bhc3Npby51cy5hdXRoMC5jb20vIiwic3ViIjoiZVI0bUxVbmNKTVRqbENiWkxZd3ZERlU1cE9SOHE0bldAY2xpZW50cyIsImF1ZCI6InVuaWZpZWQiLCJpYXQiOjE3NDA4MDgxMzEsImV4cCI6MTc0MDg5NDUzMSwic2NvcGUiOiJyZWFkOmh1YiB3cml0ZTpodWIiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJlUjRtTFVuY0pNVGpsQ2JaTFl3dkRGVTVwT1I4cTRuVyJ9.WvbJ-Ysyjhckx3mGCu7WJ9_c2Bso-NHjQHX5hs53927n-PBSPUoqtqA__djO5XYB_WoZ_Uab1QuznZEw81jN3yKzLkPosvjl85tBVQS0w_mYNmX0Q5mR0I1MWhu3pFLBtaM70Yu5QSbKKWwX2Pfkx9Th6tZQ9ZXOZRUjnOMHOqjxuh_exfjd4_OJznIJWiYKAqTS_ocDE6lLhqvYH7X3xhRHO4Fi6wYi6rOMSgHcFt_mxKkNIIHhm0CG53wMiw8WgEFnPhWxnZqGgnKdR_YnedZNZb-r3MTDGgz9_jiJPLEHe0dVlwyj3CzlsfIatBJudOu6AKLYaHlJgRQLn7OGYQ..eyJjdXN0b21lcklkIjoiODRmNjI2MTItZWYwYS0xMWVmLTk5MTktMWU3OTFmMzBmMWQxIiwibGljZW5zZUtleSI6Iml4cnhlanM0anhXS3hWWWprWjFTYVBqUkhQRE5rNExXSGZqMHRqeW0iLCJsaWNlbnNlUHJvZHVjdCI6InVuaWZpZWQifQ==", // Bearer Token
customer_id: "84f62612-ef0a-11ef-9919-1e791f30f1d1"
};

// TODO Utility function to fetch a fresh access token
async function getAccessToken() {
    // Replace with actual token retrieval logic
    return "YOUR_NEW_ACCESS_TOKEN";
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
