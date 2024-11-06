const statesByCountry = {
    us:["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia"],
    ca:["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"],
    uk:["England", "North Ireland", "Scotland", "Wales"],
    ng:["Abuja", "Abia", "Adamawa", "Akwa ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross river", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "kano", "Katsina", "Kebbi", "kogi", "kwara", "lagos", "Nassarawa", "Niger","Ogun", "Ondo", "Osun", "Oyo", "Plateau", "River", "Sokoto", "Taraba", "Yobe", "Zamfara"]
};

function populastates() {
    const countrySelect = document.getElementById('country');
    const stateSelect = document.getElementById('state');
    const selectedCountry = countrySelect.value;

    //removing previous states
    stateSelect.InnerHTML = '<option value="">select your state</option>';

    //Populate state based on selected country
    if (selectedCountry && statesByCountry[selectedCountry]) {
        const states = statesByCountry[selectedCountry];
        states.forEach(state => {
            const option = document.createElement("option");
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }
}