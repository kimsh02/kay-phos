// Global variables
let uploadedImage = null; // Store only one image
let analysisResults = []; // Store food analysis results
let selectedFoods = []; // Store selected foods
const inputDiv = document.querySelector(".input-div"),
    input = document.querySelector(".file"),
    serverMessage = document.querySelector(".server-message"),
    resultsDiv = document.querySelector(".results-div"),
    imagePreviewDiv = document.querySelector(".image-preview"),
    queuedForm = document.querySelector("#queued-form"),
    calculateButton = document.createElement("button"),
    saveMealButton = document.createElement("button"),
    resultsButtonWrapper = document.createElement("div");

// Setup "Calculate Intake" button
calculateButton.textContent = "Calculate Nutrient Intake";
calculateButton.classList.add("calculate-intake");
calculateButton.style.display = "none"; // Hide until needed
calculateButton.addEventListener("click", sendSelectedFoodsToDB);


// Create "Save Meal to History" button
saveMealButton.textContent = "Save to Favorites";
saveMealButton.classList.add("save-meal");
saveMealButton.style.display = "none"; // Hide until needed
saveMealButton.addEventListener("click", saveMealToHistory); // Attach event listener

// Creat "Log Meal" button
const logMealButton = document.createElement("button");
logMealButton.textContent = "Log This Meal";
logMealButton.classList.add("log-meal");
logMealButton.style.display = "none"; // Initially hidden
logMealButton.addEventListener("click", async () => {
    if (selectedFoods.length === 0) {
        displayServerMessage("Please select at least one food item to log.", "error");
        return;
    }

    const mealName = prompt("Enter a name for this meal:") || `AI Meal - ${new Date().toISOString().split("T")[0]}`;

    const ingredients = selectedFoods.map(item => ({
        name: item.ingredientName,
        foodCode: 0,
        grams: item.weightGrams || 0,
        calories: item.calories || 0,
        protein: item.protein || 0,
        phosphorus: item.phosphorus || 0,
        potassium: item.potassium || 0,
        carbs: item.carbs || 0
    }));

    const payload = {
        mealName,
        time: new Date().toISOString(),
        mealType: "history", // ✅ key difference
        ingredients
    };

    try {
        const res = await fetch("/dashboard/api/user-meal-history", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await res.text();
        if (!res.ok) {
            console.error("❌ Failed to log meal:", result);
            throw new Error(result);
        }

        displayToast("✅ Meal logged to history!", "success");
        setTimeout(() => {
            window.location.href = "/dashboard/user-meal-history";
        }, 1500);
    } catch (err) {
        console.error("❌ Error logging meal:", err);
        displayServerMessage("Something went wrong logging the meal.", "error");
    }
});



resultsButtonWrapper.classList.add("results-buttons");


// Append both buttons inside the wrapper
resultsButtonWrapper.appendChild(saveMealButton);
resultsButtonWrapper.appendChild(calculateButton);
resultsButtonWrapper.appendChild(logMealButton);


// Append the wrapper inside the results container
document.querySelector(".results-container").appendChild(resultsButtonWrapper);



// Handle file input and display single image
if (input) {
    input.addEventListener("change", () => {
        if (input.files.length > 0) {
            uploadedImage = input.files[0]; // Store the first image
        }
        input.value = ""; // Reset input field
        displayImage();
    });
}
//Browse span click triggering the file picker
const browseSpan = document.querySelector(".browse");
if (browseSpan && input) {
    browseSpan.addEventListener("click", () => input.click());
}

// Display only one uploaded image
function displayImage() {
    imagePreviewDiv.innerHTML = ""; // Clear previous images
    if (uploadedImage) {
        const imageURL = URL.createObjectURL(uploadedImage);
        imagePreviewDiv.innerHTML = `
            <div class="image-container">
                <img src="${imageURL}" alt="uploaded image">
                <button class="delete-image">&times;</button>
            </div>`;

        // Add event listener for delete button
        const deleteBtn = document.querySelector(".delete-image");
        if(deleteBtn)
            deleteBtn.addEventListener("click", deleteImage)
    }
}

// Remove the uploaded image
function deleteImage() {
    uploadedImage = null; // Clear stored image
    imagePreviewDiv.innerHTML = ""; // Clear preview
}

// Handle form submission (image upload)
if (queuedForm) {
    queuedForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!uploadedImage) {
            displayServerMessage("Please select an image to upload", "error");
            return;
        }

        displayServerMessage("Analyzing image, please wait...", "info");

        try {
            let result = await startConversationWithImage(uploadedImage);
            if (result) {
                analysisResults = result; // Store analysis results
                displayAnalysisResults(); // Display results in table
                displayServerMessage(`Image processed successfully!`, "success");
            }
        } catch (error) {
            console.error("API error:", error);
            displayServerMessage(`Processing failed: ${error.message}`, "error");
        }
    });
}

