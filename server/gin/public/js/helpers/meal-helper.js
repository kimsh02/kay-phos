function getDefinedMealIngredients(documentRoot = document) {
    const rows = documentRoot.querySelectorAll("#ingredientBody tr");
    const ingredients = [];

    rows.forEach(row => {
        const name = row.querySelector(".ingredient-name")?.value?.trim();
        const grams = parseFloat(row.querySelector(".ingredient-grams")?.value);
        const calories = parseFloat(row.querySelector(".ingredient-calories")?.value);
        const protein = parseFloat(row.querySelector(".ingredient-protein")?.value);
        const carbs = parseFloat(row.querySelector(".ingredient-carbs")?.value);
        const potassium = parseFloat(row.querySelector(".ingredient-potassium")?.value);
        const phosphorus = parseFloat(row.querySelector(".ingredient-phosphorus")?.value);

        if (!name || isNaN(grams)) return;

        ingredients.push({ name, grams, calories, protein, carbs, potassium, phosphorus });
    });

    return ingredients;
}

function buildMealPayload(mealType, mealName, ingredients) {
    return {
        mealName: mealName || `${mealType === "favorite" ? "User Favorite" : "User Meal"} - ${new Date().toISOString().split("T")[0]}`,
        time: new Date().toISOString(),
        mealType,
        ingredients
    };
}

module.exports = {
    getDefinedMealIngredients,
    buildMealPayload
};
