// food-log-helper.js

function buildMealPayload(type, selectedFoods, mealName = null) {
    if (!selectedFoods || selectedFoods.length === 0) return null;

    return {
        mealName: mealName || `${type === "history" ? "AI Meal" : "Favorite Meal"} - ${new Date().toISOString().split("T")[0]}`,
        time: new Date().toISOString(),
        mealType: type,
        ingredients: selectedFoods.map(item => ({
            name: item.ingredientName,
            foodCode: 0,
            grams: item.weightGrams || 0,
            calories: item.calories || 0,
            protein: item.protein || 0,
            phosphorus: item.phosphorus || 0,
            potassium: item.potassium || 0,
            carbs: item.carbs || 0
        }))
    };
}

function mergeNutrientBreakdown(selected, breakdown) {
    return selected.map(sel => {
        const enriched = breakdown.find(b => b.ingredientName === sel.ingredientName);
        return {
            ...sel,
            calories: enriched?.calories || sel.calories || 0,
            protein: enriched?.protein || sel.protein || 0,
            carbs: enriched?.carbs || sel.carbs || 0,
            phosphorus: enriched?.phosphorus || sel.phosphorus || 0,
            potassium: enriched?.potassium || sel.potassium || 0,
        };
    });
}

module.exports = {
    buildMealPayload,
    mergeNutrientBreakdown
};
