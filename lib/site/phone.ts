// Content for the hand-built phone (components/site/phone/AppPhone.vue). The
// stores are made up; every dish is named for what its clip actually shows.
// Clips: Mealgro's own seed videos (mealgro/data), in public/media/dish.

export type Dish = {
	video: string;
	name: string;
	description: string;
	/** Price in naira. */
	price: number;
	badges?: ("popular" | "bogo" | "discount")[];
	discount?: number;
};

export type Store = {
	name: string;
	initials: string;
	area: string;
	city: string;
	minutes: string;
	rating: number;
	ratings: string;
	reviews: number;
	saves: number;
	dishes: Dish[];
};

export const STORES: Store[] = [
	{
		name: "Mama Ronke's Kitchen",
		initials: "MR",
		area: "Yaba",
		city: "Lagos",
		minutes: "25–35 mins",
		rating: 4.6,
		ratings: "300+",
		reviews: 128,
		saves: 412,
		dishes: [
			{
				video: "jollof-chicken",
				name: "Jollof Rice And Chicken",
				description: "Smoky party jollof with peppered chicken and fried plantain.",
				price: 4300,
				badges: ["popular"],
			},
			{
				video: "ewa-agoyin",
				name: "Ewa Agoyin With Dodo",
				description: "Mashed honey beans in dark pepper sauce, with plantain and fried fish.",
				price: 3200,
				badges: ["discount"],
				discount: 15,
			},
		],
	},
	{
		name: "Bayside Boil",
		initials: "BB",
		area: "Lekki",
		city: "Lagos",
		minutes: "35–50 mins",
		rating: 4.8,
		ratings: "200+",
		reviews: 96,
		saves: 688,
		dishes: [
			{
				video: "shrimp-boil",
				name: "Shrimp Boil Tray",
				description: "Prawns, sweetcorn and lemon in spicy garlic butter.",
				price: 14500,
				badges: ["popular"],
			},
			{
				video: "seafood-platter",
				name: "Seafood Boil Platter",
				description: "A big plate of prawns and sweetcorn smothered in pepper sauce.",
				price: 18000,
			},
			{
				video: "seafood-spaghetti",
				name: "Seafood Spaghetti",
				description: "Spaghetti tossed with prawns, peppers and fresh herbs.",
				price: 9800,
				badges: ["bogo"],
			},
		],
	},
	{
		name: "Red Wok",
		initials: "RW",
		area: "Ikeja",
		city: "Lagos",
		minutes: "20–30 mins",
		rating: 4.5,
		ratings: "150+",
		reviews: 64,
		saves: 305,
		dishes: [
			{
				video: "stir-fry-noodles",
				name: "Spicy Stir-Fried Noodles",
				description: "Wok-tossed noodles in chilli sauce, straight off the flame.",
				price: 4800,
				badges: ["popular"],
			},
			{
				video: "pepper-spaghetti",
				name: "Pepper Stir-Fry Spaghetti",
				description: "Spaghetti stir-fried with bell peppers, carrots and coriander.",
				price: 5200,
			},
		],
	},
	{
		name: "Mallam Sule Suya",
		initials: "MS",
		area: "Wuse",
		city: "Abuja",
		minutes: "15–25 mins",
		rating: 4.7,
		ratings: "400+",
		reviews: 211,
		saves: 954,
		dishes: [
			{
				video: "beef-suya",
				name: "Beef Suya",
				description: "Grilled beef in yaji spice, with fresh tomato and onion.",
				price: 3500,
				badges: ["popular"],
			},
			{
				video: "potato-salad",
				name: "Creamy Potato Salad",
				description: "Potatoes, sweetcorn, pickles and peppers in a creamy dressing.",
				price: 2500,
			},
		],
	},
];

/** Where the phone says it delivers to. */
export const DELIVERY_ADDRESS = "12 Herbert Macaulay Way, Yaba";

export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
