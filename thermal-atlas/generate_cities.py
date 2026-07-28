#!/usr/bin/env python3
"""Generate thermal-atlas/cities.js — 1000 heat-prone / major cities."""

from __future__ import annotations

import json
import re
import urllib.request
from collections import defaultdict
from pathlib import Path

OUT = Path(__file__).resolve().parent / "cities.js"
CACHE = Path("/tmp/cities.json")
URL = "https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json"

# ISO 3166-1 alpha-2 → English country name (subset + common)
CC_TO_NAME = {
    "AF": "Afghanistan", "AL": "Albania", "DZ": "Algeria", "AS": "American Samoa",
    "AD": "Andorra", "AO": "Angola", "AI": "Anguilla", "AQ": "Antarctica",
    "AG": "Antigua and Barbuda", "AR": "Argentina", "AM": "Armenia", "AW": "Aruba",
    "AU": "Australia", "AT": "Austria", "AZ": "Azerbaijan", "BS": "Bahamas",
    "BH": "Bahrain", "BD": "Bangladesh", "BB": "Barbados", "BY": "Belarus",
    "BE": "Belgium", "BZ": "Belize", "BJ": "Benin", "BM": "Bermuda",
    "BT": "Bhutan", "BO": "Bolivia", "BA": "Bosnia and Herzegovina", "BW": "Botswana",
    "BR": "Brazil", "BN": "Brunei", "BG": "Bulgaria", "BF": "Burkina Faso",
    "BI": "Burundi", "KH": "Cambodia", "CM": "Cameroon", "CA": "Canada",
    "CV": "Cape Verde", "KY": "Cayman Islands", "CF": "Central African Republic",
    "TD": "Chad", "CL": "Chile", "CN": "China", "CO": "Colombia", "KM": "Comoros",
    "CG": "Congo", "CD": "Democratic Republic of the Congo", "CK": "Cook Islands",
    "CR": "Costa Rica", "CI": "Ivory Coast", "HR": "Croatia", "CU": "Cuba",
    "CY": "Cyprus", "CZ": "Czech Republic", "DK": "Denmark", "DJ": "Djibouti",
    "DM": "Dominica", "DO": "Dominican Republic", "EC": "Ecuador", "EG": "Egypt",
    "SV": "El Salvador", "GQ": "Equatorial Guinea", "ER": "Eritrea", "EE": "Estonia",
    "ET": "Ethiopia", "FJ": "Fiji", "FI": "Finland", "FR": "France", "GA": "Gabon",
    "GM": "Gambia", "GE": "Georgia", "DE": "Germany", "GH": "Ghana", "GR": "Greece",
    "GL": "Greenland", "GD": "Grenada", "GU": "Guam", "GT": "Guatemala",
    "GN": "Guinea", "GW": "Guinea-Bissau", "GY": "Guyana", "HT": "Haiti",
    "HN": "Honduras", "HK": "Hong Kong", "HU": "Hungary", "IS": "Iceland",
    "IN": "India", "ID": "Indonesia", "IR": "Iran", "IQ": "Iraq", "IE": "Ireland",
    "IL": "Israel", "IT": "Italy", "JM": "Jamaica", "JP": "Japan", "JO": "Jordan",
    "KZ": "Kazakhstan", "KE": "Kenya", "KI": "Kiribati", "KP": "North Korea",
    "KR": "South Korea", "KW": "Kuwait", "KG": "Kyrgyzstan", "LA": "Laos",
    "LV": "Latvia", "LB": "Lebanon", "LS": "Lesotho", "LR": "Liberia", "LY": "Libya",
    "LI": "Liechtenstein", "LT": "Lithuania", "LU": "Luxembourg", "MO": "Macau",
    "MK": "North Macedonia", "MG": "Madagascar", "MW": "Malawi", "MY": "Malaysia",
    "MV": "Maldives", "ML": "Mali", "MT": "Malta", "MH": "Marshall Islands",
    "MR": "Mauritania", "MU": "Mauritius", "MX": "Mexico", "FM": "Micronesia",
    "MD": "Moldova", "MC": "Monaco", "MN": "Mongolia", "ME": "Montenegro",
    "MA": "Morocco", "MZ": "Mozambique", "MM": "Myanmar", "NA": "Namibia",
    "NR": "Nauru", "NP": "Nepal", "NL": "Netherlands", "NZ": "New Zealand",
    "NI": "Nicaragua", "NE": "Niger", "NG": "Nigeria", "NO": "Norway", "OM": "Oman",
    "PK": "Pakistan", "PW": "Palau", "PS": "Palestine", "PA": "Panama",
    "PG": "Papua New Guinea", "PY": "Paraguay", "PE": "Peru", "PH": "Philippines",
    "PL": "Poland", "PT": "Portugal", "PR": "Puerto Rico", "QA": "Qatar",
    "RO": "Romania", "RU": "Russia", "RW": "Rwanda", "SA": "Saudi Arabia",
    "SN": "Senegal", "RS": "Serbia", "SC": "Seychelles", "SL": "Sierra Leone",
    "SG": "Singapore", "SK": "Slovakia", "SI": "Slovenia", "SB": "Solomon Islands",
    "SO": "Somalia", "ZA": "South Africa", "SS": "South Sudan", "ES": "Spain",
    "LK": "Sri Lanka", "SD": "Sudan", "SR": "Suriname", "SZ": "Eswatini",
    "SE": "Sweden", "CH": "Switzerland", "SY": "Syria", "TW": "Taiwan",
    "TJ": "Tajikistan", "TZ": "Tanzania", "TH": "Thailand", "TL": "Timor-Leste",
    "TG": "Togo", "TO": "Tonga", "TT": "Trinidad and Tobago", "TN": "Tunisia",
    "TR": "Turkey", "TM": "Turkmenistan", "UG": "Uganda", "UA": "Ukraine",
    "AE": "United Arab Emirates", "GB": "United Kingdom", "US": "United States",
    "UY": "Uruguay", "UZ": "Uzbekistan", "VU": "Vanuatu", "VE": "Venezuela",
    "VN": "Vietnam", "YE": "Yemen", "ZM": "Zambia", "ZW": "Zimbabwe",
    "EH": "Western Sahara", "XK": "Kosovo", "RE": "Réunion", "GP": "Guadeloupe",
    "MQ": "Martinique", "GF": "French Guiana", "YT": "Mayotte", "NC": "New Caledonia",
    "PF": "French Polynesia", "WF": "Wallis and Futuna", "PM": "Saint Pierre and Miquelon",
    "BL": "Saint Barthélemy", "MF": "Saint Martin", "SX": "Sint Maarten",
    "CW": "Curaçao", "BQ": "Caribbean Netherlands", "TC": "Turks and Caicos Islands",
    "VG": "British Virgin Islands", "VI": "U.S. Virgin Islands", "MP": "Northern Mariana Islands",
    "UM": "U.S. Minor Outlying Islands", "FO": "Faroe Islands", "GI": "Gibraltar",
    "IM": "Isle of Man", "JE": "Jersey", "GG": "Guernsey", "AX": "Åland Islands",
    "SJ": "Svalbard and Jan Mayen", "BV": "Bouvet Island", "GS": "South Georgia",
    "TF": "French Southern Territories", "HM": "Heard Island", "IO": "British Indian Ocean Territory",
    "CX": "Christmas Island", "CC": "Cocos Islands", "NF": "Norfolk Island",
    "PN": "Pitcairn", "SH": "Saint Helena", "ST": "São Tomé and Príncipe",
    "VA": "Vatican City", "SM": "San Marino", "LK": "Sri Lanka",
}

