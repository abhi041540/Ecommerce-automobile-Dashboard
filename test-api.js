const axios = require('axios');
const FormData = require('form-data');

async function testAddProduct() {
    try {
        // First login to get token
        console.log('1. Logging in...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'newowner',
            password: 'newowner123'
        });

        const token = loginResponse.data.token;
        console.log('2. Login successful, token:', token.substring(0, 20) + '...');

        // Test adding a product without image
        console.log('3. Adding product without image...');
        const productData = new FormData();
        productData.append('name', 'Test Product');
        productData.append('category', 'Test');
        productData.append('quantity', '10');
        productData.append('price', '100');
        productData.append('threshold', '5');

        const addResponse = await axios.post(
            'http://localhost:3001/api/products',
            productData,
            {
                headers: {
                    ...productData.getHeaders(),
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('4. Product added successfully:', addResponse.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

testAddProduct();
