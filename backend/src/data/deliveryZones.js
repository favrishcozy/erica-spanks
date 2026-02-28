/**
 * Lagos Delivery Zones and Area Mapping
 * MAJ EXCEL SERVICES 2024 DELIVERY PRICE LIST
 */

// Area to Zone Mapping
export const areaToZone = {
  // MAINLAND ZONE A
  "Surulere": "MAINLAND_A",
  "Costain": "MAINLAND_A",
  "Ojuelegba": "MAINLAND_A",
  "Mushin": "MAINLAND_A",
  "Palmgrove": "MAINLAND_A",
  "Yaba": "MAINLAND_A",
  "Bariga": "MAINLAND_A",
  "Gbagada": "MAINLAND_A",
  "Ajao Estate": "MAINLAND_A",
  "Oshodi": "MAINLAND_A",
  "Ikeja": "MAINLAND_A",
  "Ojota": "MAINLAND_A",
  "Ogudu": "MAINLAND_A",
  "Oworonshoki": "MAINLAND_A",
  "Somolu": "MAINLAND_A",
  "Ikosi-Ketu": "MAINLAND_A",
  "Alapere": "MAINLAND_A",

  // MAINLAND ZONE B
  "Ogba": "MAINLAND_B",
  "Magodo": "MAINLAND_B",
  "Magodo 1": "MAINLAND_B",
  "Magodo 2": "MAINLAND_B",
  "Omole Phase 1": "MAINLAND_B",
  "Omole Phase 2": "MAINLAND_B",
  "Ojodu Berger": "MAINLAND_B",
  "Fagba": "MAINLAND_B",
  "Iju-Ishaga": "MAINLAND_B",

  // MAINLAND ZONE C
  "Orile": "MAINLAND_C",
  "Amuwo Odofin": "MAINLAND_C",
  "FESTAC": "MAINLAND_C",
  "Alakija": "MAINLAND_C",
  "Satellite": "MAINLAND_C",
  "Apapa": "MAINLAND_C",
  "Navy Town": "MAINLAND_C",
  "Mile 2": "MAINLAND_C",
  "Isolo": "MAINLAND_C",
  "Ago Palace": "MAINLAND_C",

  // MAINLAND ZONE D
  "Egbeda": "MAINLAND_D",
  "Idimu": "MAINLAND_D",
  "Igando": "MAINLAND_D",
  "Ayobo": "MAINLAND_D",
  "Aboru": "MAINLAND_D",
  "Ipaja": "MAINLAND_D",
  "Baruwa": "MAINLAND_D",

  // MAINLAND ZONE E
  "Ijegun": "MAINLAND_E",
  "Jakande": "MAINLAND_E",
  "Oke Afa": "MAINLAND_E",
  "Ikotun": "MAINLAND_E",

  // MAINLAND ZONE F
  "Abulegba": "MAINLAND_F",
  "Agege": "MAINLAND_F",
  "Ijaiye": "MAINLAND_F",
  "Ojokoro": "MAINLAND_F",
  "Alakuko": "MAINLAND_F",
  "Alagbado": "MAINLAND_F",

  // MAINLAND ZONE G
  "LASU": "MAINLAND_G",
  "Iba": "MAINLAND_G",
  "Ishashi": "MAINLAND_G",
  "Obadore": "MAINLAND_G",

  // ISLAND ZONE A
  "Ikoyi": "ISLAND_A",
  "Victoria Island": "ISLAND_A",
  "Banana Island": "ISLAND_A",
  "Obalende": "ISLAND_A",
  "Parkview Estate": "ISLAND_A",
  "Marina": "ISLAND_A",

  // ISLAND ZONE B
  "Lekki Phase 1": "ISLAND_B",
  "Ikate": "ISLAND_B",
  "Osapa London": "ISLAND_B",
  "Agungi": "ISLAND_B",
  "Ologolo": "ISLAND_B",
  "Marwa": "ISLAND_B",
  "Oniru": "ISLAND_B",

  // ISLAND ZONE C
  "Ikota": "ISLAND_C",
  "Chevron": "ISLAND_C",
  "VGC": "ISLAND_C",
  "Ajah": "ISLAND_C",
  "Sangotedo": "ISLAND_C",
  "Badore": "ISLAND_C",
  "Lekki Gardens Phase 2": "ISLAND_C",
  "Abraham Adesanya": "ISLAND_C",
  "LBS": "ISLAND_C",
  "Addo Road": "ISLAND_C",
  "Ogombo": "ISLAND_C",
  "Ilaje": "ISLAND_C",
  "Orchid Road": "ISLAND_C",
  "Langbasa": "ISLAND_C",

  // TEST LOCATION (Temporary for testing)
  "Test Location": "TEST_LOCATION",
};

