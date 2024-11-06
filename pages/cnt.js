document.getElementById('country').addEventListener('change', function() {
    const country = this.value;
    const stateSelect = document.getElementById('state');

    // Clear previous options
    stateSelect.innerHTML = '<option value="">Select State</option>';

    // States data based on selected country
    const states = {
        'us': ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia"],
        'ca': ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec",],
        'uk': ["England", "North Ireland", "Scotland", "Wales"],
        'in': ['Maharashtra', 'Karnataka', 'Delhi'],
        'ng': ["Abuja", "Abia", "Adamawa", "Akwa ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross river", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "kano", "Katsina", "Kebbi", "kogi", "kwara", "lagos", "Nassarawa", "Niger","Ogun", "Ondo", "Osun", "Oyo", "Plateau", "River", "Sokoto", "Taraba", "Yobe", "Zamfara"]
    };

    if(states[country]) {
        states[country].forEach(function(state) {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }
});

document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Form Submitted!');
});
