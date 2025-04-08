document.addEventListener("DOMContentLoaded", function () {
        let today = new Date();
        document.getElementById("currentDate").value = formatDateInput(today);
        loadExistingEntries();
        document.getElementById("currentDate").addEventListener("change", function () {
          console.log("Date changed to:", this.value);
          loadExistingEntries();
        });
        document.getElementById("addEntryButton").addEventListener("click", function (event) {
          event.preventDefault();
          addEntry();
        });
        document.getElementById("commitButton").addEventListener("click", function (event) {
          event.preventDefault();
          commitUpdate();
        });
      });

      function formatDateInput(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
      }

      function formatDateTime(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${month}/${day}/${year} ${hours}:${minutes}`;
      }

      function parseCSVDate(dateStr) {
        const parts = dateStr.split(" ");
        const datePart = parts[0];
        const timePart = parts[1] || "00:00";
        const dateItems = datePart.split("/");
        const month = parseInt(dateItems[0], 10);
        const day = parseInt(dateItems[1], 10);
        const year = parseInt(dateItems[2], 10);
        const timeItems = timePart.split(":");
        const hour = parseInt(timeItems[0], 10);
        const minute = parseInt(timeItems[1], 10);
        return new Date(year, month - 1, day, hour, minute);
      }

      let entryCount = 1;
      const maxEntries = 15;

      function addEntry() {
        if (entryCount < maxEntries) {
          entryCount++;
          const entryContainer = document.getElementById("entriesContainer");
          const newEntryDiv = document.createElement("div");
          newEntryDiv.className = "entryRow";
          newEntryDiv.innerHTML =
            `<div>
               <label>Food Name:</label>
               <input type="text" name="food${entryCount}" class="foodEntry">
             </div>
             <div>
               <label>Phosphorous (mg):</label>
               <input type="number" name="phosphorus${entryCount}" class="phosphorusEntry" required>
             </div>
             <div>
               <label>Potassium (mg):</label>
               <input type="number" name="potassium${entryCount}" class="potassiumEntry" required>
             </div>
          `;
          entryContainer.appendChild(newEntryDiv);
        } else {
          alert(`Maximum of ${maxEntries} entries reached.`);
        }
      }

      function parseCSV(csvText) {
        const lines = csvText.trim().split("\n");
        const header = lines[0].split(",").map(h => h.trim());
        const records = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line !== "") {
            const values = line.split(",").map(v => v.trim());
            const record = {
              DateTime: values[0],
              Phosphorous: Number(values[1]),
              Potassium: Number(values[2]),
              Food: values[3] || "" // Handle empty Food fields
            };
            records.push(record);
          }
        }
        return records;
      }



async function loadExistingEntries() {
  try {
    const response = await fetch("/dashboard/api/user-meal-history");
    if (!response.ok) {
      console.error("Failed to fetch meal history.");
      return;
    }
    const meals = await response.json();

    const tbody = document.getElementById("existingEntriesBody");
    tbody.innerHTML = "";

    if (meals.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4">No meals recorded yet.</td>`;
      tbody.appendChild(tr);
    } else {
      meals.forEach(record => {
        const tr = document.createElement("tr");
        const timeStr = new Date(record.time).toISOString(); // preserve exact timestamp

        tr.innerHTML = `<td>${new Date(record.time).toLocaleString()}</td>
                <td>${record.description}</td>
                <td>${record.phosphorus}</td>
                <td>${record.potassium}</td>
                <td><button class="deleteBtn">Delete</button></td>`;

        tbody.appendChild(tr);
        const deleteBtn = tr.querySelector(".deleteBtn");
        const timestamp = new Date(record.time).toISOString();
        deleteBtn.addEventListener("click", () => deleteMeal(record.foodCode, timestamp));
      });
    }
  } catch (error) {
    console.error("Error loading existing entries:", error);
  }
}


async function commitUpdate() {
  const dateValue = document.getElementById("currentDate").value;
  const foodEntries = document.getElementsByClassName("foodEntry");
  const phosphorusEntries = document.getElementsByClassName("phosphorusEntry");
  const potassiumEntries = document.getElementsByClassName("potassiumEntry");

  let payloadEntries = [];

  for (let i = 0; i < foodEntries.length; i++) {
    const foodName = foodEntries[i].value.trim();
    if (!foodName) continue;

    // Fetch foodCode from server
    try {
      const res = await fetch(`/dashboard/foodcode?name=${encodeURIComponent(foodName)}`);
      if (!res.ok) {
        console.warn(`Food not found: ${foodName}`);
        continue;
      }
      const { foodCode } = await res.json();

      // Prepare timestamp
      const mealTime = new Date().toISOString(); // UTC ISO format

      payloadEntries.push({
        foodCode: foodCode,
        time: mealTime
      });
    } catch (err) {
      console.error(`Error fetching foodCode for ${foodName}:`, err);
    }
  }

  if (payloadEntries.length === 0) {
    alert("No valid food entries to submit.");
    return;
  }

  const body = JSON.stringify({ entries: payloadEntries });

  try {
    const response = await fetch("/dashboard/api/user-meal-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body
    });

    if (response.ok) {
      alert("Meal history updated successfully!");
      loadExistingEntries();
    } else {
      const errorText = await response.text();
      console.error("Failed to save meals:", errorText);
      alert("Failed to update meal history.");
    }
  } catch (err) {
    console.error("Unexpected error saving meals:", err);
    alert("Unexpected error occurred.");
  }
}

async function deleteMeal(foodCode, time) {
  if (!confirm("Are you sure you want to delete this meal?")) return;

  try {
    const res = await fetch("/dashboard/user-meal-history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodCode, time })
    });

    const result = await res.json();
    console.log("Delete result:", result);

    if (res.ok) {
      alert("Meal deleted!");
      loadExistingEntries(); //this reloads the table
    } else {
      alert("Failed to delete meal: " + result.error);
    }
  } catch (err) {
    console.error("Error deleting meal:", err);
    alert("Unexpected error during delete.");
  }
}


