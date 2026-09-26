const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'ANIVOM API',
    description: 'ANIVOM customised T-shirt e-commerce REST API specification & interactive documentation.',
    version: '1.0.0'
  },
  servers: [
    {
      url: 'https://anivom.onrender.com',
      description: 'Production Server'
    },
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  tags: [
    { name: 'Health', description: 'API health check' },
    { name: 'Authentication', description: 'User registration, authentication, Google OAuth & profile management' },
    { name: 'Products', description: 'Product catalog, search, filtering, and admin product/inventory management' },
    { name: 'Customizations', description: 'User T-shirt customization studio layer configurations' },
    { name: 'Cart', description: 'Shopping cart item management and checkout calculations' },
    { name: 'Addresses', description: 'Customer shipping address book management' },
    { name: 'Orders', description: 'Order placement, Razorpay payment verification, status tracking & returns' },
    { name: 'Uploads', description: 'Cloudinary image upload processing' },
    { name: 'Designs', description: 'Vector design library SVG templates for customization studio' },
    { name: 'Categories', description: 'Master product categories' },
    { name: 'Sizes', description: 'Master product sizing options' },
    { name: 'Colours', description: 'Master product color options' },
    { name: 'Coupons', description: 'Promotional discount coupons' },
    { name: 'Banners', description: 'Homepage hero carousel banners' },
    { name: 'Wishlist', description: 'Customer saved wishlist items' },
    { name: 'Contact / Support', description: 'Customer support messages' },
    { name: 'Referrals', description: 'Customer referral codes and statistics' }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'jwt',
        description: 'HTTP-Only JWT cookie issued upon authentication'
      }
    }
  },
  paths: {
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API health status',
        responses: {
          '200': {
            description: 'API is healthy and operational',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  message: 'ANIVOM API is running'
                }
              }
            }
          }
        }
      }
    },

    /* 1. AUTHENTICATION */
    '/api/v1/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new customer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'Password@123' },
                  referralCode: { type: 'string', example: 'REF123456' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Account registered successfully' },
          '400': { description: 'Validation error or duplicate email' }
        }
      }
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user and set HTTP-Only JWT cookie',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'Password@123' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Authenticated successfully' },
          '401': { description: 'Invalid credentials' }
        }
      }
    },
    '/api/v1/auth/google': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate or register via Google OAuth credential token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['credential'],
                properties: {
                  credential: { type: 'string', example: 'google_oauth_id_token' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Google authentication successful' },
          '400': { description: 'Invalid Google token' }
        }
      }
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout user by clearing HTTP-Only authentication cookie',
        responses: {
          '200': { description: 'Logged out successfully' }
        }
      }
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get currently authenticated user profile',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Profile returned successfully' },
          '401': { description: 'Not authorized' }
        }
      }
    },
    '/api/v1/auth/users/admin': {
      get: {
        tags: ['Authentication'],
        summary: 'List all registered customer profiles (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Customer profile list returned' },
          '403': { description: 'Admin access required' }
        }
      }
    },

    /* 2. PRODUCTS */
    '/api/v1/products': {
      get: {
        tags: ['Products'],
        summary: 'List active catalog products with search, category, size, color, and price filtering',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category ID' },
          { name: 'size', in: 'query', schema: { type: 'string' }, description: 'Size filter' },
          { name: 'colour', in: 'query', schema: { type: 'string' }, description: 'Colour filter' },
          { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: 'Minimum base price' },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: 'Maximum base price' },
          { name: 'sort', in: 'query', schema: { type: 'string' }, description: 'Sorting order' },
          { name: 'page', in: 'query', schema: { type: 'integer' }, description: 'Page number' },
          { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Items per page' }
        ],
        responses: {
          '200': { description: 'Product catalog returned' }
        }
      }
    },
    '/api/v1/products/:id': {
      get: {
        tags: ['Products'],
        summary: 'Fetch single product by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
        ],
        responses: {
          '200': { description: 'Product details returned' },
          '404': { description: 'Product not found' }
        }
      }
    },
    '/api/v1/products/admin': {
      post: {
        tags: ['Products'],
        summary: 'Create catalog product (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Product created' },
          '403': { description: 'Admin access required' }
        }
      },
      get: {
        tags: ['Products'],
        summary: 'List all products including inactive items (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'All products returned' },
          '403': { description: 'Admin access required' }
        }
      }
    },
    '/api/v1/products/admin/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Fetch full product details for admin (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
        ],
        responses: {
          '200': { description: 'Product details returned' },
          '403': { description: 'Admin access required' }
        }
      },
      patch: {
        tags: ['Products'],
        summary: 'Update product details (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
        ],
        responses: {
          '200': { description: 'Product updated' },
          '403': { description: 'Admin access required' }
        }
      }
    },
    '/api/v1/products/admin/{id}/status': {
      patch: {
        tags: ['Products'],
        summary: 'Toggle product active status (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
        ],
        responses: {
          '200': { description: 'Product status toggled' },
          '403': { description: 'Admin access required' }
        }
      }
    },
    '/api/v1/products/admin/{id}/variants/{variantId}/stock': {
      patch: {
        tags: ['Products'],
        summary: 'Update variant inventory stock counter (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' },
          { name: 'variantId', in: 'path', required: true, schema: { type: 'string' }, description: 'Variant ID' }
        ],
        responses: {
          '200': { description: 'Variant stock updated' },
          '403': { description: 'Admin access required' }
        }
      }
    },

    /* 3. CUSTOMIZATIONS */
    '/api/v1/customizations': {
      post: {
        tags: ['Customizations'],
        summary: 'Save or update T-shirt studio canvas customization layers',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Customization saved' }
        }
      },
      get: {
        tags: ['Customizations'],
        summary: 'List user saved customizations',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Customizations returned' }
        }
      }
    },
    '/api/v1/customizations/{id}': {
      get: {
        tags: ['Customizations'],
        summary: 'Fetch single customization details (ownership enforced)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Customization ID' }
        ],
        responses: {
          '200': { description: 'Customization returned' }
        }
      },
      patch: {
        tags: ['Customizations'],
        summary: 'Update existing customization layers',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Customization ID' }
        ],
        responses: {
          '200': { description: 'Customization updated' }
        }
      },
      delete: {
        tags: ['Customizations'],
        summary: 'Delete saved customization',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Customization ID' }
        ],
        responses: {
          '200': { description: 'Customization deleted' }
        }
      }
    },

    /* 4. CART */
    '/api/v1/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Fetch authenticated user active shopping cart items',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Cart items returned' }
        }
      },
      post: {
        tags: ['Cart'],
        summary: 'Add standard catalog product or customized item to shopping cart',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Item added to cart' }
        }
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear all items from customer shopping cart',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Cart cleared' }
        }
      }
    },
    '/api/v1/cart/{itemId}': {
      patch: {
        tags: ['Cart'],
        summary: 'Update item quantity in cart',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' }, description: 'Cart item ID' }
        ],
        responses: {
          '200': { description: 'Cart item quantity updated' }
        }
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove specific item from cart',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' }, description: 'Cart item ID' }
        ],
        responses: {
          '200': { description: 'Cart item removed' }
        }
      }
    },
    '/api/v1/cart/checkout-summary': {
      post: {
        tags: ['Cart'],
        summary: 'Server-side price recalculation and coupon validation for checkout summary',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Checkout summary calculated' }
        }
      }
    },

    /* 5. ADDRESSES */
    '/api/v1/addresses': {
      get: {
        tags: ['Addresses'],
        summary: 'Fetch saved delivery address book',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Addresses returned' }
        }
      },
      post: {
        tags: ['Addresses'],
        summary: 'Add new delivery address',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Address created' }
        }
      }
    },
    '/api/v1/addresses/{id}': {
      patch: {
        tags: ['Addresses'],
        summary: 'Update delivery address details',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Address ID' }
        ],
        responses: {
          '200': { description: 'Address updated' }
        }
      },
      delete: {
        tags: ['Addresses'],
        summary: 'Delete delivery address',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Address ID' }
        ],
        responses: {
          '200': { description: 'Address deleted' }
        }
      }
    },
    '/api/v1/addresses/{id}/default': {
      patch: {
        tags: ['Addresses'],
        summary: 'Set primary default shipping address',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Address ID' }
        ],
        responses: {
          '200': { description: 'Default address updated' }
        }
      }
    },

    /* 6. ORDERS & PAYMENTS */
    '/api/v1/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create order document and initialize Razorpay payment order',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Order created in PENDING payment state' }
        }
      },
      get: {
        tags: ['Orders'],
        summary: 'List customer order history',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Customer orders returned' }
        }
      }
    },
    '/api/v1/orders/verify-payment': {
      post: {
        tags: ['Orders'],
        summary: 'Verify Razorpay HMAC-SHA256 signature, mark order PAID, decrement stock, and clear cart',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
                properties: {
                  razorpay_order_id: { type: 'string', example: 'order_9A33XABC' },
                  razorpay_payment_id: { type: 'string', example: 'pay_293847293' },
                  razorpay_signature: { type: 'string', example: 'a1b2c3d4e5f6...' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Payment verified and order finalized' },
          '400': { description: 'Invalid payment signature' }
        }
      }
    },
    '/api/v1/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Fetch customer order details (ownership enforced)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Order ID' }
        ],
        responses: {
          '200': { description: 'Order details returned' }
        }
      }
    },
    '/api/v1/orders/{id}/cancel': {
      patch: {
        tags: ['Orders'],
        summary: 'Cancel unfulfilled order and restore variant stock',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Order ID' }
        ],
        responses: {
          '200': { description: 'Order cancelled' }
        }
      }
    },
    '/api/v1/orders/{id}/return': {
      patch: {
        tags: ['Orders'],
        summary: 'Request return for delivered order',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Order ID' }
        ],
        responses: {
          '200': { description: 'Return requested' }
        }
      }
    },
    '/api/v1/orders/admin/stats': {
      get: {
        tags: ['Orders'],
        summary: 'Fetch sales revenue metrics and order analytics (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Analytics stats returned' },
          '403': { description: 'Admin access required' }
        }
      }
    },
    '/api/v1/orders/admin': {
      get: {
        tags: ['Orders'],
        summary: 'List all customer orders for administration (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'All orders returned' },
          '403': { description: 'Admin access required' }
        }
      }
    },
    '/api/v1/orders/admin/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Fetch complete admin order record and design snapshot (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Order ID' }
        ],
        responses: {
          '200': { description: 'Admin order view returned' },
          '403': { description: 'Admin access required' }
        }
      }
    },
    '/api/v1/orders/admin/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Update order fulfillment status (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Order ID' }
        ],
        responses: {
          '200': { description: 'Order status updated' },
          '403': { description: 'Admin access required' }
        }
      }
    },
    '/api/v1/orders/admin/{id}/return': {
      patch: {
        tags: ['Orders'],
        summary: 'Approve or reject customer return request (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Order ID' }
        ],
        responses: {
          '200': { description: 'Return decision processed' },
          '403': { description: 'Admin access required' }
        }
      }
    },
    '/api/v1/orders/admin/{id}/refund': {
      patch: {
        tags: ['Orders'],
        summary: 'Issue Razorpay refund for approved return (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Order ID' }
        ],
        responses: {
          '200': { description: 'Refund issued' },
          '403': { description: 'Admin access required' }
        }
      }
    },

    /* 7. UPLOADS */
    '/api/v1/uploads/image': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload custom image graphic to Cloudinary (5MB max, rate-limited)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file (PNG, JPG, WEBP <= 5MB)'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Image uploaded to Cloudinary successfully' },
          '400': { description: 'Invalid image format or file size exceeded' },
          '429': { description: 'Rate limit exceeded' }
        }
      }
    },

    /* 8. DESIGNS */
    '/api/v1/designs': {
      get: {
        tags: ['Designs'],
        summary: 'Fetch active vector design library SVG templates for studio customizer',
        responses: {
          '200': { description: 'Active vector designs returned' }
        }
      }
    },
    '/api/v1/designs/admin': {
      get: {
        tags: ['Designs'],
        summary: 'List all vector design library templates (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'All design templates returned' },
          '403': { description: 'Admin access required' }
        }
      },
      post: {
        tags: ['Designs'],
        summary: 'Upload new SVG design template (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Design template created' },
          '403': { description: 'Admin access required' }
        }
      }
    },
    '/api/v1/designs/admin/{id}': {
      patch: {
        tags: ['Designs'],
        summary: 'Update design template details (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Design ID' }
        ],
        responses: {
          '200': { description: 'Design template updated' }
        }
      },
      delete: {
        tags: ['Designs'],
        summary: 'Delete design template from vector library (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Design ID' }
        ],
        responses: {
          '200': { description: 'Design template deleted' }
        }
      }
    },

    /* 9. CATEGORIES */
    '/api/v1/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Fetch active product categories',
        responses: {
          '200': { description: 'Categories returned' }
        }
      }
    },
    '/api/v1/categories/admin': {
      get: {
        tags: ['Categories'],
        summary: 'List all product categories (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'All categories returned' }
        }
      },
      post: {
        tags: ['Categories'],
        summary: 'Create product category (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Category created' }
        }
      }
    },
    '/api/v1/categories/admin/{id}': {
      patch: {
        tags: ['Categories'],
        summary: 'Update product category (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Category ID' }
        ],
        responses: {
          '200': { description: 'Category updated' }
        }
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete product category (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Category ID' }
        ],
        responses: {
          '200': { description: 'Category deleted' }
        }
      }
    },

    /* 10. SIZES */
    '/api/v1/sizes': {
      get: {
        tags: ['Sizes'],
        summary: 'Fetch active product sizes',
        responses: {
          '200': { description: 'Sizes returned' }
        }
      }
    },
    '/api/v1/sizes/admin': {
      get: {
        tags: ['Sizes'],
        summary: 'List all product sizing options (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'All sizes returned' }
        }
      },
      post: {
        tags: ['Sizes'],
        summary: 'Create product sizing option (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Size created' }
        }
      }
    },
    '/api/v1/sizes/admin/{id}': {
      patch: {
        tags: ['Sizes'],
        summary: 'Update product sizing option (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Size ID' }
        ],
        responses: {
          '200': { description: 'Size updated' }
        }
      },
      delete: {
        tags: ['Sizes'],
        summary: 'Delete product sizing option (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Size ID' }
        ],
        responses: {
          '200': { description: 'Size deleted' }
        }
      }
    },

    /* 11. COLOURS */
    '/api/v1/colours': {
      get: {
        tags: ['Colours'],
        summary: 'Fetch active product color options',
        responses: {
          '200': { description: 'Colours returned' }
        }
      }
    },
    '/api/v1/colours/admin': {
      get: {
        tags: ['Colours'],
        summary: 'List all product color options (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'All colours returned' }
        }
      },
      post: {
        tags: ['Colours'],
        summary: 'Create product color option (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Colour created' }
        }
      }
    },
    '/api/v1/colours/admin/{id}': {
      patch: {
        tags: ['Colours'],
        summary: 'Update product color option (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Colour ID' }
        ],
        responses: {
          '200': { description: 'Colour updated' }
        }
      },
      delete: {
        tags: ['Colours'],
        summary: 'Delete product color option (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Colour ID' }
        ],
        responses: {
          '200': { description: 'Colour deleted' }
        }
      }
    },

    /* 12. COUPONS */
    '/api/v1/coupons/validate': {
      get: {
        tags: ['Coupons'],
        summary: 'Validate promotional coupon code for customer order subtotal',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'code', in: 'query', required: true, schema: { type: 'string' }, description: 'Coupon code' },
          { name: 'subtotal', in: 'query', required: true, schema: { type: 'number' }, description: 'Cart subtotal' }
        ],
        responses: {
          '200': { description: 'Coupon validated' },
          '400': { description: 'Invalid or expired coupon' }
        }
      }
    },
    '/api/v1/coupons/admin': {
      get: {
        tags: ['Coupons'],
        summary: 'List all promotional discount coupons (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'All coupons returned' }
        }
      },
      post: {
        tags: ['Coupons'],
        summary: 'Create promotional discount coupon (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Coupon created' }
        }
      }
    },
    '/api/v1/coupons/admin/{id}': {
      patch: {
        tags: ['Coupons'],
        summary: 'Update promotional coupon parameters (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Coupon ID' }
        ],
        responses: {
          '200': { description: 'Coupon updated' }
        }
      },
      delete: {
        tags: ['Coupons'],
        summary: 'Delete promotional coupon code (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Coupon ID' }
        ],
        responses: {
          '200': { description: 'Coupon deleted' }
        }
      }
    },

    /* 13. BANNERS */
    '/api/v1/banners': {
      get: {
        tags: ['Banners'],
        summary: 'Fetch active homepage hero carousel banners',
        responses: {
          '200': { description: 'Banners returned' }
        }
      }
    },
    '/api/v1/banners/admin': {
      get: {
        tags: ['Banners'],
        summary: 'List all homepage hero banners (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'All banners returned' }
        }
      },
      post: {
        tags: ['Banners'],
        summary: 'Create hero carousel banner (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '201': { description: 'Banner created' }
        }
      }
    },
    '/api/v1/banners/admin/{id}': {
      patch: {
        tags: ['Banners'],
        summary: 'Update hero carousel banner (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Banner ID' }
        ],
        responses: {
          '200': { description: 'Banner updated' }
        }
      },
      delete: {
        tags: ['Banners'],
        summary: 'Delete hero carousel banner (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Banner ID' }
        ],
        responses: {
          '200': { description: 'Banner deleted' }
        }
      }
    },

    /* 14. WISHLIST */
    '/api/v1/wishlist': {
      get: {
        tags: ['Wishlist'],
        summary: 'Fetch authenticated user saved wishlist products',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Wishlist products returned' }
        }
      },
      post: {
        tags: ['Wishlist'],
        summary: 'Add product to customer wishlist',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Product added to wishlist' }
        }
      }
    },
    '/api/v1/wishlist/{productId}': {
      delete: {
        tags: ['Wishlist'],
        summary: 'Remove product from customer wishlist',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' }, description: 'Product ID' }
        ],
        responses: {
          '200': { description: 'Product removed from wishlist' }
        }
      }
    },

    /* 15. CONTACT / SUPPORT */
    '/api/v1/contact': {
      post: {
        tags: ['Contact / Support'],
        summary: 'Submit customer support inquiry message (rate-limited)',
        responses: {
          '201': { description: 'Support message submitted' },
          '429': { description: 'Too many messages sent' }
        }
      }
    },
    '/api/v1/contact/admin': {
      get: {
        tags: ['Contact / Support'],
        summary: 'List all customer support inquiry messages (Admin)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Support messages returned' }
        }
      }
    },
    '/api/v1/contact/admin/{id}/status': {
      patch: {
        tags: ['Contact / Support'],
        summary: 'Update support message inquiry status (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Contact message ID' }
        ],
        responses: {
          '200': { description: 'Message status updated' }
        }
      }
    },
    '/api/v1/contact/admin/{id}': {
      delete: {
        tags: ['Contact / Support'],
        summary: 'Delete customer support message (Admin)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Contact message ID' }
        ],
        responses: {
          '200': { description: 'Support message deleted' }
        }
      }
    },

    /* 16. REFERRALS */
    '/api/v1/referrals/me': {
      get: {
        tags: ['Referrals'],
        summary: 'Fetch customer earned referral statistics and code',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Referral stats returned' }
        }
      }
    },
    '/api/v1/referrals/validate/{code}': {
      get: {
        tags: ['Referrals'],
        summary: 'Validate customer referral code',
        parameters: [
          { name: 'code', in: 'path', required: true, schema: { type: 'string' }, description: 'Referral code' }
        ],
        responses: {
          '200': { description: 'Referral code validated' },
          '400': { description: 'Invalid referral code' }
        }
      }
    }
  }
};

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;
