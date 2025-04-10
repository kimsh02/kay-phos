document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("addIngredient").addEventListener("click", addIngredientRow);
  document.getElementById("saveMeal").addEventListener("click", saveMeal);
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

async function saveMeal() {
  const mealName = document.getElementById("mealName").value.trim();
  if (!mealName) {
    alert("Please enter a meal name.");
    return;
  }

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

  if (ingredients.length === 0) {
    alert("Please add at least one valid ingredient.");
    return;
  }

  const payload = {
    mealName,
    time: new Date().toISOString(),
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
    location.reload();
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

async function deleteMealByNameAndTime(mealName, time) {
  try {
    const res = await fetch("/dashboard/user-meal-history", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealName, time })
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error("❌ Failed to delete meal:", msg);
      alert("Failed to delete meal.");
      return;
    }

    alert("✅ Meal deleted.");
  } catch (err) {
    console.error("❌ Error deleting meal:", err);
    alert("Something went wrong.");
  }
}