// Display analysis results with clickable rows
function displayAnalysisResults() {
    resultsDiv.innerHTML = "";

    // Ensure analysisResults is an array before proceeding
    if (!Array.isArray(analysisResults) || analysisResults.length === 0) {
        resultsDiv.innerHTML = "<p>No food items detected.</p>";
        calculateButton.style.display = "none"; // Hide button if no items
        return;
    }

    let headerHTML = `<h3 class="table-header">Identified Food Items</h3>`;


    let table = `<table class="analysis-table">
                    <thead>
                        <tr>
                            <th>Food Item</th>
                            <th>Weight (g)</th>
                        </tr>
                    </thead>
                    <tbody>`;

    analysisResults.forEach((item, index) => {
        table += `<tr class="food-row" data-index="${index}">
                    <td>${item.ingredientName}</td>
                    <td>${item.weightGrams}g</td>
                  </tr>`;
    });

    table += `</tbody></table>`;
    resultsDiv.innerHTML = headerHTML + table;

    // Ensure the "Calculate Intake" button appears
    calculateButton.style.display = "flex";
    saveMealButton.style.display = "flex";
    logMealButton.style.display = "flex";

    // Re-attach click event listeners to food rows
    document.querySelectorAll(".food-row").forEach(row => {
        row.addEventListener("click", toggleSelection);
    });
}

// Toggle selection on click (highlight row)
function toggleSelection(event) {
    let row = event.currentTarget;
    let index = parseInt(row.dataset.index, 10);
    let foodItem = analysisResults[index];

    // Check if already selected
    let selectedIndex = selectedFoods.findIndex(item => item.ingredientName === foodItem.ingredientName);

    if (selectedIndex === -1) {
        // Add to selected items
        selectedFoods.push(foodItem);
        row.classList.add("selected");
    } else {
        // Remove from selected items
        selectedFoods.splice(selectedIndex, 1);
        row.classList.remove("selected");
    }
}


const authData = {
    access_token: "",
    customer_id:  ""
};

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
    displayServerMessage("Analyzing image, please wait...", "info")
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
            const extractedData = await sendMessageToThread(result.threadId, base64Image, accessToken);
            console.log("⏳ Waiting for API to process image...");
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
            return extractedData;

        }
    } catch (error) {
        console.error("❌ Error in API request:", error);
    }
}

// Send a message to the created thread with the image
async function sendMessageToThread(threadId, base64Image, accessToken) {
    const toolName = "VisualFoodExtraction";
    const url = `https://api.passiolife.com/v2/products/nutrition-advisor/threads/${threadId}/messages/tools/vision/${toolName}`;
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
            return extractedData;
        } else {
            console.warn("⚠️ No extracted food data found.");
        }


    } catch (error) {
        console.error("❌ Error processing image:", error);
        return null;
    }
}