HEAT_COUNTRIES = {
    "India", "Pakistan", "Saudi Arabia", "United Arab Emirates", "Iraq", "Iran",
    "Kuwait", "Oman", "Qatar", "Bahrain", "Yemen", "Egypt", "Sudan", "South Sudan",
    "Chad", "Niger", "Mali", "Burkina Faso", "Nigeria", "Algeria", "Libya",
    "Mauritania", "Mexico", "United States", "Australia", "Thailand", "Vietnam",
    "Philippines", "Indonesia", "Brazil", "Djibouti", "Somalia", "Eritrea",
    "Ethiopia", "Senegal", "Morocco", "Tunisia", "Syria", "Jordan", "Israel",
    "Palestine", "Turkmenistan", "Uzbekistan", "Afghanistan", "Bangladesh",
    "Myanmar", "Cambodia", "Laos", "Malaysia", "Singapore", "Sri Lanka",
    "Spain", "Greece", "Turkey", "China", "Taiwan", "Hong Kong", "Macau",
    "Ivory Coast", "Ghana", "Benin", "Togo", "Cameroon", "Central African Republic",
    "Democratic Republic of the Congo", "Congo", "Kenya", "Tanzania", "Uganda",
    "Bolivia", "Paraguay", "Venezuela", "Colombia", "Peru", "Ecuador",
    "Western Sahara", "Namibia", "Botswana", "South Africa", "Mozambique",
    "Madagascar", "Maldives", "Cape Verde", "Gambia", "Guinea", "Guinea-Bissau",
    "Sierra Leone", "Liberia", "Angola", "Zambia", "Zimbabwe", "Malawi",
}

