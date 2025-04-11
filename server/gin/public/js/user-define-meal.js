document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("addIngredient").addEventListener("click", addIngredientRow);
  document.getElementById("saveMeal").addEventListener("click", saveMeal);

  const logBtn = document.createElement("button");
  logBtn.textContent = "Save & Log Meal";
  logBtn.classList.add("btn", "btn-success", "log-btn");

  logBtn.addEventListener("click", async () => {
    const mealName = document.getElementById("mealName").value || `User Meal - ${new Date().toISOString().split("T")[0]}`;
    const ingredients = getDefinedMealIngredients();

    if (!ingredients.length) {
      alert("Nothing to log.");
      return;
    }

    const now = new Date().toISOString();

    const favoritePayload = {
      mealName,
      time: now,
      mealType: "favorite",
      ingredients
    };

    const historyPayload = {
      mealName,
      time: now,
      mealType: "history",
      ingredients
    };

    try {
      const [favRes, logRes] = await Promise.all([
        fetch("/dashboard/api/user-meal-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(favoritePayload)
        }),
        fetch("/dashboard/api/user-meal-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(historyPayload)
        })
      ]);

      if (!favRes.ok || !logRes.ok) {
        const errMsg = await (favRes.ok ? logRes.text() : favRes.text());
        console.error("❌ One or both requests failed:", errMsg);
        alert("Meal save or log failed.");
        return;
      }

      alert("✅ Meal saved to favorites and logged to history!");
      updateTotals(); // Update totals and notify dynamically
      window.location.href = "/dashboard/user-meal-history";

    } catch (err) {
      console.error("❌ Save & Log error:", err);
      alert("Unexpected error occurred.");
    }
  });

  document.getElementById("userDefineMealControls").appendChild(logBtn);
  loadSavedMeals();
});

function addIngredientRow() {
  const tbody = document.getElementById("ingredientBody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" class="ingredient-name"></td>
    <td><input type="number" class="ingredient-grams"></td>
    <td><input type="number" class="ingredient-calories"></td>
    <td><input type="number" class="ingredient-protein"></td>
    <td><input type="number" class="ingredient-carbs"></td>
    <td><input type="number" class="ingredient-potassium"></td>
    <td><input type="number" class="ingredient-phosphorus"></td>
    <td><button type="button" onclick="removeRow(this)">Remove</button></td>
  `;
  tbody.appendChild(row);
}

function removeRow(button) {
  button.closest("tr").remove();
}

function getDefinedMealIngredients() {
  const rows = document.querySelectorAll("#ingredientBody tr");
  const ingredients = [];

  for (const row of rows) {
    const name = row.querySelector(".ingredient-name").value.trim();
    const grams = parseFloat(row.querySelector(".ingredient-grams").value);
    const calories = parseFloat(row.querySelector(".ingredient-calories").value);
    const protein = parseFloat(row.querySelector(".ingredient-protein").value);
    const carbs = parseFloat(row.querySelector(".ingredient-carbs").value);
    const potassium = parseFloat(row.querySelector(".ingredient-potassium").value);
    const phosphorus = parseFloat(row.querySelector(".ingredient-phosphorus").value);

    if (!name || isNaN(grams)) continue;

    ingredients.push({ name, grams, calories, protein, carbs, potassium, phosphorus });
  }

  return ingredients;
}

function updateTotals() {
  const ingredients = getDefinedMealIngredients();

  let totalPotassium = 0;
  let totalPhosphorus = 0;

  for (const ingredient of ingredients) {
    totalPotassium += ingredient.potassium || 0;
    totalPhosphorus += ingredient.phosphorus || 0;
  }

  const currentPotassium = parseFloat(localStorage.getItem("totalPotassium")) || 0;
  const currentPhosphorus = parseFloat(localStorage.getItem("totalPhosphorus")) || 0;

  const newTotalPotassium = currentPotassium + totalPotassium;
  const newTotalPhosphorus = currentPhosphorus + totalPhosphorus;

  localStorage.setItem("totalPotassium", newTotalPotassium);
  localStorage.setItem("totalPhosphorus", newTotalPhosphorus);

  // Notify the dashboard of updates
  localStorage.setItem("mealUpdated", "true");

  // Optionally, directly call the pie chart update function
  if (typeof updatePieCharts === "function") {
    updatePieCharts(newTotalPotassium, newTotalPhosphorus);
  }
}

async function saveMeal() {
  const mealName = document.getElementById("mealName").value.trim();
  if (!mealName) {
    alert("Please enter a meal name.");
    return;
  }

  const ingredients = getDefinedMealIngredients();

  if (ingredients.length === 0) {
    alert("Please add at least one valid ingredient.");
    return;
  }

  updateTotals(); // Ensure totals are updated before saving the meal

  const payload = {
    mealName,
    time: new Date().toISOString(),
    mealType: "favorite",
    ingredients
  };

  try {
    const res = await fetch("/dashboard/api/user-meal-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Error saving meal:", err);
      alert("Failed to save meal.");
      return;
    }

    alert("Meal saved successfully!");
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Something went wrong.");
  }
}

async function loadSavedMeals() {
  try {
    const res = await fetch("/dashboard/api/user-meal-history", { credentials: "include" });
    const meals = await res.json();

    const container = document.getElementById("mealHistory");
    if (!meals || meals.length === 0) {
      container.innerHTML = "<p>No meals saved yet.</p>";
      return;
    }

    // Group by meal name + time
    const grouped = {};
    for (const entry of meals) {
      const key = `${entry.mealName}||${entry.time}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(entry);
    }

    let html = "";
    for (const key in grouped) {
      const [mealName, time] = key.split("||");
      const mealTime = new Date(time).toLocaleString();

      html += `
        <div class="meal-block">
          <h4>${mealName} <small>(${mealTime})</small></h4>
          <button class="delete-meal-btn" data-mealname="${mealName}" data-mealtime="${time}">🗑 Delete Meal</button>
          <table>
            <thead>
              <tr>
                <th>Ingredient</th><th>Grams</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Phosphorus</th><th>Potassium</th>
              </tr>
            </thead>
            <tbody>
      `;

      for (const item of grouped[key]) {
        html += `
          <tr>
            <td>${item.name}</td>
            <td>${item.grams}</td>
            <td>${item.calories}</td>
            <td>${item.protein}</td>
            <td>${item.carbs}</td>
            <td>${item.phosphorus}</td>
            <td>${item.potassium}</td>
          </tr>
        `;
      }

      html += "</tbody></table></div>";
    }

    container.innerHTML = html;

    // Attach event listeners to all delete buttons
    document.querySelectorAll(".delete-meal-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const mealName = btn.dataset.mealname;
        const mealTime = btn.dataset.mealtime;
        if (confirm(`Delete all entries for "${mealName}" at ${new Date(mealTime).toLocaleString()}?`)) {
          await deleteMealByNameAndTime(mealName, mealTime);
          loadSavedMeals(); // reload view
        }
      });
    });
  } catch (err) {
    console.error("Failed to load meal history", err);
    document.getElementById("mealHistory").innerHTML = "<p>Could not load meal history.</p>";
  }
}