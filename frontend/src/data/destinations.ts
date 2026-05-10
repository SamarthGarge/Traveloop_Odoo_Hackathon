export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  costIndex: string;
  popularity: number;
  activities: string[];
}

export interface Activity {
  id: string;
  name: string;
  type: string;
  cost: string;
  duration: string;
  image: string;
  description: string;
  destination: string;
}

export const destinations: Destination[] = [
  { id: 'd1', name: 'Paris', country: 'France', image: '/images/dest-paris.jpg', description: 'City of lights, romance, and world-class cuisine', costIndex: 'High', popularity: 95, activities: ['Sightseeing', 'Museums', 'Food Tours'] },
  { id: 'd2', name: 'Tokyo', country: 'Japan', image: '/images/dest-tokyo.jpg', description: 'Where ancient tradition meets futuristic innovation', costIndex: 'Medium', popularity: 92, activities: ['Temples', 'Shopping', 'Food Tours'] },
  { id: 'd3', name: 'Reykjavik', country: 'Iceland', image: '/images/dest-iceland.jpg', description: 'Gateway to the land of fire and ice', costIndex: 'High', popularity: 78, activities: ['Northern Lights', 'Hiking', 'Hot Springs'] },
  { id: 'd4', name: 'Santorini', country: 'Greece', image: '/images/dest-santorini.jpg', description: 'Iconic white-washed buildings with stunning sunsets', costIndex: 'High', popularity: 88, activities: ['Beaches', 'Wine Tasting', 'Sightseeing'] },
  { id: 'd5', name: 'Bali', country: 'Indonesia', image: '/images/dest-bali.jpg', description: 'Tropical paradise with rich cultural heritage', costIndex: 'Low', popularity: 90, activities: ['Beaches', 'Yoga', 'Temples'] },
  { id: 'd6', name: 'Machu Picchu', country: 'Peru', image: '/images/dest-machupicchu.jpg', description: 'Ancient Incan citadel in the clouds', costIndex: 'Medium', popularity: 85, activities: ['Hiking', 'History', 'Photography'] },
  { id: 'd7', name: 'Maldives', country: 'Maldives', image: '/images/dest-maldives.jpg', description: 'Crystal clear waters and overwater luxury', costIndex: 'Very High', popularity: 82, activities: ['Diving', 'Snorkeling', 'Relaxation'] },
  { id: 'd8', name: 'New York', country: 'USA', image: '/images/dest-newyork.jpg', description: 'The city that never sleeps', costIndex: 'High', popularity: 93, activities: ['Theater', 'Museums', 'Shopping'] },
  { id: 'd9', name: 'Dubai', country: 'UAE', image: '/images/dest-dubai.jpg', description: 'Ultra-modern oasis in the desert', costIndex: 'High', popularity: 87, activities: ['Shopping', 'Desert Safari', 'Architecture'] },
  { id: 'd10', name: 'Swiss Alps', country: 'Switzerland', image: '/images/dest-swiss.jpg', description: 'Majestic mountains and pristine lakes', costIndex: 'Very High', popularity: 80, activities: ['Skiing', 'Hiking', 'Scenic Trains'] },
  { id: 'd11', name: 'Marrakech', country: 'Morocco', image: '/images/dest-morocco.jpg', description: 'Vibrant markets and rich cultural tapestry', costIndex: 'Low', popularity: 75, activities: ['Markets', 'Food Tours', 'Architecture'] },
  { id: 'd12', name: 'Sydney', country: 'Australia', image: '/images/dest-sydney.jpg', description: 'Harbor city with iconic landmarks', costIndex: 'High', popularity: 84, activities: ['Beaches', 'Harbor Cruise', 'Wildlife'] },
  { id: 'd13', name: 'Rome', country: 'Italy', image: '/images/dest-rome.jpg', description: 'The eternal city with millennia of history', costIndex: 'Medium', popularity: 91, activities: ['History', 'Food Tours', 'Museums'] },
  { id: 'd14', name: 'Cape Town', country: 'South Africa', image: '/images/dest-capetown.jpg', description: 'Stunning coastlines and mountain vistas', costIndex: 'Medium', popularity: 76, activities: ['Safari', 'Wine Tasting', 'Hiking'] },
];