# Stronger heat preference
TOP_HEAT = {
    "India", "Pakistan", "Saudi Arabia", "United Arab Emirates", "Iraq", "Iran",
    "Kuwait", "Oman", "Qatar", "Bahrain", "Yemen", "Egypt", "Sudan", "Chad",
    "Niger", "Mali", "Burkina Faso", "Nigeria", "Algeria", "Libya", "Mauritania",
    "Mexico", "United States", "Australia", "Djibouti", "Turkmenistan",
    "Bangladesh", "Thailand", "Philippines", "Indonesia", "Vietnam",
}

SEED = [
    ("Death Valley", "United States", 36.5323, -116.9325),
    ("Phoenix", "United States", 33.4484, -112.074),
    ("Las Vegas", "United States", 36.1699, -115.1398),
    ("Yuma", "United States", 32.6927, -114.6277),
    ("Tucson", "United States", 32.2226, -110.9747),
    ("El Paso", "United States", 31.7619, -106.485),
    ("Mexicali", "Mexico", 32.6245, -115.4523),
    ("Hermosillo", "Mexico", 29.0729, -110.9559),
    ("Kuwait City", "Kuwait", 29.3759, 47.9774),
    ("Ahvaz", "Iran", 31.3183, 48.6706),
    ("Basra", "Iraq", 30.5085, 47.7804),
    ("Baghdad", "Iraq", 33.3152, 44.3661),
    ("Riyadh", "Saudi Arabia", 24.7136, 46.6753),
    ("Jeddah", "Saudi Arabia", 21.4858, 39.1925),
    ("Mecca", "Saudi Arabia", 21.3891, 39.8579),
    ("Dammam", "Saudi Arabia", 26.4207, 50.0888),
    ("Dubai", "United Arab Emirates", 25.2048, 55.2708),
    ("Abu Dhabi", "United Arab Emirates", 24.4539, 54.3773),
    ("Doha", "Qatar", 25.2854, 51.531),
    ("Manama", "Bahrain", 26.2235, 50.5876),
    ("Muscat", "Oman", 23.588, 58.3829),
    ("Karachi", "Pakistan", 24.8607, 67.0011),
    ("Jacobabad", "Pakistan", 28.2814, 68.4388),
    ("Multan", "Pakistan", 30.1575, 71.5249),
    ("Lahore", "Pakistan", 31.5204, 74.3587),
    ("Delhi", "India", 28.7041, 77.1025),
    ("Jaipur", "India", 26.9124, 75.7873),
    ("Ahmedabad", "India", 23.0225, 72.5714),
    ("Nagpur", "India", 21.1458, 79.0882),
    ("Hyderabad", "India", 17.385, 78.4867),
    ("Chennai", "India", 13.0827, 80.2707),
    ("Madurai", "India", 9.9252, 78.1198),
    ("Kolkata", "India", 22.5726, 88.3639),
    ("Varanasi", "India", 25.3176, 82.9739),
    ("Lucknow", "India", 26.8467, 80.9462),
    ("Patna", "India", 25.5941, 85.1376),
    ("Bhopal", "India", 23.2599, 77.4126),
    ("Mumbai", "India", 19.076, 72.8777),
    ("Coimbatore", "India", 11.0168, 76.9558),
    ("Tiruchirappalli", "India", 10.7905, 78.7047),
    ("Dhaka", "Bangladesh", 23.8103, 90.4125),
    ("Cairo", "Egypt", 30.0444, 31.2357),
    ("Aswan", "Egypt", 24.0889, 32.8998),
    ("Luxor", "Egypt", 25.6872, 32.6396),
    ("Khartoum", "Sudan", 15.5007, 32.5599),
    ("N'Djamena", "Chad", 12.1348, 15.0557),
    ("Niamey", "Niger", 13.5116, 2.1254),
    ("Bamako", "Mali", 12.6392, -8.0029),
    ("Timbuktu", "Mali", 16.7666, -3.0026),
    ("Ouagadougou", "Burkina Faso", 12.3714, -1.5197),
    ("Kano", "Nigeria", 12.0022, 8.592),
    ("Maiduguri", "Nigeria", 11.8311, 13.151),
    ("Lagos", "Nigeria", 6.5244, 3.3792),
    ("Djibouti", "Djibouti", 11.8251, 42.5903),
    ("Bangkok", "Thailand", 13.7563, 100.5018),
    ("Manila", "Philippines", 14.5995, 120.9842),
    ("Jakarta", "Indonesia", -6.2088, 106.8456),
    ("Singapore", "Singapore", 1.3521, 103.8198),
    ("Darwin", "Australia", -12.4634, 130.8456),
    ("Alice Springs", "Australia", -23.698, 133.8807),
    ("Seville", "Spain", 37.3891, -5.9845),
    ("Bandar Abbas", "Iran", 27.1865, 56.2808),
    ("Turpan", "China", 42.9513, 89.1895),
    ("Ashgabat", "Turkmenistan", 37.9601, 58.3261),
]

