// test/simple.test.js
describe('🚀 E-commerce Backend Tests', () => {
  
  test('Basic math operations', () => {
    expect(2 + 2).toBe(4);
    expect(10 * 5).toBe(50);
  });

  test('String validations', () => {
    const email = 'user@example.com';
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(email).toContain('@');
  });

  test('Array operations for cart', () => {
    const cart = [
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 }
    ];
    
    expect(cart).toHaveLength(2);
    expect(cart[0]).toHaveProperty('price');
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    expect(total).toBe(300);
  });

  test('User object validation', () => {
    const user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword123',
      role: 'customer'
    };
    
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user.role).toBe('customer');
    expect(typeof user.id).toBe('number');
  });

  test('Product validation', () => {
    const product = {
      id: 1,
      name: 'Laptop',
      price: 999.99,
      category: 'Electronics',
      stock: 10,
      description: 'High-performance laptop'
    };
    
    expect(product.price).toBeGreaterThan(0);
    expect(product.stock).toBeGreaterThanOrEqual(0);
    expect(product.name).toBeTruthy();
    expect(product.category).toBe('Electronics');
  });

});

// Additional utility function tests
describe('🛠️ Utility Functions', () => {
  
  test('Password validation', () => {
    const isValidPassword = (password) => {
      return password.length >= 6 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    };
    
    expect(isValidPassword('abc123')).toBe(true);
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('abcdef')).toBe(false);
  });

  test('Email validation', () => {
    const isValidEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
  });

  test('Price formatting', () => {
    const formatPrice = (price) => {
      return `$${price.toFixed(2)}`;
    };
    
    expect(formatPrice(99.99)).toBe('$99.99');
    expect(formatPrice(100)).toBe('$100.00');
    expect(formatPrice(0.5)).toBe('$0.50');
  });

});
