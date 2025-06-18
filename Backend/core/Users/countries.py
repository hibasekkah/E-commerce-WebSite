from django_countries import countries

# This is a list of tuples: [('MA', 'Morocco'), ...]
COUNTRIES_LIST = list(countries)

# --- THIS IS THE KEY PART ---
# Create a dictionary for fast, case-insensitive lookups: 
# { "morocco": "MA", "france": "FR", ... }
COUNTRY_NAME_TO_CODE_MAP = {name.lower(): code for code, name in COUNTRIES_LIST}