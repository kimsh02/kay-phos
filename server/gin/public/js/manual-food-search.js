let allResults = []; // Store all fetched results so we can sort/filter without re-fetching

// Handle the user's search action
async function handleSearch() {
  const query = document.getElementById('queryInput').value; // Get user input from the text box
  if (!query) return; // Prevent empty search

  const response = await fetchNutrientData(query); // Call API (mocked here)
  allResults = response; // Store the results globally
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
  container.innerHTML = ''; // Clear previous results

  // Loop through each result and create a styled card
  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'result-card';

    card.innerHTML = `
      <h3>${item.name}</h3>
      <ul>
        <li><strong>Calories:</strong> ${item.calories}</li>
        <li><strong>Protein:</strong> ${item.protein}g</li>
        <li><strong>Phosphorus:</strong> ${item.phosphorus}mg</li>
        <li><strong>Potassium:</strong> ${item.potassium}mg</li>
        <li><strong>Carbs:</strong> ${item.carbs}g</li>
      </ul>
    `;

    container.appendChild(card); // Add card to the results container
  });
}

// Mock API call function — replace this with real API integration
async function fetchNutrientData(query) {
  // Example mocked results — this should be replaced by a call to your real API
  return [
    {
      name: "Grilled Chicken Salad",
      calories: 350,
      protein: 30,
      phosphorus: 220,
      potassium: 400,
      carbs: 10
    },
    {
      name: "Avocado Toast",
      calories: 290,
      protein: 8,
      phosphorus: 110,
      potassium: 680,
      carbs: 32
    }
  ];
}
