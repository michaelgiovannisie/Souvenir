import dayjs from 'dayjs'

export interface SampleDestination {
  name: string
  country: string
  city?: string
  type: 'CITY' | 'COUNTRY' | 'NATIONAL_PARK' | 'LANDMARK' | 'BEACH' | 'MOUNTAIN' | 'OTHER'
  latitude: number
  longitude: number
  rating: number
  notes?: string
  arrivalOffset: number   // days from trip start
  departureOffset: number
}

export interface SampleMemory {
  title: string
  journalEntry: string
  mood: string
  tags: string[]
  dateOffset: number // days from trip start
}

export interface SampleTrip {
  title: string
  description: string
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED'
  startOffset: number  // days relative to today (negative = past)
  durationDays: number
  destinations: SampleDestination[]
  memories: SampleMemory[]
}

export const SAMPLE_TRIPS: SampleTrip[] = [
  {
    title: 'Tokyo Week',
    description: 'Seven incredible days lost in the neon labyrinth of Tokyo — from ancient temples to midnight ramen.',
    status: 'COMPLETED',
    startOffset: -45,
    durationDays: 7,
    destinations: [
      {
        name: 'Shinjuku',
        country: 'Japan', city: 'Tokyo',
        type: 'CITY', latitude: 35.6938, longitude: 139.7034,
        rating: 5, notes: 'Neon chaos, Golden Gai, the best yakitori stalls',
        arrivalOffset: 0, departureOffset: 3,
      },
      {
        name: 'Senso-ji Temple',
        country: 'Japan', city: 'Tokyo',
        type: 'LANDMARK', latitude: 35.7148, longitude: 139.7967,
        rating: 5, notes: 'Most visited temple in the world — arrive at dawn',
        arrivalOffset: 1, departureOffset: 2,
      },
      {
        name: 'Harajuku',
        country: 'Japan', city: 'Tokyo',
        type: 'CITY', latitude: 35.6699, longitude: 139.7024,
        rating: 4, notes: 'Takeshita Street for snacks, Omotesando for calm',
        arrivalOffset: 3, departureOffset: 7,
      },
    ],
    memories: [
      {
        title: 'Ramen at midnight',
        journalEntry: 'Found this tiny ramen shop down a side alley in Shinjuku at 1am. Six seats, no English menu, the best broth I\'ve ever tasted. The chef barely looked up but nodded when I gave a thumbs up. I sat there for an hour just watching the city outside.',
        mood: 'HAPPY',
        tags: ['food', 'late-night', 'solo'],
        dateOffset: 1,
      },
      {
        title: 'Senso-ji at dawn',
        journalEntry: 'Woke at 5am to beat the crowds. Walking through the Kaminarimon gate in the mist with almost no one around felt genuinely sacred. The incense smoke curled up into the grey light. A monk was sweeping the courtyard. I didn\'t take a single photo.',
        mood: 'PEACEFUL',
        tags: ['temples', 'early-morning', 'spiritual'],
        dateOffset: 2,
      },
    ],
  },
  {
    title: 'Santorini in September',
    description: 'The crowds thin, the sea stays warm, the light turns gold. Santorini belongs to September.',
    status: 'COMPLETED',
    startOffset: -120,
    durationDays: 6,
    destinations: [
      {
        name: 'Oia',
        country: 'Greece', city: 'Santorini',
        type: 'CITY', latitude: 36.4618, longitude: 25.3753,
        rating: 5, notes: 'Stay close to the famous sunset viewpoint — worth the walk',
        arrivalOffset: 0, departureOffset: 3,
      },
      {
        name: 'Red Beach',
        country: 'Greece', city: 'Santorini',
        type: 'BEACH', latitude: 36.3487, longitude: 25.3965,
        rating: 4, notes: 'Volcanic cliffs, dramatic colours. Small beach — go early.',
        arrivalOffset: 2, departureOffset: 4,
      },
      {
        name: 'Fira',
        country: 'Greece', city: 'Santorini',
        type: 'CITY', latitude: 36.4167, longitude: 25.4319,
        rating: 4,
        arrivalOffset: 3, departureOffset: 6,
      },
    ],
    memories: [
      {
        title: 'The sunset everyone talks about',
        journalEntry: 'I\'ve seen photos of the Oia sunset so many times I assumed the reality would disappoint. It didn\'t. The sun turned the whole caldera copper and pink, and a hundred people fell completely silent at once. For about two minutes the only sound was the shutter of cameras and, somewhere, a girl crying quietly. I understood.',
        mood: 'EMOTIONAL',
        tags: ['sunset', 'iconic', 'caldera'],
        dateOffset: 1,
      },
    ],
  },
  {
    title: 'Patagonia Trek',
    description: 'Wind, rock, ice, and sky. W Trek in Torres del Paine — five days of the most beautiful suffering.',
    status: 'COMPLETED',
    startOffset: -200,
    durationDays: 10,
    destinations: [
      {
        name: 'Torres del Paine National Park',
        country: 'Chile',
        type: 'NATIONAL_PARK', latitude: -51.0000, longitude: -73.0000,
        rating: 5, notes: 'Book camps 6 months in advance. Worth every step.',
        arrivalOffset: 2, departureOffset: 8,
      },
      {
        name: 'Puerto Natales',
        country: 'Chile',
        type: 'CITY', latitude: -51.7322, longitude: -72.4958,
        rating: 4, notes: 'Gear up here. Excellent lamb stew to fuel the trek.',
        arrivalOffset: 0, departureOffset: 2,
      },
      {
        name: 'Mirador Las Torres',
        country: 'Chile',
        type: 'MOUNTAIN', latitude: -50.9423, longitude: -72.9922,
        rating: 5, notes: 'The ultimate viewpoint. Start hiking at 3am for sunrise.',
        arrivalOffset: 5, departureOffset: 6,
      },
    ],
    memories: [
      {
        title: 'Reached the towers',
        journalEntry: 'Left camp at 3:30am with headlamps. Three hours uphill in the dark, then scrambled over boulder fields. Arrived at the mirador just as the sky turned navy then violet then blinding gold. The three granite towers emerged from the dark like they were being switched on. I sat on a rock for an hour and cried, which I hadn\'t expected at all.',
        mood: 'EMOTIONAL',
        tags: ['hiking', 'sunrise', 'achievement', 'mountains'],
        dateOffset: 5,
      },
      {
        title: 'Wind that tried to eat me',
        journalEntry: 'The Patagonian wind is not a metaphor. On the exposed ridge above Grey Lake it hit 100km/h and literally knocked me off my feet. I crawled the last 200 metres to the next campsite on all fours. The Argentinian couple behind me were laughing hysterically. So was I, eventually.',
        mood: 'ADVENTUROUS',
        tags: ['wind', 'wild', 'struggle'],
        dateOffset: 3,
      },
    ],
  },
  {
    title: 'Kyoto Autumn',
    description: 'Chasing the maple leaves through bamboo groves, temple gardens, and old wooden streets.',
    status: 'COMPLETED',
    startOffset: -300,
    durationDays: 5,
    destinations: [
      {
        name: 'Arashiyama Bamboo Grove',
        country: 'Japan', city: 'Kyoto',
        type: 'LANDMARK', latitude: 35.0094, longitude: 135.6720,
        rating: 5, notes: 'Come before 7am. The light is extraordinary.',
        arrivalOffset: 0, departureOffset: 1,
      },
      {
        name: 'Fushimi Inari Shrine',
        country: 'Japan', city: 'Kyoto',
        type: 'LANDMARK', latitude: 34.9671, longitude: 135.7727,
        rating: 5, notes: 'Go at dusk — the torii glow orange and the crowds disappear',
        arrivalOffset: 1, departureOffset: 3,
      },
      {
        name: 'Gion District',
        country: 'Japan', city: 'Kyoto',
        type: 'CITY', latitude: 35.0037, longitude: 135.7765,
        rating: 4, notes: 'Walk Hanamikoji Street at night and catch a glimpse of a geiko.',
        arrivalOffset: 2, departureOffset: 5,
      },
    ],
    memories: [
      {
        title: 'The red and gold of Tofuku-ji',
        journalEntry: 'The maple trees at Tofuku-ji in November are unlike anything I\'ve seen. Every shade of red, orange and gold, reflected in the stone garden pools. An elderly Japanese man stood next to me and said, in perfect English, "Every year I wonder if I\'ll see this again." Me too now.',
        mood: 'NOSTALGIC',
        tags: ['autumn', 'temples', 'gardens', 'japan'],
        dateOffset: 3,
      },
    ],
  },
  {
    title: 'Masai Mara Safari',
    description: 'The great migration, big cats at dawn, and skies so wide you feel the planet breathing.',
    status: 'COMPLETED',
    startOffset: -500,
    durationDays: 7,
    destinations: [
      {
        name: 'Masai Mara National Reserve',
        country: 'Kenya',
        type: 'NATIONAL_PARK', latitude: -1.5056, longitude: 35.1432,
        rating: 5, notes: 'Best time is August–October for the migration crossing.',
        arrivalOffset: 1, departureOffset: 7,
      },
      {
        name: 'Nairobi',
        country: 'Kenya',
        type: 'CITY', latitude: -1.2921, longitude: 36.8219,
        rating: 4, notes: 'Giraffe Centre and Karen Blixen Museum are worth a morning.',
        arrivalOffset: 0, departureOffset: 1,
      },
    ],
    memories: [
      {
        title: 'The wildebeest crossing',
        journalEntry: 'We waited at the Mara River for four hours. Nothing. Then without warning, 5,000 wildebeest appeared on the opposite bank. The sound was like distant thunder. When the first one jumped in, the rest followed in a mad river of bodies. Crocodiles exploded from the water. Chaos and calm at the same time. Nature doing what it has done for a million years.',
        mood: 'EXCITED',
        tags: ['wildlife', 'migration', 'safari', 'africa'],
        dateOffset: 4,
      },
      {
        title: 'Lion at breakfast',
        journalEntry: 'A female lion walked within four metres of our Land Cruiser at 6am and completely ignored us. She yawned, sat down, and started cleaning her paw. Our guide whispered "she\'s eaten". We all exhaled at the same time.',
        mood: 'PEACEFUL',
        tags: ['lions', 'morning', 'wildlife'],
        dateOffset: 3,
      },
    ],
  },
  {
    title: 'New York City',
    description: 'The city that never sleeps — and made sure I didn\'t either.',
    status: 'COMPLETED',
    startOffset: -60,
    durationDays: 5,
    destinations: [
      {
        name: 'Manhattan',
        country: 'United States', city: 'New York',
        type: 'CITY', latitude: 40.7831, longitude: -73.9712,
        rating: 5, notes: 'Walk the High Line. Eat a bagel. Get lost.',
        arrivalOffset: 0, departureOffset: 5,
      },
      {
        name: 'Brooklyn Bridge',
        country: 'United States', city: 'New York',
        type: 'LANDMARK', latitude: 40.7061, longitude: -73.9969,
        rating: 5, notes: 'Walk it at sunrise from Brooklyn side for the view.',
        arrivalOffset: 1, departureOffset: 2,
      },
      {
        name: 'Central Park',
        country: 'United States', city: 'New York',
        type: 'OTHER', latitude: 40.7851, longitude: -73.9683,
        rating: 4, notes: 'Rent a bike. Take the rowboats out on the lake.',
        arrivalOffset: 2, departureOffset: 4,
      },
    ],
    memories: [
      {
        title: 'Lost in the subway at midnight',
        journalEntry: 'Got on the wrong train at Times Square after a show, ended up in Queens, then the Bronx, then somehow back at Columbus Circle. Three hours of accidental NYC tourism. Met a guy who claimed to have invented the bacon egg and cheese. Possibly true. Best night of the trip.',
        mood: 'FUNNY',
        tags: ['subway', 'lost', 'late-night', 'adventure'],
        dateOffset: 2,
      },
    ],
  },
  {
    title: 'Bali Slow Travel',
    description: 'Rice terraces, volcano sunrises, and learning to do absolutely nothing.',
    status: 'COMPLETED',
    startOffset: -150,
    durationDays: 10,
    destinations: [
      {
        name: 'Ubud',
        country: 'Indonesia', city: 'Ubud',
        type: 'CITY', latitude: -8.5069, longitude: 115.2625,
        rating: 5, notes: 'Stay at least 4 nights. Walk the Campuhan Ridge at sunrise.',
        arrivalOffset: 0, departureOffset: 5,
      },
      {
        name: 'Tegalalang Rice Terraces',
        country: 'Indonesia',
        type: 'OTHER', latitude: -8.4312, longitude: 115.2793,
        rating: 4, notes: 'Stunning at dawn before the tour groups arrive.',
        arrivalOffset: 2, departureOffset: 3,
      },
      {
        name: 'Seminyak Beach',
        country: 'Indonesia', city: 'Seminyak',
        type: 'BEACH', latitude: -8.6832, longitude: 115.1593,
        rating: 4, notes: 'Sunset drinks at Ku De Ta are compulsory.',
        arrivalOffset: 5, departureOffset: 10,
      },
    ],
    memories: [
      {
        title: 'Mount Batur sunrise',
        journalEntry: 'Hiked to the Batur crater rim in complete darkness starting at 2am. The guide made us coffee using steam vents from the volcano. Standing on an active volcano at dawn watching the clouds below glow pink — I felt a kind of quiet gratitude I rarely access. Ate a banana and started crying. Happy crying. Holiday crying.',
        mood: 'GRATEFUL',
        tags: ['volcano', 'hiking', 'sunrise', 'spiritual'],
        dateOffset: 3,
      },
    ],
  },
  {
    title: 'Iceland Ring Road',
    description: 'Chasing auroras, waterfalls, geysers and the feeling that you\'ve left the planet.',
    status: 'COMPLETED',
    startOffset: -365,
    durationDays: 8,
    destinations: [
      {
        name: 'Reykjavík',
        country: 'Iceland',
        type: 'CITY', latitude: 64.1466, longitude: -21.9426,
        rating: 4, notes: 'Hallgrímskirkja at golden hour. Lamb soup at the market.',
        arrivalOffset: 0, departureOffset: 2,
      },
      {
        name: 'Skógafoss',
        country: 'Iceland',
        type: 'LANDMARK', latitude: 63.5320, longitude: -19.5108,
        rating: 5, notes: 'Climb the stairs to the right of the falls. Rainbow almost guaranteed.',
        arrivalOffset: 2, departureOffset: 4,
      },
      {
        name: 'Jökulsárlón Glacier Lagoon',
        country: 'Iceland',
        type: 'OTHER', latitude: 64.0784, longitude: -16.2306,
        rating: 5, notes: 'Icebergs float out to the black sand beach. Otherworldly.',
        arrivalOffset: 4, departureOffset: 6,
      },
    ],
    memories: [
      {
        title: 'Northern lights at 3am',
        journalEntry: 'Woke up to a notification from the aurora app: KP index 7. Drove out past Vík in complete darkness. Then they appeared — a slow green curtain that turned violet and then went insane, dancing in arcs across the entire sky. I pulled over and got out and just stood in a field in -8°C laughing at the sky. Thirty minutes. Then gone.',
        mood: 'ADVENTUROUS',
        tags: ['aurora', 'night', 'bucket-list', 'iceland'],
        dateOffset: 5,
      },
      {
        title: 'Driving into nothing',
        journalEntry: 'Six hours on the Ring Road in a blizzard, radio picking up only static and some distant Icelandic jazz. The landscape changed from lava fields to snow plains to more lava fields. Saw zero other cars for three hours. Felt like the edge of the world. Felt correct.',
        mood: 'PEACEFUL',
        tags: ['road-trip', 'winter', 'solitude'],
        dateOffset: 3,
      },
    ],
  },
]

export function pickRandomSampleTrip(): SampleTrip {
  return SAMPLE_TRIPS[Math.floor(Math.random() * SAMPLE_TRIPS.length)]
}

export function resolveDates(template: SampleTrip) {
  const today = dayjs()
  const start = today.add(template.startOffset, 'day')
  const end = start.add(template.durationDays, 'day')
  return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') }
}
