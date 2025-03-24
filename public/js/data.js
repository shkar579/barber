const products = [
  {
    id: '1',
    name: 'Premium Headphones',
    description: 'High-quality wireless headphones with noise cancellation and premium sound',
    price: 254.99,
    originalPrice: 299.99,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    stock: 10,
    category: 'Headphones',
    rating: 4.8,
    reviewCount: 124
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Modern smartwatch with health tracking and notifications',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    stock: 12,
    category: 'Wearables',
    rating: 4.5,
    reviewCount: 89
  },
  {
    id: '3',
    name: 'Laptop Stand',
    description: 'Ergonomic laptop stand for better posture and cooling',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80',
    stock: 0,
    category: 'Accessories',
    rating: 4.2,
    reviewCount: 56
  },
  {
    id: '4',
    name: 'Wireless Mouse',
    description: 'Precision wireless mouse with ergonomic design and long battery life',
    price: 63.99,
    originalPrice: 79.99,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80',
    stock: 15,
    category: 'Accessories',
    rating: 4.6,
    reviewCount: 102
  },
  // {
  //   id: '5',
  //   name: 'Mechanical Keyboard',
  //   description: 'RGB mechanical keyboard with customizable switches and programmable keys',
  //   price: 129.99,
  //   image: 'https://images.unsplash.com/photo-1595044778792-33f0a70b0b9c?w=500&q=80',
  //   stock: 8,
  //   category: 'Accessories',
  //   rating: 4.9,
  //   reviewCount: 112
  // },
  {
    id: '6',
    name: 'Portable SSD',
    description: '1TB portable SSD with USB-C connectivity and fast transfer speeds',
    price: 159.99,
    originalPrice: 189.99,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=500&q=80',
    stock: 20,
    category: 'Storage',
    rating: 4.7,
    reviewCount: 65
  },
  {
    id: '7',
    name: 'Ultrawide Monitor',
    description: '34-inch curved ultrawide monitor with HDR support and high refresh rate',
    price: 499.99,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
    stock: 5,
    category: 'Monitors',
    rating: 4.8,
    reviewCount: 42
  },
  {
    id: '8',
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds with active noise cancellation and long battery life',
    price: 149.99,
    originalPrice: 179.99,
    discount: 16,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80',
    stock: 25,
    category: 'Audio',
    rating: 4.4,
    reviewCount: 112
  }
];

const customers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, City',
    totalDebt: 0,
    purchaseHistory: []
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '(555) 987-6543',
    address: '456 Oak Ave, Town',
    totalDebt: 299.99,
    purchaseHistory: []
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '(555) 456-7890',
    address: '789 Pine Rd, Village',
    totalDebt: 150.50,
    purchaseHistory: []
  }
];