export const activities: Activity[] = [
  { id: 'a1', name: 'Eiffel Tower Skip-the-Line', type: 'Sightseeing', cost: '€35', duration: '2-3 hours', image: '/images/dest-paris.jpg', description: 'Priority access to the iconic iron lady with summit views', destination: 'Paris' },
  { id: 'a2', name: 'Louvre Museum Guided Tour', type: 'Museums', cost: '€45', duration: '3 hours', image: '/images/dest-paris.jpg', description: 'Expert-guided tour through the world\'s largest art museum', destination: 'Paris' },
  { id: 'a3', name: 'Seine River Dinner Cruise', type: 'Food Tours', cost: '€85', duration: '2.5 hours', image: '/images/dest-paris.jpg', description: 'Romantic dinner cruise along the illuminated Seine', destination: 'Paris' },
  { id: 'a4', name: 'Tsukiji Fish Market Tour', type: 'Food Tours', cost: '¥8,000', duration: '3 hours', image: '/images/dest-tokyo.jpg', description: 'Early morning sushi breakfast and market exploration', destination: 'Tokyo' },
  { id: 'a5', name: 'Mt. Fuji Day Trip', type: 'Sightseeing', cost: '¥12,000', duration: '10 hours', image: '/images/dest-tokyo.jpg', description: 'Scenic day trip to Japan\'s iconic mountain', destination: 'Tokyo' },
  { id: 'a6', name: 'Northern Lights Tour', type: 'Adventure', cost: 'ISK 15,000', duration: '4 hours', image: '/images/dest-iceland.jpg', description: 'Hunt for the aurora borealis with expert guides', destination: 'Reykjavik' },
  { id: 'a7', name: 'Blue Lagoon Experience', type: 'Relaxation', cost: 'ISK 12,000', duration: '3 hours', image: '/images/dest-iceland.jpg', description: 'Soak in geothermal waters surrounded by lava fields', destination: 'Reykjavik' },
  { id: 'a8', name: 'Golden Circle Tour', type: 'Sightseeing', cost: 'ISK 10,000', duration: '8 hours', image: '/images/dest-iceland.jpg', description: 'Classic route through Iceland\'s natural wonders', destination: 'Reykjavik' },
  { id: 'a9', name: 'Sunset Wine Tasting', type: 'Food Tours', cost: '€65', duration: '2 hours', image: '/images/dest-santorini.jpg', description: 'Sample volcanic wines with caldera sunset views', destination: 'Santorini' },
  { id: 'a10', name: 'Ubud Rice Terrace Walk', type: 'Nature', cost: 'IDR 150,000', duration: '2 hours', image: '/images/dest-bali.jpg', description: 'Guided walk through UNESCO-recognized rice terraces', destination: 'Bali' },
  { id: 'a11', name: 'Colosseum Underground Tour', type: 'History', cost: '€55', duration: '3 hours', image: '/images/dest-rome.jpg', description: 'Exclusive access to underground chambers and arena floor', destination: 'Rome' },
  { id: 'a12', name: 'Vatican Museums Early Access', type: 'Museums', cost: '€50', duration: '3 hours', image: '/images/dest-rome.jpg', description: 'Beat the crowds with early morning Sistine Chapel access', destination: 'Rome' },
  { id: 'a13', name: 'Desert Safari & Camp', type: 'Adventure', cost: 'AED 350', duration: '6 hours', image: '/images/dest-dubai.jpg', description: 'Dune bashing, camel rides, and Bedouin dinner', destination: 'Dubai' },
  { id: 'a14', name: 'Safari Game Drive', type: 'Wildlife', cost: 'ZAR 2,500', duration: '4 hours', image: '/images/dest-safari.jpg', description: 'Spot the Big Five in their natural habitat', destination: 'Cape Town' },
  { id: 'a15', name: 'Table Mountain Cableway', type: 'Sightseeing', cost: 'ZAR 400', duration: '2 hours', image: '/images/dest-capetown.jpg', description: '360-degree rotating cable car to the summit', destination: 'Cape Town' },
  { id: 'a16', name: 'Paragliding Tandem Flight', type: 'Adventure', cost: 'CHF 180', duration: '1.5 hours', image: '/images/dest-swiss.jpg', description: 'Soar over Interlaken with breathtaking alpine views', destination: 'Swiss Alps' },
  { id: 'a17', name: 'Snorkeling with Mantas', type: 'Diving', cost: '$120', duration: '3 hours', image: '/images/dest-maldives.jpg', description: 'Swim alongside gentle manta rays at a cleaning station', destination: 'Maldives' },
  { id: 'a18', name: 'Harbor Bridge Climb', type: 'Adventure', cost: 'A$268', duration: '3.5 hours', description: 'Scale the iconic Sydney Harbour Bridge for panoramic views', image: '/images/dest-sydney.jpg', destination: 'Sydney' },
];