# Capitals / major cities boost (name match, case-insensitive)
KNOWN_MAJOR = {
    "new delhi", "delhi", "mumbai", "kolkata", "chennai", "bangalore", "bengaluru",
    "hyderabad", "ahmedabad", "pune", "surat", "jaipur", "lucknow", "kanpur",
    "nagpur", "indore", "thane", "bhopal", "visakhapatnam", "patna", "vadodara",
    "ghaziabad", "ludhiana", "agra", "nashik", "faridabad", "meerut", "rajkot",
    "varanasi", "srinagar", "amritsar", "ranchi", "howrah", "coimbatore",
    "jabalpur", "gwalior", "vijayawada", "jodhpur", "madurai", "raipur",
    "kota", "guwahati", "chandigarh", "solapur", "hubli", "mysore", "mysuru",
    "tiruchirappalli", "bareilly", "aligarh", "tiruppur", "moradabad", "jalandhar",
    "bhubaneswar", "salem", "warangal", "guntur", "bhiwandi", "saharanpur",
    "gorakhpur", "bikaner", "amravati", "noida", "jamshedpur", "bhilai",
    "cuttack", "firozabad", "kochi", "bhavnagar", "dehradun", "durgapur",
    "asansol", "nanded", "kolhapur", "ajmer", "gulbarga", "jamnagar",
    "ujjain", "loni", "siliguri", "jhansi", "ulhasnagar", "nellore", "jammu",
    "sangli", "belgaum", "mangalore", "ambattur", "tirunelveli", "malegaon",
    "gaya", "jalgaon", "udaipur", "maheshtala",
    "karachi", "lahore", "faisalabad", "rawalpindi", "multan", "hyderabad",
    "gujranwala", "peshawar", "quetta", "islamabad", "sargodha", "sialkot",
    "bahawalpur", "sukkur", "larkana", "sheikhupura", "jhang", "rahim yar khan",
    "gujrat", "kasur", "mardan", "mingora", "nawabshah", "chiniot", "kotri",
    "jacobabad", "shikarpur", "muzaffargarh", "khanpur", "hafizabad",
    "riyadh", "jeddah", "mecca", "medina", "dammam", "khobar", "taif", "tabuk",
    "buraidah", "khamis mushait", "abha", "najran", "jubail", "yanbu",
    "dubai", "abu dhabi", "sharjah", "al ain", "ajman", "ras al khaimah",
    "fujairah", "umm al quwain",
    "baghdad", "basra", "mosul", "erbil", "najaf", "karbala", "kirkuk", "sulaymaniyah",
    "tehran", "mashhad", "isfahan", "karaj", "shiraz", "tabriz", "qom", "ahvaz",
    "kermanshah", "urmia", "rasht", "zahedan", "hamadan", "kerman", "yazd",
    "ardabil", "bandar abbas", "arak", "eslamshahr", "zanjan", "sanandaj",
    "kuwait city", "hawalli", "salmiya",
    "muscat", "salalah", "sohar", "nizwa", "sur",
    "doha", "al rayyan", "al wakrah",
    "manama", "muharraq", "riffa",
    "sanaa", "aden", "taiz", "hodeidah", "ibb", "mukalla",
    "cairo", "alexandria", "giza", "shubra el kheima", "port said", "suez",
    "luxor", "aswan", "asyut", "ismailia", "faiyum", "zagazig", "damietta",
    "minya", "beni suef", "qena", "sohag", "hurghada",
    "khartoum", "omdurman", "port sudan", "kassala", "el obeid", "nyala",
    "n'djamena", "moundou", "sarh", "abeche",
    "niamey", "zinder", "maradi", "agadez", "tahoua",
    "bamako", "sikasso", "mopti", "timbuktu", "gao", "segou",
    "ouagadougou", "bobo-dioulasso", "koudougou",
    "lagos", "kano", "ibadan", "abuja", "port harcourt", "benin city",
    "maiduguri", "zaria", "aba", "jos", "ilorin", "oyo", "enugu", "abeokuta",
    "sokoto", "onitsha", "warri", "okene", "calabar", "katsina", "akure",
    "bauchi", "ikeja", "makurdi", "minna", "effon alaiye", "ile-ife",
    "mexico city", "guadalajara", "monterrey", "puebla", "tijuana", "leon",
    "juarez", "ciudad juarez", "torreon", "queretaro", "san luis potosi",
    "merida", "mexicali", "aguascalientes", "acapulco", "cuernavaca",
    "saltillo", "chihuahua", "cancun", "hermosillo", "morelia", "reynosa",
    "tulancingo", "durango", "toluca", "culiacan", "tlaquepaque",
    "phoenix", "las vegas", "tucson", "el paso", "albuquerque", "tucson",
    "houston", "dallas", "san antonio", "austin", "fort worth", "oklahoma city",
    "miami", "tampa", "orlando", "jacksonville", "new orleans", "baton rouge",
    "los angeles", "san diego", "riverside", "bakersfield", "fresno", "sacramento",
    "brownsville", "laredo", "corpus christi", "mcallen", "bakersfield",
    "death valley", "yuma", "palm springs", "indio", "blythe", "needles",
    "tucson", "mesa", "chandler", "scottsdale", "glendale", "tempe", "peoria",
    "surprise", "goodyear", "avondale", "buckeye", "casa grande",
    "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra", "hobart",
    "darwin", "alice springs", "cairns", "townsville", "rockhampton", "mackay",
    "toowoomba", "gold coast", "newcastle", "wollongong", "geelong", "hobart",
    "bangkok", "nonthaburi", "nakhon ratchasima", "chiang mai", "hat yai",
    "udon thani", "pak kret", "khon kaen", "chaophraya surasak", "nakhon si thammarat",
    "manila", "quezon city", "caloocan", "davao", "cebu", "zamboanga", "antipolo",
    "pasig", "taguig", "cagayan de oro", "paranaque", "dasmarinas", "valenzuela",
    "bacoor", "general santos", "las pinas", "makati", "bacolod", "muntilupa",
    "jakarta", "surabaya", "bandung", "medan", "semarang", "makassar", "palembang",
    "tangerang", "depok", "bekasi", "batam", "pekanbaru", "bogor", "padang",
    "malang", "denpasar", "samarinda", "tasikmalaya", "pontianak", "banjarmasin",
    "balikpapan", "jambi", "surakarta", "manado", "yogyakarta", "mataram",
    "ho chi minh city", "hanoi", "da nang", "hai phong", "can tho", "bien hoa",
    "hue", "nha trang", "buon ma thuot", "vung tau", "qui nhon", "rach gia",
    "sao paulo", "rio de janeiro", "brasilia", "salvador", "fortaleza", "belo horizonte",
    "manaus", "curitiba", "recife", "porto alegre", "belem", "goiania", "guarulhos",
    "campinas", "sao luis", "sao goncalo", "maceio", "duque de caxias", "natal",
    "teresina", "campo grande", "nova iguacu", "sao bernardo do campo",
    "joao pessoa", "santo andre", "osasco", "jaboatao dos guararapes", "sao jose dos campos",
    "ribeirao preto", "uberlandia", "sorocaba", "cuiaba", "aracaju", "feira de santana",
    "seville", "sevilla", "cordoba", "malaga", "granada", "murcia", "alicante",
    "valencia", "madrid", "barcelona", "zaragoza", "bilbao", "palma",
    "ashgabat", "turkmenabat", "dasoguz", "mary", "balkanabat",
    "urumqi", "turpan", "kashgar", "hotan", "korla", "aksu", "hami",
    "beijing", "shanghai", "guangzhou", "shenzhen", "chengdu", "wuhan", "xian",
    "chongqing", "tianjin", "hangzhou", "nanjing", "zhengzhou", "jinan",
    "dhaka", "chittagong", "khulna", "rajshahi", "sylhet", "barisal", "rangpur",
    "comilla", "gazipur", "narayanganj", "mymensingh",
    "singapore", "djibouti", "algiers", "oran", "constantine", "annaba",
    "tripoli", "benghazi", "misrata", "sabha",
    "nouakchott", "nouadhibou",
    "casablanca", "rabat", "fes", "marrakech", "tangier", "agadir", "meknes",
    "tunis", "sfax", "sousse", "kairouan",
    "addis ababa", "dire dawa", "mekelle",
    "mogadishu", "hargeisa", "bosaso",
    "asmara", "massawa",
    "dakar", "thies", "kaolack", "saint-louis",
    "accra", "kumasi", "tamale", "takoradi",
    "abidjan", "yamoussoukro", "bouake",
    "yaounde", "douala", "garoua",
    "kinshasa", "lubumbashi", "mbuji-mayi", "kananga", "kisangani",
    "luanda", "huambo", "lobito",
    "nairobi", "mombasa", "kisumu", "nakuru",
    "dar es salaam", "dodoma", "mwanza", "arusha",
    "kampala", "entebbe", "jinja",
    "harare", "bulawayo",
    "lusaka", "ndola", "kitwe",
    "maputo", "beira", "nampula",
    "gaborone", "francistown",
    "windhoek", "walvis bay",
    "johannesburg", "cape town", "durban", "pretoria", "port elizabeth", "bloemfontein",
    "colombo", "kandy", "galle", "jaffna",
    "kuala lumpur", "george town", "ipoh", "johor bahru", "kota kinabalu", "kuching",
    "yangon", "mandalay", "naypyidaw",
    "phnom penh", "siem reap", "battambang",
    "vientiane", "luang prabang",
    "amman", "zarqa", "irbid", "aqaba",
    "damascus", "aleppo", "homs", "latakia", "hama",
    "beirut", "tripoli", "sidon",
    "tel aviv", "jerusalem", "haifa", "beer sheva", "eilat",
    "ankara", "istanbul", "izmir", "bursa", "antalya", "adana", "gaziantep",
    "konya", "mersin", "diyarbakir", "kayseri", "eskisehir", "urfa", "malatya",
    "athens", "thessaloniki", "patras", "heraklion",
    "lisbon", "porto", "faro",
    "rome", "milan", "naples", "palermo", "turin", "genoa", "bologna", "florence",
    "paris", "marseille", "lyon", "toulouse", "nice", "montpellier",
    "london", "birmingham", "manchester", "leeds", "glasgow", "liverpool",
    "berlin", "munich", "hamburg", "cologne", "frankfurt", "stuttgart",
    "moscow", "saint petersburg", "novosibirsk", "yekaterinburg",
    "tokyo", "osaka", "yokohama", "nagoya", "sapporo", "fukuoka", "kobe",
    "seoul", "busan", "incheon", "daegu",
    "taipei", "kaohsiung", "taichung",
    "hong kong", "kowloon",
    "bangkok", "kabul", "herat", "kandahar", "mazar-i-sharif",
    "tashkent", "samarkand", "bukhara", "namangan", "andijan",
    "almaty", "astana", "shymkent", "karaganda",
    "bishkek", "osh",
    "dushanbe", "khujand",
    "ulaanbaatar",
    "caracas", "maracaibo", "valencia", "barquisimeto",
    "bogota", "medellin", "cali", "barranquilla", "cartagena",
    "lima", "arequipa", "trujillo", "chiclayo",
    "quito", "guayaquil", "cuenca",
    "la paz", "santa cruz", "cochabamba", "sucre",
    "asuncion", "ciudad del este",
    "buenos aires", "cordoba", "rosario", "mendoza", "tucuman",
    "santiago", "valparaiso", "concepcion", "antofagasta",
    "panama city", "san jose", "guatemala city", "san salvador", "tegucigalpa",
    "managua", "havana", "santo domingo", "san juan", "kingston",
}

