from django_countries import countries

# This is a list of tuples like: [('MA', 'Morocco'), ('FR', 'France'), ...]
COUNTRIES_LIST = list(countries)

# --- THIS IS THE KEY FOR OUR TRANSLATOR ---
# We create two dictionaries for fast, case-insensitive lookups.

# Map full name to code: { "morocco": "MA", "france": "FR", ... }
COUNTRY_NAME_TO_CODE_MAP = {name.lower(): code for code, name in COUNTRIES_LIST}

# Map code to full name: { "MA": "Morocco", "FR": "France", ... }
COUNTRY_CODE_TO_NAME_MAP = {code: name for code, name in COUNTRIES_LIST}