export const CATEGORIES = ['Saree', 'Chudidar', 'Lehenga', 'Kurti', 'Dupatta', 'Accessories'];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export const COLOR_OPTIONS = [
  { name: 'Red', hex: '#C0392B' },
  { name: 'Maroon', hex: '#6B1A1A' },
  { name: 'Rose', hex: '#E8647A' },
  { name: 'Pink', hex: '#E91E8C' },
  { name: 'Peach', hex: '#FFAD8E' },
  { name: 'Orange', hex: '#E67E22' },
  { name: 'Gold', hex: '#D4A017' },
  { name: 'Yellow', hex: '#F1C40F' },
  { name: 'Green', hex: '#27AE60' },
  { name: 'Olive', hex: '#6B7A1A' },
  { name: 'Teal', hex: '#16A085' },
  { name: 'Blue', hex: '#2980B9' },
  { name: 'Navy', hex: '#1A2458' },
  { name: 'Purple', hex: '#8E44AD' },
  { name: 'Lavender', hex: '#B39DDB' },
  { name: 'Magenta', hex: '#C0397B' },
  { name: 'Brown', hex: '#795548' },
  { name: 'Beige', hex: '#D7CCC8' },
  { name: 'Cream', hex: '#FFF8E7' },
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Grey', hex: '#9E9E9E' },
  { name: 'Black', hex: '#212121' },
];

export const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name: A-Z', value: 'name_asc' },
];

export const WHATSAPP_NUMBER = '919442270086';

export const CONTACT = {
  name: 'Sri Sri Boutique',
  email: 'srisrirajiboutique@gmail.com',
  phone: '9442270086',
  address: [
    'Sri Lakshmi Super Market',
    '(Sri Sri Boutique)',
    '14/130 CRK Thottam',
    'Near Bhuvaneshwari Amman Temple',
    'Makkinampatti (P.O)',
    'Pollachi, Tamil Nadu - 642003',
  ],
  social: {
    instagram: 'https://www.instagram.com/srisri._boutique._?igsh=c3Rma21xenJ2cWxv',
    facebook: 'https://www.facebook.com/profile.php?id=61569906077098',
    youtube: 'https://youtube.com/@srisriboutique?si=CLgbxApmPBYD5aFb',
  },
};

export function getWhatsAppLink(message = '') {
  const encoded = encodeURIComponent(message || 'Hi, I am interested in your products!');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}