// Pickup Locations (Only available at these locations)
export const pickupLocations = [
  "Chevron",
  "Orchid Road",
];

// Zone to Zone Delivery Pricing Matrix (in Nigerian Naira)
export const deliveryMatrix = {
  MAINLAND_A: {
    MAINLAND_A: 2500,
    MAINLAND_B: 3000,
    MAINLAND_C: 3500,
    MAINLAND_D: 3500,
    MAINLAND_E: 4000,
    MAINLAND_F: 4000,
    MAINLAND_G: 4500,
    ISLAND_A: 3000,
    ISLAND_B: 3500,
    ISLAND_C: 4000,
  },

  MAINLAND_B: {
    MAINLAND_A: 3000,
    MAINLAND_B: 2500,
    MAINLAND_C: 3500,
    MAINLAND_D: 3500,
    MAINLAND_E: 4000,
    MAINLAND_F: 4500,
    MAINLAND_G: 4500,
    ISLAND_A: 3500,
    ISLAND_B: 4500,
    ISLAND_C: 4500,
  },

  MAINLAND_C: {
    MAINLAND_A: 3500,
    MAINLAND_B: 3500,
    MAINLAND_C: 2500,
    MAINLAND_D: 4000,
    MAINLAND_E: 3500,
    MAINLAND_F: 4000,
    MAINLAND_G: 4000,
    ISLAND_A: 3500,
    ISLAND_B: 4000,
    ISLAND_C: 4500,
  },

  MAINLAND_D: {
    MAINLAND_A: 3500,
    MAINLAND_B: 3500,
    MAINLAND_C: 4000,
    MAINLAND_D: 2500,
    MAINLAND_E: 3500,
    MAINLAND_F: 4000,
    MAINLAND_G: 4000,
    ISLAND_A: 3500,
    ISLAND_B: 4000,
    ISLAND_C: 4500,
  },

  MAINLAND_E: {
    MAINLAND_A: 4000,
    MAINLAND_B: 4000,
    MAINLAND_C: 4000,
    MAINLAND_D: 3500,
    MAINLAND_E: 2500,
    MAINLAND_F: 4500,
    MAINLAND_G: 4500,
    ISLAND_A: 3500,
    ISLAND_B: 4000,
    ISLAND_C: 4500,
  },

  MAINLAND_F: {
    MAINLAND_A: 4000,
    MAINLAND_B: 4500,
    MAINLAND_C: 4500,
    MAINLAND_D: 4000,
    MAINLAND_E: 4500,
    MAINLAND_F: 2500,
    MAINLAND_G: 4500,
    ISLAND_A: 4000,
    ISLAND_B: 4500,
    ISLAND_C: 4500,
  },

  MAINLAND_G: {
    MAINLAND_A: 4500,
    MAINLAND_B: 4500,
    MAINLAND_C: 4500,
    MAINLAND_D: 4000,
    MAINLAND_E: 4500,
    MAINLAND_F: 2500,
    MAINLAND_G: 2500,
    ISLAND_A: 4000,
    ISLAND_B: 4500,
    ISLAND_C: 4500,
  },

  ISLAND_A: {
    MAINLAND_A: 3000,
    MAINLAND_B: 3500,
    MAINLAND_C: 3500,
    MAINLAND_D: 3500,
    MAINLAND_E: 3500,
    MAINLAND_F: 4000,
    MAINLAND_G: 4000,
    ISLAND_A: 2500,
    ISLAND_B: 3000,
    ISLAND_C: 3500,
  },

  ISLAND_B: {
    MAINLAND_A: 3500,
    MAINLAND_B: 4000,
    MAINLAND_C: 4500,
    MAINLAND_D: 4000,
    MAINLAND_E: 4500,
    MAINLAND_F: 4500,
    MAINLAND_G: 4500,
    ISLAND_A: 3000,
    ISLAND_B: 2500,
    ISLAND_C: 3000,
  },

  ISLAND_C: {
    MAINLAND_A: 4000,
    MAINLAND_B: 4500,
    MAINLAND_C: 4500,
    MAINLAND_D: 4500,
    MAINLAND_E: 4500,
    MAINLAND_F: 4500,
    MAINLAND_G: 4500,
    ISLAND_A: 3500,
    ISLAND_B: 3000,
    ISLAND_C: 2500,
  },
};
