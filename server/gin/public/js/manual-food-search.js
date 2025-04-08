let allResults = []; // Store all fetched results so we can sort/filter without re-fetching

document.addEventListener("DOMContentLoaded", function () {
  renderRecentSearches();

  document.getElementById("searchButton").addEventListener("click", handleSearch);
  document.getElementById("sortSelect").addEventListener("change", applyFilters);
});

document.addEventListener("click", function (e) {
  if (e.target.closest("#recentContainer li")) {
    document.getElementById("queryInput").value = e.target.textContent;
    handleSearch();
  }
});

// Handle the user's search action
async function handleSearch() {
  const query = document.getElementById('queryInput').value; // Get user input from the text box
  if (!query) return; // Prevent empty search
  saveToRecent(query);
   // Call API (mocked here)
  allResults = await fetchNutrientData(query); // Store the results globally
  renderResults(allResults); // Display the results on the page
}

// Apply sorting filters when a user selects a category
function applyFilters() {
  const sortBy = document.getElementById('sortSelect').value; // Get selected sort option
  let sortedResults = [...allResults]; // Copy original results to avoid mutation

  // Sort logic based on selected value
  switch (sortBy) {
    case "calories-asc":
      sortedResults.sort((a, b) => a.calories - b.calories);
      break;
    case "calories-desc":
      sortedResults.sort((a, b) => b.calories - a.calories);
      break;
    case "protein-desc":
      sortedResults.sort((a, b) => b.protein - a.protein);
      break;
    case "phosphorus-desc":
      sortedResults.sort((a, b) => b.phosphorus - a.phosphorus);
      break;
    case "potassium-desc":
      sortedResults.sort((a, b) => b.potassium - a.potassium);
      break;
    case "carbs-desc":
      sortedResults.sort((a, b) => b.carbs - a.carbs);
      break;
  }

  renderResults(sortedResults); // Display sorted results
}

// Render results as cards inside the results container
function renderResults(results) {
  const container = document.getElementById('resultsContainer');
  container.innerHTML = '';

  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'result-card';

    const foodData = JSON.stringify(item).replace(/'/g, "&#39;"); // escape quotes for safety

    card.innerHTML = `
      <h3>${item.name}</h3>
      <ul>
        <li><strong>Calories:</strong> ${item.calories}</li>
        <li><strong>Protein:</strong> ${item.protein}g</li>
        <li><strong>Phosphorus:</strong> ${item.phosphorus}mg</li>
        <li><strong>Potassium:</strong> ${item.potassium}mg</li>
        <li><strong>Carbs:</strong> ${item.carbs}g</li>
      </ul>
      <button class="add-to-meal" data-food='${foodData}'>Add to Meal History</button>
    `;

    container.appendChild(card); // Add card to the results container
  });
}
// Event delegation to handle all "Add to Meal" buttons
document.addEventListener("click", async function (e) {
  if (e.target.classList.contains("add-to-meal")) {
    const foodItem = JSON.parse(e.target.dataset.food);
    await addToMealHistory(foodItem);
  }
});

// api call function to backend
async function fetchNutrientData(query) {
  const res = await fetch(`/dashboard/search-food?q=${encodeURIComponent(query)}`, { credentials: "include" });
  const json = await res.json();
  return json.results.map(item => ({
    name: item.Description,
    calories: 0, // optionally populate later
    protein: 0,  // optionally populate later
    phosphorus: item["Phosphorus (mg)"],
    potassium: item["Potassium (mg)"],
    carbs: 0
  }));
}

//Recent Search Functionality
function saveToRecent(query) {
  let recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
  recent = [query, ...recent.filter(q => q !== query)].slice(0, 5); // max 5 items
  localStorage.setItem("recentSearches", JSON.stringify(recent));
}

function renderRecentSearches() {
  const container = document.getElementById("recentContainer");
  const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");

  container.innerHTML = recent.map(q => `<li data-query="${q}">${q}</li>`).join("");
}
document.addEventListener("click", function (e) {
  const li = e.target.closest("#recentContainer li");
  if (li) {
    document.getElementById("queryInput").value = li.dataset.query;
    handleSearch();
  }
});


//add to meal histroy function
async function addToMealHistory(item) {
  const response = await fetch("/dashboard/foodcode?name=" + encodeURIComponent(item.name), { credentials: "include" });
  const data = await response.json();

  if (!data.foodCode) {
    alert("Could not find food code for: " + item.name);
    return;
  }

  await fetch("/dashboard/api/user-meal-history", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entries: [{ foodCode: data.foodCode, time: new Date().toISOString() }]
    })
  });

  alert("Added to meal history!");
}

