// Groups entries by mealName + time for rendering
function groupMealHistory(entries) {
    const grouped = {};
    for (const entry of entries) {
        const key = `${entry.mealName}||${entry.time}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(entry);
    }
    return grouped;
}

module.exports = { groupMealHistory };
