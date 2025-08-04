import { Wine } from '../types';

export const wines: Wine[] = [
  {
    id: '1',
    name: 'Châteauneuf-du-Pape Rouge 2019',
    type: 'red',
    country: 'France',
    region: 'Rhône Valley',
    year: 2019,
    price: 2500000,
    originalPrice: 2800000,
    rating: 4.8,
    reviews: 127,
    description: 'Một chai rượu vang đỏ đặc biệt từ vùng Châteauneuf-du-Pape danh tiếng. Hương vị phức tạp với note của quả mọng đen, gia vị và một chút khói.',
    images: [
      'https://images.pexels.com/photos/1407244/pexels-photo-1407244.jpeg',
      'https://images.pexels.com/photos/1407249/pexels-photo-1407249.jpeg',
    ],
    inStock: true,
    featured: true,
    alcohol: 14.5,
    volume: 750,
    grapes: ['Syrah', 'Grenache', 'Mourvèdre'],
    winery: 'Domaine de la Côte',
    servingTemp: '16-18°C',
    pairings: ['Thịt nướng', 'Phô mai', 'Sô cô la đen'],
  },
  {
    id: '2',
    name: 'Barolo DOCG 2018',
    type: 'red',
    country: 'Italy',
    region: 'Piedmont',
    year: 2018,
    price: 3200000,
    rating: 4.9,
    reviews: 89,
    description: 'Rượu vang đỏ cao cấp từ vùng Barolo, Italy. Được làm từ nho Nebbiolo 100%, mang hương vị sang trọng và độ phức tạp cao.',
    images: [
      'https://images.pexels.com/photos/1407242/pexels-photo-1407242.jpeg',
      'https://images.pexels.com/photos/1407245/pexels-photo-1407245.jpeg',
    ],
    inStock: true,
    featured: true,
    alcohol: 15,
    volume: 750,
    grapes: ['Nebbiolo'],
    winery: 'Antinori',
    servingTemp: '18-20°C',
    pairings: ['Thịt bò', 'Nấm truffle', 'Phô mai cứng'],
  },
  
];

export const countries = ['France', 'Italy', 'Spain', 'Germany', 'USA', 'Australia'];
export const wineTypes = ['red', 'white', 'rose', 'sparkling'];