/**
 * Data Layer - Menu Static Data Source
 * Contains raw menu items and categories for RIO Chicken Digital Menu.
 */
(function (root) {
  'use strict';

  const MENU_CATEGORIES = [
    {
      "id": "All",
      "label": "All items",
      "icon": "✨"
    },
    {
      "id": "Chicken",
      "label": "Chicken",
      "icon": "🍗"
    },
    {
      "id": "Burgers",
      "label": "Burgers",
      "icon": "🍔"
    },
    {
      "id": "Sandwiches",
      "label": "Sandwiches",
      "icon": "🥪"
    },
    {
      "id": "Sides",
      "label": "Sides",
      "icon": "🍟"
    },
    {
      "id": "Sauces",
      "label": "Sauces",
      "icon": "🥫"
    },
    {
      "id": "Kids",
      "label": "Kids meal",
      "icon": "🧒"
    }
  ];

  const MENU_ITEMS = [
    {
      "id": "item-01",
      "name": "Broast Chicken Normal",
      "price": 18,
      "category": "Chicken",
      "quantity": "4 pcs",
      "emoji": "🍗",
      "description": "4 pieces",
      "image": "assets/images/items/Crispy Fried Chicken Feast with Fries.webp"
    },
    {
      "id": "item-02",
      "name": "Broast Chicken Spicy",
      "price": 18,
      "category": "Chicken",
      "quantity": "4 pcs",
      "emoji": "🍗",
      "description": "4 pieces",
      "image": "assets/images/items/Crispy Fried Chicken Feast with Fr.webp"
    },
    {
      "id": "item-03",
      "name": "Broast Chicken (16 pcs)",
      "price": 70,
      "category": "Chicken",
      "quantity": "16 pcs",
      "emoji": "🍗",
      "description": "Family pack",
      "image": "assets/images/items/Crispy Chicken Feast with Fries and Sauces.webp"
    },
    {
      "id": "item-04",
      "name": "Broast Chicken (12 pcs)",
      "price": 53,
      "category": "Chicken",
      "quantity": "12 pcs",
      "emoji": "🍗",
      "description": "Family pack",
      "image": "assets/images/items/Crispy Chicken Feast with Fries and Sauces.webp"
    },
    {
      "id": "item-05",
      "name": "Chicken Nuggets Normal",
      "price": 18,
      "category": "Chicken",
      "quantity": "8 pcs",
      "emoji": "🍗",
      "description": "8 pieces",
      "image": "assets/images/items/Golden Chicken Nuggets with Dips and Fries.webp"
    },
    {
      "id": "item-06",
      "name": "Chicken Nuggets Spicy",
      "price": 18,
      "category": "Chicken",
      "quantity": "8 pcs",
      "emoji": "🍗",
      "description": "8 pieces",
      "image": "assets/images/items/Spicy Chicken Nuggets Meal Plate.webp"
    },
    {
      "id": "item-07",
      "name": "Cheese Sticks",
      "price": 18,
      "category": "Sides",
      "quantity": "8 pcs",
      "emoji": "🧀",
      "description": "8 pieces",
      "image": "assets/images/items/Crispy Cheese Sticks with Fries and Dips.webp"
    },
    {
      "id": "item-08",
      "name": "Fish Fillet Regular",
      "price": 20,
      "category": "Chicken",
      "quantity": "8 pcs",
      "emoji": "🐟",
      "description": "8 pieces",
      "image": "assets/images/items/Crispy Fish Fillets with Fries and Dips.webp"
    },
    {
      "id": "item-09",
      "name": "Fish Fillet Spicy",
      "price": 20,
      "category": "Chicken",
      "quantity": "8 pcs",
      "emoji": "🐟",
      "description": "8 pieces",
      "image": "assets/images/items/Spicy Crispy Fish Fillets with Fries.webp"
    },
    {
      "id": "item-10",
      "name": "Zinger Regular (4 pcs)",
      "price": 23,
      "category": "Chicken",
      "quantity": "4 pcs",
      "emoji": "🍗",
      "description": "4 pieces",
      "image": "assets/images/items/Crispy Fried Chicken with Fries and Dips.webp"
    },
    {
      "id": "item-11",
      "name": "Zinger Spicy (4 pcs)",
      "price": 23,
      "category": "Chicken",
      "quantity": "4 pcs",
      "emoji": "🍗",
      "description": "4 pieces",
      "image": "assets/images/items/Crispy Spicy Chicken Platter with Chillies.webp"
    },
    {
      "id": "item-12",
      "name": "Shrimp",
      "price": 20,
      "category": "Chicken",
      "quantity": "10 pcs",
      "emoji": "🍤",
      "description": "10 pieces",
      "image": "assets/images/items/Crispy Shrimp, Fries and Dips.webp"
    },
    {
      "id": "item-13",
      "name": "Chicken Popcorn",
      "price": 18,
      "category": "Chicken",
      "quantity": "8 pcs",
      "emoji": "🍗",
      "description": "8 pieces",
      "image": "assets/images/items/Crispy Popcorn Chicken Bucket.webp"
    },
    {
      "id": "item-14",
      "name": "Strips Regular (4 pcs)",
      "price": 12,
      "category": "Chicken",
      "quantity": "4 pcs",
      "emoji": "🍗",
      "description": "4 pieces",
      "image": "assets/images/items/Crispy Chicken Strips with Fries and Dips.webp"
    },
    {
      "id": "item-15",
      "name": "Strips Spicy (4 pcs)",
      "price": 12,
      "category": "Chicken",
      "quantity": "4 pcs",
      "emoji": "🍗",
      "description": "4 pieces",
      "image": "assets/images/items/Spicy Chili Chicken Strips.webp"
    },
    {
      "id": "item-16",
      "name": "Strips Regular (6 pcs)",
      "price": 17,
      "category": "Chicken",
      "quantity": "6 pcs",
      "emoji": "🍗",
      "description": "6 pieces",
      "image": "assets/images/items/Golden Crispy Rio Chicken Box.webp"
    },
    {
      "id": "item-17",
      "name": "Strips Spicy (6 pcs)",
      "price": 17,
      "category": "Chicken",
      "quantity": "6 pcs",
      "emoji": "🍗",
      "description": "6 pieces",
      "image": "assets/images/items/Spicy Rio Chicken Box with Fries.webp"
    },
    {
      "id": "item-18",
      "name": "Zinger Sandwich",
      "price": 17,
      "category": "Sandwiches",
      "quantity": "",
      "emoji": "🥪",
      "description": "",
      "image": "assets/images/items/Grilled Chicken Wrap Combo with Fries and Pepsi.webp"
    },
    {
      "id": "item-19",
      "name": "Chicken Sandwich",
      "price": 16,
      "category": "Sandwiches",
      "quantity": "",
      "emoji": "🥪",
      "description": "",
      "image": "assets/images/items/Crispy Chicken Wrap Feast.webp"
    },
    {
      "id": "item-20",
      "name": "Fish Sandwich",
      "price": 17,
      "category": "Sandwiches",
      "quantity": "",
      "emoji": "🥪",
      "description": "",
      "image": "assets/images/items/Crispy Fish Wrap Meal with Fries and Pepsi.webp"
    },
    {
      "id": "item-21",
      "name": "Shrimp Sandwich",
      "price": 17,
      "category": "Sandwiches",
      "quantity": "",
      "emoji": "🥪",
      "description": "",
      "image": "assets/images/items/Crispy Shrimp Wrap Meal.webp"
    },
    {
      "id": "item-22",
      "name": "Tortilla Wrap",
      "price": 17,
      "category": "Sandwiches",
      "quantity": "",
      "emoji": "🌯",
      "description": "",
      "image": "assets/images/items/Crispy Chicken Tortilla Wrap Meal.webp"
    },
    {
      "id": "item-23",
      "name": "Club Sandwich",
      "price": 15,
      "category": "Sandwiches",
      "quantity": "",
      "emoji": "🥪",
      "description": "",
      "image": "assets/images/items/Classic Club Sandwich Platter.webp"
    },
    {
      "id": "item-24",
      "name": "Chicken Fries",
      "price": 15,
      "category": "Sides",
      "quantity": "",
      "emoji": "🍟",
      "description": "",
      "image": "assets/images/items/Crispy Chicken Fries Bowl.webp"
    },
    {
      "id": "item-25",
      "name": "French Fries",
      "price": null,
      "category": "Sides",
      "quantity": "05 / 07 / 12",
      "emoji": "🍟",
      "description": "Price options shown as 05 / 07 / 12",
      "image": "assets/images/items/Crispy Golden Fries in White Tray.webp"
    },
    {
      "id": "item-26",
      "name": "Chicken Burger",
      "price": 16,
      "category": "Burgers",
      "quantity": "",
      "emoji": "🍔",
      "description": "",
      "image": "assets/images/items/Crispy Chicken Burger Feast.webp"
    },
    {
      "id": "item-27",
      "name": "Beef Burger",
      "price": 16,
      "category": "Burgers",
      "quantity": "",
      "emoji": "🍔",
      "description": "",
      "image": "assets/images/items/Juicy Double Beef Burger Meal.webp"
    },
    {
      "id": "item-28",
      "name": "Zinger Burger",
      "price": 16,
      "category": "Burgers",
      "quantity": "",
      "emoji": "🍔",
      "description": "",
      "image": "assets/images/items/Crispy Chicken Zinger Combo.webp"
    },
    {
      "id": "item-29",
      "name": "Chicken Burger Double",
      "price": 20,
      "category": "Burgers",
      "quantity": "",
      "emoji": "🍔",
      "description": "",
      "image": "assets/images/items/Double Chicken Burger Combo on Yellow.webp"
    },
    {
      "id": "item-30",
      "name": "Beef Burger Double",
      "price": 16,
      "category": "Burgers",
      "quantity": "",
      "emoji": "🍔",
      "description": "",
      "image": "assets/images/items/Double Beef Burger Feast.webp"
    },
    {
      "id": "item-31",
      "name": "Fish Burger",
      "price": 17,
      "category": "Burgers",
      "quantity": "",
      "emoji": "🍔",
      "description": "",
      "image": "assets/images/items/Crispy Fish Burger Meal with Fries and Soda.webp"
    },
    {
      "id": "item-32",
      "name": "Kids Meal",
      "price": 15,
      "category": "Kids",
      "quantity": "1 meal",
      "emoji": "🧒",
      "description": "",
      "image": "assets/images/items/Colourful Kids Meal with Mango Juice and Nuggets.webp"
    },
    {
      "id": "item-33",
      "name": "Coleslaw",
      "price": 5,
      "category": "Sauces",
      "quantity": "",
      "emoji": "🥗",
      "description": "",
      "image": "assets/images/items/Creamy Coleslaw in a White Bowl.webp"
    },
    {
      "id": "item-34",
      "name": "Hummus",
      "price": 6,
      "category": "Sauces",
      "quantity": "",
      "emoji": "🥣",
      "description": "",
      "image": "assets/images/items/Creamy Hummus with Chickpeas and Parsley.webp"
    },
    {
      "id": "item-35",
      "name": "Garlic Sauce",
      "price": 1,
      "category": "Sauces",
      "quantity": "",
      "emoji": "🧄",
      "description": "",
      "image": "assets/images/items/Creamy Garlic Dip in Black Ramekin.webp"
    },
    {
      "id": "item-36",
      "name": "Garlic Spicy Sauce",
      "price": 1,
      "category": "Sauces",
      "quantity": "",
      "emoji": "🌶️",
      "description": "",
      "image": "assets/images/items/Creamy Orange Garlic-Spice Sauce.webp"
    },
    {
      "id": "item-37",
      "name": "Cocktail Sauce",
      "price": 1,
      "category": "Sauces",
      "quantity": "",
      "emoji": "🥫",
      "description": "",
      "image": "assets/images/items/Glossy Orange Sauce Cup.webp"
    },
    {
      "id": "item-38",
      "name": "Ketchup",
      "price": 1,
      "category": "Sauces",
      "quantity": "",
      "emoji": "🍅",
      "description": "",
      "image": "assets/images/items/Glossy Ketchup Spiral in White Bowl.webp"
    },
    {
      "id": "item-39",
      "name": "BBQ Sauce",
      "price": 1,
      "category": "Sauces",
      "quantity": "",
      "emoji": "🥫",
      "description": "",
      "image": "assets/images/items/Glossy BBQ Sauce in Ribbed Ramekin.webp"
    }
  ];

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Data = root.RioMenu.Data || {};
  root.RioMenu.Data.MENU_CATEGORIES = MENU_CATEGORIES;
  root.RioMenu.Data.MENU_ITEMS = MENU_ITEMS;
})(typeof window !== 'undefined' ? window : globalThis);
