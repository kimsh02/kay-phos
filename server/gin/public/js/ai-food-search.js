// Global variables
let queuedImageArray = [],
    queuedForm = document.querySelector("#queued-form"),
    queuedDiv = document.querySelector(".queued-div"),
    inputDiv = document.querySelector(".input-div"),
    input = document.querySelector(".input-div input"),
    serverMessage = document.querySelector(".server-message");

// Your authentication data - TODO store securely
const authData = {
    access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ind0V0V4NmVjc0dGMzZ1N3dfcVlCbyJ9.eyJpc3MiOiJodHRwczovL3Bh" +
        "c3Npby51cy5hdXRoMC5jb20vIiwic3ViIjoiZVI0bUxVbmNKTVRqbENiWkxZd3ZERlU1cE9SOHE0bldAY2xpZW50cyIsImF1ZCI6InVuaWZpZWQ" +
        "iLCJpYXQiOjE3Mzk5OTY2MDAsImV4cCI6MTc0MDA4MzAwMCwic2NvcGUiOiJyZWFkOmh1YiB3cml0ZTpodWIiLCJndHkiOiJjbGllbnQtY3JlZG" +
        "VudGlhbHMiLCJhenAiOiJlUjRtTFVuY0pNVGpsQ2JaTFl3dkRGVTVwT1I4cTRuVyJ9.Z_d7T816-Px0FbnQX-yhS0n-QGZb1TAUBbCzT0Pev2dA" +
        "B9K2qW3KrxzMhf_T2tMOpYOmoBo6vAFcZRO75lbmR2AOOvRsXULjAWACweuocFhQ46OlzMidXsWspsZWgrdYk9qaVfQfik7GQlDzPyRZcW5E613" +
        "coS-Tj1ux5eIKVtIqDnZeL3_ifackZOf5Tx_2pQFrMRyAMpj9UvwOiqKsw8mRCtIOBtR7tUw-t6Ow2vkUeFQn2mvIfnQVhDkhOTk6fSD9j1Y4MO" +
        "tOoE-bu5bAgI9QRzHgSCRAk-WuIYzOKrxVqD3QcFPJB_jJ02PTz8StDZGOLlsMvAZlI9SBSfTTuw..eyJjdXN0b21lcklkIjoiODRmNjI2MTItZ" +
        "WYwYS0xMWVmLTk5MTktMWU3OTFmMzBmMWQxIiwibGljZW5zZUtleSI6Iml4cnhlanM0anhXS3hWWWprWjFTYVBqUkhQRE5rNExXSGZqMHRqeW0i" +
        "LCJsaWNlbnNlUHJvZHVjdCI6InVuaWZpZWQifQ==", // Bearer Token
    customer_id: "YOUR_CUSTOMER_ID_HERE" // Customer ID
};

// Store analysis results with refCodes
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

// Handle drag and drop events (ensure inputDiv exists)
if (inputDiv) {
    inputDiv.addEventListener("drop", (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.startsWith('image/')) {
                if (queuedImageArray.every(image => image.name !== files[i].name)) {
                    queuedImageArray.push(files[i]);
                }
            }
        }
        displayQueuedImages();
    });

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        inputDiv.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Add visual feedback for drag events
    inputDiv.addEventListener('dragenter', () => inputDiv.classList.add('highlight'));
    inputDiv.addEventListener('dragleave', () => inputDiv.classList.remove('highlight'));
    inputDiv.addEventListener('drop', () => inputDiv.classList.remove('highlight'));
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

        try {
            const customMetadata = {
                uploadDate: new Date().toISOString(),
                uploadBatch: generateBatchId(),
                deviceInfo: navigator.userAgent
            };

            const encodedMetadata = btoa(JSON.stringify(customMetadata));
            analysisResults = [];

            for (const image of queuedImageArray) {
                const result = await uploadAndAnalyzeImage(image, encodedMetadata);
                analysisResults.push(result);
            }

            displayServerMessage(`Successfully processed ${analysisResults.length} images!`, "success");
            storeRefCodes(analysisResults);
            queuedImageArray = [];
            displayQueuedImages();

            console.log("Analysis results with refCodes:", analysisResults);

        } catch (error) {
            console.error("API error:", error);
            displayServerMessage(`Processing failed: ${error.message}`, "error");
        }
    });
}

// Generate a unique batch ID
function generateBatchId() {
    return 'batch_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
}

// Store reference codes in localStorage
function storeRefCodes(results) {
    const storedResults = JSON.parse(localStorage.getItem('analysisRefCodes') || '[]');
    const timestamp = new Date().toISOString();
    const newEntries = results.map(result => ({
        refCode: result.refCode,
        timestamp: timestamp,
        filename: result.filename || 'unknown'
    }));

    localStorage.setItem('analysisRefCodes', JSON.stringify([...newEntries, ...storedResults]));
}

// Upload and analyze a single image (Fixed field name 'video_file')
async function uploadAndAnalyzeImage(imageFile, encodedMetadata) {
    //TODO Handle encodedMetaData
    const formData = new FormData();
    formData.append('image', imageFile); // FIXED: Changed 'image' to 'video_file'
    formData.append('metadata', encodedMetadata);

    console.log("Uploading image:", imageFile.name);
    console.log("FormData content:");
    for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
    }

    const headers = {
        'Authorization': `Bearer ${authData.access_token}`,
        //TODO Customer Specific 'Passio-ID': authData.customer_id
    };

    const url = `https://api.passiolife.com/v2/products/napi/tools/vision/extractIngredientsAutoTyped`;

    const response = await fetch(url, {
        method: 'POST',
        headers: headers, // No need to set 'Content-Type' for FormData
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
        ...data,
        filename: imageFile.name
    };
}

// Retrieve an item using its reference code
async function retrieveByRefCode(refCode) {
    if (!refCode) {
        throw new Error("Invalid reference code");
    }

    const headers = {
        'Authorization': `Bearer ${authData.access_token}`,
        'Passio-ID': authData.customer_id
    };

    try {
        const response = await fetch(`https://api.passiolife.com/v2/reference/${refCode}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Retrieval failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error retrieving by refCode:", error);
        throw error;
    }
}

// Decode a reference code and extract metadata
function decodeRefCode(refCode) {
    try {
        const decodedString = atob(refCode);
        const decodedObject = JSON.parse(decodedString);
        return {
            decoded: decodedObject,
            metadata: decodedObject.metadata || {}
        };
    } catch (error) {
        console.error("Error decoding reference code:", error);
        return { decoded: null, metadata: {} };
    }
}

// Display server messages with appropriate styling
function displayServerMessage(message, type) {
    if (!serverMessage) return;

    serverMessage.textContent = message;
    serverMessage.classList.remove("error", "success", "info");
    serverMessage.classList.add(type);
}
