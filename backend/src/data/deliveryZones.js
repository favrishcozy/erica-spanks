/**
 * Lagos Delivery Zones and Area Mapping
 * MAJ EXCEL SERVICES 2024 DELIVERY PRICE LIST
 */

// Area to Zone Mapping
export const areaToZone = {
  // MAINLAND ZONE A
  "surulere": "MAINLAND_A",
  "costain": "MAINLAND_A",
  "ojuelegba": "MAINLAND_A",
  "mushin": "MAINLAND_A",
  "palmgrove": "MAINLAND_A",
  "yaba": "MAINLAND_A",
  "bariga": "MAINLAND_A",
  "gbagada": "MAINLAND_A",
  "ajao estate": "MAINLAND_A",
  "oshodi": "MAINLAND_A",
  "ikeja": "MAINLAND_A",
  "ojota": "MAINLAND_A",
  "ogudu": "MAINLAND_A",
  "oworonshoki": "MAINLAND_A",
  "somolu": "MAINLAND_A",
  "ikosi-ketu": "MAINLAND_A",
  "alapere": "MAINLAND_A",

  // MAINLAND ZONE B
  "ogba": "MAINLAND_B",
  "magodo": "MAINLAND_B",
  "magodo 1": "MAINLAND_B",
  "magodo 2": "MAINLAND_B",
  "omole phase 1": "MAINLAND_B",
  "omole phase 2": "MAINLAND_B",
  "ojodu berger": "MAINLAND_B",
  "fagba": "MAINLAND_B",
  "iju-ishaga": "MAINLAND_B",

  // MAINLAND ZONE C
  "orile": "MAINLAND_C",
  "amuwo odofin": "MAINLAND_C",
  "festac": "MAINLAND_C",
  "alakija": "MAINLAND_C",
  "satellite": "MAINLAND_C",
  "apapa": "MAINLAND_C",
  "navy town": "MAINLAND_C",
  "mile 2": "MAINLAND_C",
  "isolo": "MAINLAND_C",
  "ago palace": "MAINLAND_C",

  // MAINLAND ZONE D
  "egbeda": "MAINLAND_D",
  "idimu": "MAINLAND_D",
  "igando": "MAINLAND_D",
  "ayobo": "MAINLAND_D",
  "aboru": "MAINLAND_D",
  "ipaja": "MAINLAND_D",
  "baruwa": "MAINLAND_D",

  // MAINLAND ZONE E
  "ijegun": "MAINLAND_E",
  "jakande": "MAINLAND_E",
  "oke afa": "MAINLAND_E",
  "ikotun": "MAINLAND_E",

  // MAINLAND ZONE F
  "abulegba": "MAINLAND_F",
  "agege": "MAINLAND_F",
  "ijaiye": "MAINLAND_F",
  "ojokoro": "MAINLAND_F",
  "alakuko": "MAINLAND_F",
  "alagbado": "MAINLAND_F",

  // MAINLAND ZONE G
  "lasu": "MAINLAND_G",
  "iba": "MAINLAND_G",
  "ishashi": "MAINLAND_G",
  "obadore": "MAINLAND_G",

  // ISLAND ZONE A
  "ikoyi": "ISLAND_A",
  "victoria island": "ISLAND_A",
  "banana island": "ISLAND_A",
  "obalende": "ISLAND_A",
  "parkview estate": "ISLAND_A",
  "marina": "ISLAND_A",

  // ISLAND ZONE B
  "lekki phase 1": "ISLAND_B",
  "ikate": "ISLAND_B",
  "osapa london": "ISLAND_B",
  "agungi": "ISLAND_B",
  "ologolo": "ISLAND_B",
  "marwa": "ISLAND_B",
  "oniru": "ISLAND_B",

  // ISLAND ZONE C
  "ikota": "ISLAND_C",
  "chevron": "ISLAND_C",
  "vgc": "ISLAND_C",
  "ajah": "ISLAND_C",
  "sangotedo": "ISLAND_C",
  "badore": "ISLAND_C",
  "lekki gardens phase 2": "ISLAND_C",
  "abraham adesanya": "ISLAND_C",
  "lbs": "ISLAND_C",
  "addo road": "ISLAND_C",
  "ogombo": "ISLAND_C",
  "ilaje": "ISLAND_C",
  "orchid road": "ISLAND_C",
  "langbasa": "ISLAND_C",
};

// Pickup Locations (Only available at these locations)
export const pickupLocations = [
  "chevron",
  "orchid road",
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
