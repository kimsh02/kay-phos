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
          const response = await fetch("/public/html/phosphorous_potassium_intake_with_time.csv");
          if (!response.ok) {
            console.error("Failed to fetch CSV. Status:", response.status);
            return;
          }
          const csvText = await response.text();
          const parsedData = parseCSV(csvText);
          const selectedDate = document.getElementById("currentDate").value;
          const todayRecords = parsedData.filter(item => {
            const recordDate = parseCSVDate(item.DateTime);
            const formattedRecordDate = formatDateInput(recordDate);
            return formattedRecordDate === selectedDate;
          });
          const tbody = document.getElementById("existingEntriesBody");
          tbody.innerHTML = "";
          todayRecords.forEach(record => {
            console.log("Adding Record to Table:", record);
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${record.DateTime}</td>
                            <td>${record.Food || ""}</td>
                            <td>${record.Phosphorous || ""}</td>
                            <td>${record.Potassium || ""}</td>`;
            tbody.appendChild(tr);
          });
          console.log("Parsed Data:", parsedData)
        } catch (error) {
          console.error("Error loading existing entries:", error);
        }
      }

      async function commitUpdate() {
        const dateValue = document.getElementById("currentDate").value;
        const foodEntries = document.getElementsByClassName("foodEntry");
        const phosphorusEntries = document.getElementsByClassName("phosphorusEntry");
        const potassiumEntries = document.getElementsByClassName("potassiumEntry"); // Add this line
        let newEntries = [];
        for (let i = 0; i < foodEntries.length; i++) {
          const food = foodEntries[i].value;
          const phosphorus = phosphorusEntries[i].value;
          const potassium = potassiumEntries[i].value; // Collect Potassium value
          if (phosphorus === "" && potassium === "") continue; // Skip if neither is provided
          newEntries.push({
            DateTime: formatDateTime(new Date()),
            Food: food,
            Phosphorous: Number(phosphorus),
            Potassium: Number(potassium) // Add Potassium here
          });
        }
        const dataPayload = {
          date: dateValue,
          entries: newEntries
        };
        console.log("Commit Update Data:", dataPayload);
        setTimeout(() => {
          alert("Meal history updated successfully! (Simulation)");
          loadExistingEntries();
        }, 1000);
      }