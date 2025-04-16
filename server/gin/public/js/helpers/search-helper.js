// search-helper.js

function filterSuggestions(suggestions, input) {
    return suggestions.filter(s => s.toLowerCase().startsWith(input.toLowerCase()));
}

function sortResults(results, sortBy) {
    const sorted = [...results];
    switch (sortBy) {
        case "calories-asc":
            sorted.sort((a, b) => a.calories - b.calories); break;
        case "calories-desc":
            sorted.sort((a, b) => b.calories - a.calories); break;
        case "protein-desc":
            sorted.sort((a, b) => b.protein - a.protein); break;
        case "phosphorus-desc":
            sorted.sort((a, b) => b.phosphorus - a.phosphorus); break;
        case "potassium-desc":
            sorted.sort((a, b) => b.potassium - a.potassium); break;
        case "carbs-desc":
            sorted.sort((a, b) => b.carbs - a.carbs); break;
    }
    return sorted;
}

function formatRecentSearches(storage, newQuery) {
    let recent = JSON.parse(storage.getItem("recentSearches") || "[]");
    recent = [newQuery, ...recent.filter(q => q !== newQuery)].slice(0, 5);
    storage.setItem("recentSearches", JSON.stringify(recent));
    return recent;
}

module.exports = {
    filterSuggestions,
    sortResults,
    formatRecentSearches
};

function buildManualMealPayload(type, foodItem, mealName = null) {
    return {
        mealName: mealName || `Manual Meal - ${new Date().toISOString().split("T")[0]}`,
        time: new Date().toISOString(),
        mealType: type,
        ingredients: [
            {
                name: foodItem.name,
                foodCode: foodItem.foodCode || 0,
                grams: foodItem.grams || 100,
                calories: foodItem.calories || 0,
                protein: foodItem.protein || 0,
                phosphorus: foodItem.phosphorus || 0,
                potassium: foodItem.potassium || 0,
                carbs: foodItem.carbs || 0
            }
        ]
    };
}

module.exports.buildManualMealPayload = buildManualMealPayload;