// save meal functionality
async function saveMealToHistory() {
    if (selectedFoods.length === 0) {
        displayServerMessage("Please select at least one food item to save.", "error");
        return;
    }

    const mealName = prompt("Enter a name for this meal:");
    if (!mealName) {
        displayServerMessage("Meal name is required.", "error");
        return;
    }

    const ingredients = selectedFoods.map(item => ({
        name: item.ingredientName,
        foodCode: 0,
        grams: item.weightGrams || 0,
        calories: item.calories || 0,
        protein: item.protein || 0,
        phosphorus: item.phosphorus || 0,
        potassium: item.potassium || 0,
        carbs: item.carbs || 0
    }));


    const payload = {
        mealName,
        time: new Date().toISOString(),
        mealType: "favorite",
        ingredients
    };
    console.log("🚀 Sending payload:", JSON.stringify(payload, null, 2));


    try {
        const postRes = await fetch("/dashboard/api/user-meal-history", {
            method: "POST",
            credentials: "include", // Ensure cookies are sent
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!postRes.ok) {
            const errText = await postRes.text();
            throw new Error(errText);
        }

        displayToast("✅ Meal saved successfully!", "success");

// 🧭 Redirect to meal history page after short delay
        setTimeout(() => {
            window.location.href = "/dashboard/user-define-meal";
        }, 1500);
    } catch (error) {
        console.error("❌ Error saving meal:", error);
        displayServerMessage("Something went wrong saving the meal.", "error");
    }
}




async function sendSelectedFoodsToDB() {
    if (selectedFoods.length === 0) {
        displayServerMessage("Please select at least one food item.", "error");
        return;
    }

    try {
        const response = await fetch('/dashboard/calculate-intake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedFoods })
        });

        const data = await response.json();

        // Merge nutrients into selectedFoods
        selectedFoods.forEach(sel => {
            const enriched = data.breakdown.find(b => b.ingredientName === sel.ingredientName);
            if (enriched) {
                sel.calories = enriched.calories || 0;
                sel.protein = enriched.protein || 0;
                sel.carbs = enriched.carbs || 0;
                sel.phosphorus = enriched.phosphorus || 0;
                sel.potassium = enriched.potassium || 0;
            }
        });

        saveMealButton.style.display = "flex";
        // Clear previous message and result div
        resultsDiv.innerHTML = "";

        // Show per-food breakdown
        let html = "<h3>Per-Item Nutrient Breakdown</h3><ul>";
        data.breakdown.forEach(item => {
            html += `<li><strong>${item.ingredientName}</strong> (${item.weightGrams}g): 
                     ${item.potassium}mg K, ${item.phosphorus}mg P,
                     ${item.calories} kcal, ${item.protein}g protein, ${item.carbs}g carbs</li>`;
        });
        html += "</ul>";

        // Show total summary
        html += `<h3>Total Dish Intake</h3><p>
                 Potassium: <strong>${data.totals.potassium}mg</strong><br>
                 Phosphorus: <strong>${data.totals.phosphorus}mg</strong><br>
                 Calories: <strong>${data.totals.calories}g</strong><br>
                 Protein: <strong>${data.totals.protein}g</strong><br>
                 Carbs: <strong>${data.totals.carbs}g</strong><br>
                 </p>`;

        resultsDiv.innerHTML = html;
        displayServerMessage("Calculated intake successfully!", "success");

    } catch (error) {
        console.error("❌ Error sending to database:", error);
        displayServerMessage("Database request failed.", "error");
    }
}


// Display messages
function displayServerMessage(message, type) {
    if (!serverMessage) return;
    serverMessage.textContent = message;
    serverMessage.classList.remove("error", "success", "info");
    serverMessage.classList.add(type);
}

function displayToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = `toast ${type}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function addLogButtonToCard(card, ingredients) {
    const logMealBtn = document.createElement("button");
    logMealBtn.textContent = "Log This Meal";
    logMealBtn.classList.add("save-meal");

    logMealBtn.addEventListener("click", () => {
        const mealName = prompt("Enter meal name:") || `AI Meal - ${new Date().toISOString().split("T")[0]}`;
        const ingredients = selectedFoods.map(item => ({
            name: item.ingredientName,
            foodCode: 0,
            grams: item.weightGrams || 0,
            calories: item.calories || 0,
            protein: item.protein || 0,
            phosphorus: item.phosphorus || 0,
            potassium: item.potassium || 0,
            carbs: item.carbs || 0
        }));

        const payload = {
            mealName,
            time: new Date().toISOString(),
            mealType: "history",
            ingredients
        };

        fetch("/dashboard/api/user-meal-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(() => {
                displayToast("Meal logged to history!", "success");
                window.location.href = "/dashboard/user-meal-history";
            })
            .catch(() => displayToast("Failed to log meal.", "error"));
    });
}