TINY_NAME_RE = re.compile(
    r"^(st\.?|saint|new|old|north|south|east|west|upper|lower|little|great)\s+",
    re.I,
)
BAD_NAME_RE = re.compile(
    r"(village|hamlet|colony|camp|settlement|outpost|ranch|farm|station\b|"
    r"^\d|unknown|unnamed|test\b)",
    re.I,
)
# Prefer ASCII-ish / multi-word capitals; filter tiny looking single short tokens with diacritics-only
def country_name(cc: str) -> str:
    return CC_TO_NAME.get(cc.upper(), cc)


def dedupe_key_name(name: str, country: str) -> str:
    return f"{name.strip().lower()}|{country.strip().lower()}"


def dedupe_key_coord(lat: float, lon: float) -> tuple:
    return (round(lat, 2), round(lon, 2))


def score_city(name: str, country: str, lat: float, lon: float, admin1: str) -> float:
    s = 0.0
    alat = abs(lat)

    # Latitude preference
    if alat <= 25:
        s += 40
    elif alat <= 32:
        s += 35
    elif alat <= 38:
        s += 25
    elif alat <= 42:
        s += 8
    else:
        s -= 30

    # Country heat preference
    if country in TOP_HEAT:
        s += 50
    elif country in HEAT_COUNTRIES:
        s += 30
    else:
        s -= 10

    # Brazil: prefer north (amazon / northeast heat)
    if country == "Brazil":
        if lat > -10:
            s += 25
        elif lat > -20:
            s += 10
        else:
            s -= 15

    # US: prefer southwest / south heat belt
    if country == "United States":
        if 25 <= lat <= 38 and -125 <= lon <= -90:
            s += 35
        elif lat < 35 and lon > -100:
            s += 15
        elif lat > 42:
            s -= 40

    # Australia: prefer north / inland
    if country == "Australia":
        if lat > -30:
            s += 20
        if lat > -20:
            s += 15

    # Name quality
    n = name.strip()
    nl = n.lower()
    if len(n) < 4:
        s -= 40
    elif len(n) >= 5:
        s += 5
    if BAD_NAME_RE.search(n):
        s -= 50
    if nl in KNOWN_MAJOR:
        s += 80
    # Well-formed: starts with capital letter, mostly letters/spaces/hyphens
    if re.match(r"^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ '\-\.]+$", n):
        s += 8
    # Penalize all-lowercase or weird short names
    if n.islower() and len(n) < 8:
        s -= 15
    # Has admin1 (slightly better known)
    if admin1:
        s += 3
    # Prefer names without digits
    if any(ch.isdigit() for ch in n):
        s -= 25
    # Slight boost for multi-word city names (often larger places)
    if " " in n or "-" in n:
        s += 4

    return s


