const AutocompleteComponent = require("../../structure/AutocompleteComponent");

module.exports = new AutocompleteComponent({
    commandName: 'pixivranking',
    run: async (client, interaction) => {
        const fruits = ['daily', 'weekly', 'monthly', 'daily_r18', 'weekly_r18', 'monthly_r18'];

        const currentInput = interaction.options.getFocused();
        const filteredFruits = fruits.filter(fruit => fruit.toLowerCase().startsWith(currentInput.toLowerCase()));

        await interaction.respond(filteredFruits.map(fruit => ({ name: fruit, value: fruit })));
    }
}).toJSON();