def ensure_cache() -> Path:
    if CACHE.exists() and CACHE.stat().st_size > 1_000_000:
        return CACHE
    print(f"Downloading {URL} ...")
    urllib.request.urlretrieve(URL, CACHE)
    return CACHE


def main() -> None:
    ensure_cache()
    raw = json.loads(CACHE.read_text(encoding="utf-8"))
    print(f"Loaded {len(raw)} cities from dataset")

    selected: list[dict] = []
    seen_names: set[str] = set()
    seen_coords: set[tuple] = set()
    country_counts: dict[str, int] = defaultdict(int)
    cell_counts: dict[tuple, int] = defaultdict(int)

    def try_add(name: str, country: str, lat: float, lon: float, force: bool = False) -> bool:
        nk = dedupe_key_name(name, country)
        ck = dedupe_key_coord(lat, lon)
        cell = (int(lat // 1), int(lon // 1))  # floor toward -inf via // for positive; OK for caps

        if nk in seen_names or ck in seen_coords:
            return False
        if not force:
            if country_counts[country] >= 120:
                return False
            if cell_counts[cell] >= 2:
                return False
        # For force (seed), still respect name/coord uniqueness but allow over caps
        seen_names.add(nk)
        seen_coords.add(ck)
        country_counts[country] += 1
        cell_counts[cell] += 1
        selected.append({
            "name": name,
            "country": country,
            "lat": lat,
            "lon": lon,
        })
        return True

    # 1) Seeds first (force)
    for name, country, lat, lon in SEED:
        ok = try_add(name, country, lat, lon, force=True)
        if not ok:
            print(f"WARNING: seed duplicate skipped: {name}, {country}")

    print(f"After seeds: {len(selected)}")

    # Block wrong Phoenix USA from dataset
    phoenix_seed_coords = (33.4484, -112.074)

    candidates = []
    for row in raw:
        try:
            name = str(row["name"]).strip()
            cc = str(row["country"]).strip()
            lat = float(row["lat"])
            lon = float(row["lng"])
            admin1 = str(row.get("admin1") or "")
        except (KeyError, TypeError, ValueError):
            continue

        country = country_name(cc)

        # Exclude wrong Phoenix USA — only seed coords allowed
        if name.lower() == "phoenix" and country == "United States":
            continue

        # Soft geographic filter for candidates
        if abs(lat) > 55:
            continue
        if len(name) < 3:
            continue

        sc = score_city(name, country, lat, lon, admin1)
        candidates.append((sc, name, country, lat, lon))

    candidates.sort(key=lambda x: (-x[0], x[2], x[1]))
    print(f"Scored {len(candidates)} candidates")

    TARGET = 1000
    for sc, name, country, lat, lon in candidates:
        if len(selected) >= TARGET:
            break
        try_add(name, country, lat, lon, force=False)

    # If still short, relax cell/country caps gradually
    if len(selected) < TARGET:
        print(f"Relaxing caps; currently {len(selected)}")
        for sc, name, country, lat, lon in candidates:
            if len(selected) >= TARGET:
                break
            nk = dedupe_key_name(name, country)
            ck = dedupe_key_coord(lat, lon)
            if nk in seen_names or ck in seen_coords:
                continue
            if country_counts[country] >= 200:
                continue
            cell = (int(lat // 1), int(lon // 1))
            if cell_counts[cell] >= 4:
                continue
            if abs(lat) > 45 and country not in HEAT_COUNTRIES:
                continue
            seen_names.add(nk)
            seen_coords.add(ck)
            country_counts[country] += 1
            cell_counts[cell] += 1
            selected.append({"name": name, "country": country, "lat": lat, "lon": lon})

    if len(selected) < TARGET:
        # Final pass: ignore cell cap
        print(f"Final fill; currently {len(selected)}")
        for sc, name, country, lat, lon in candidates:
            if len(selected) >= TARGET:
                break
            nk = dedupe_key_name(name, country)
            ck = dedupe_key_coord(lat, lon)
            if nk in seen_names or ck in seen_coords:
                continue
            if country_counts[country] >= 250:
                continue
            seen_names.add(nk)
            seen_coords.add(ck)
            country_counts[country] += 1
            selected.append({"name": name, "country": country, "lat": lat, "lon": lon})

    if len(selected) != TARGET:
        raise SystemExit(f"Failed to reach {TARGET}: got {len(selected)}")

    selected.sort(key=lambda c: (c["country"].lower(), c["name"].lower()))

    def fmt_num(x: float) -> str:
        # Compact but preserve seed precision
        s = f"{x:.6f}".rstrip("0").rstrip(".")
        return s if s else "0"

    lines = [
        "/** Sample of 1000 heat-prone / major cities. Top 50 rankings are relative to this set. */",
        "window.THERMAL_CITIES = [",
    ]
    for i, c in enumerate(selected):
        comma = "," if i < len(selected) - 1 else ""
        lines.append(
            f'  {{ name: {json.dumps(c["name"], ensure_ascii=False)}, '
            f'country: {json.dumps(c["country"], ensure_ascii=False)}, '
            f'lat: {fmt_num(c["lat"])}, lon: {fmt_num(c["lon"])} }}{comma}'
        )
    lines.append("];")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} ({len(selected)} cities)")

    # Validation
    by_name = {(c["name"].lower(), c["country"].lower()): c for c in selected}
    madurai = by_name.get(("madurai", "india"))
    phoenix = by_name.get(("phoenix", "united states"))
    death = by_name.get(("death valley", "united states"))

    print("--- VALIDATION ---")
    print(f"count: {len(selected)}")
    print(f"Madurai: {madurai}")
    print(f"Phoenix USA: {phoenix}")
    print(f"Death Valley: {death}")
    print(f"Unique countries: {len(country_counts)}")
    top_countries = sorted(country_counts.items(), key=lambda x: -x[1])[:15]
    print("Top countries:", top_countries)

    assert len(selected) == 1000
    assert madurai and madurai["lat"] == 9.9252 and madurai["lon"] == 78.1198
    assert phoenix and 33.0 <= phoenix["lat"] <= 34.0 and phoenix["lon"] < -110
    assert death is not None
    assert abs(phoenix["lat"] - 33.4484) < 0.01
    print("All assertions passed.")


if __name__ == "__main__":
    main()
