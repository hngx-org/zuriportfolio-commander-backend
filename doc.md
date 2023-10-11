### Revenue

**GET** `/api/revenue?timeframe=today`

Retrieve total revenue gotten.

**Body**: None

```json
"timeFrame": "today"
```

Calculate Percentage Change (PC):

```plaintext
PC = ((TR - PDR) / PDR) × 100
```

- PC: Percentage Change
- TR: Todays Revenue
- PDR: Previous Day Revenue

**Response:**

```json
{
  "revenue": 2000,
  "percentageChange": 10,
  "isIncreasing": true
}
```

### Sales

**GET** `/api/sales/reports?timeframe=12m,3m,1yr,7d,24hr`

Retrieve total revenue gotten.

**Body**: None

**Response:**

```json
{
  "timeframe": "12m",
  "reports": [
    {
      "month": "Jan",
      "sales": 23,
      "total_sales": 32000
    },
    {
      "month": "Feb",
      "sales": 23,
      "total_sales": 32000
    }
  ]
}
```

For 3 Months (past):

```json
{
  "timeframe": "3m",
  "reports": [
    {
      "month": "Oct",
      "sales": 15,
      "total_sales": 32000
    },
    {
      "month": "Nov",
      "sales": 19,
      "total_sales": 32000
    },
    {
      "month": "Dec",
      "sales": 28,
      "total_sales": 32000
    }
  ]
}
```

For 7 Days (past):

```json
{
  "timeframe": "7d",
  "reports": [
    {
      "day": "Mon",
      "sales": 5,
      "total_sales": 32000
    },
    {
      "day": "Tue",
      "sales": 8,
      "total_sales": 32000
    }
    // ... continue for each day
  ]
}
```

24hr (current):

```json
{
  "timeframe": "24hr",
  "reports": [
    {
      "hour": "00:00",
      "sales": 3,
      "total_sales": 32000
    },
    {
      "hour": "01:00",
      "sales": 7,
      "total_sales": 32000
    }
    // ... continue for each hour based on the data
  ]
}
```

Since each sales report has an `order_id`, use the `id` in calculating the `total_sales` for that period of time.

**POST** `/api/sales/report`

Create a sales report for each completed order.

**Body**:

```json
{
  "sales": 10
}
```

### Shop

**POST** `/api/shop/store-traffic`

Implement the functionality to store traffic when a shop is visited.

**Body**:

```json
{
  "shop_id": ""
}
```

Use the `store_traffic` for recording this details.

**POST** `/api/shop`

Implement the functionality to create a shop.

**Body**:

```json
{
  "name": ""
}
```

**GET** `/api/shops`

Fetch all shops created.

**Body**: None

**Response**:

```json
{
  "shops": [{ "name": "" }]
}
```

**PATCH** `/api/shop/:shop_id`

Update shop details/info.

**Body**:

```json
{
  "name": ""
}
```

**DELETE** `/api/shop/:shop_id`

Delete a shop.

**Body**: None

### Order

**GET** `/api/orders`

Fetch all customer's orders based on the current logged-in `userId`.

**Body**: None

**Response**:

```json
{
  "orders": [
    {
      "id": "",
      "customer_name": "",
      "status": "",
      "date": ""
    }
  ]
}
```

Look for a way to join the `customer_id` present in the `order_item` table to fetch `customer_name`.

**GET** `/api/order/:order_id`

Fetch order details.

**Body**: None

**Response**:

```json
{
  "orders": [
    {
      "order_id": "order_123",
      "status": "shipped",
      "createdAt": "2023-01-15T10:30:00.000Z",
      "name": "Product Name",
      "order_price": 25,
      "order_discount": 22,
      "order_VAT": 3,
      "currency": "USD",
      "promo": {
        "id": "",
        "type": "", // Fixed or Percentage
        "amount": ""
      } // this would be null if promotion exists on this product or not
      "merchant": {
        "name": ""
      }
    }
  ]
}
```

**GET** `/api/order/search/:name`

Search order by product name.

**Body**: None

**Response**:

```json
{
  "orders": [
    {
      "order_id": "order_123",
      "status": "shipped",
      "createdAt": "2023-01-15T10:30:00.000Z",
      "name": "Product Name",
      "order_price": 25,
      "order_discount": 22,
      "order_VAT": 3,
      "currency": "USD",
      "promo": {
        "id": "",
        "type": "", // Fixed or Percentage
        "amount": ""
      } // this would be null if a promotion exists on this product or not
      "merchant": {
        "name": ""
      }
    }
  ]
}
```

**PATCH** `/api/order/status`

Update order status.

**Body**:

```json
{
  "order_id": ""
}
```

**GET** `/api/order?timeframe=today`

Fetch all orders based on a timeframe.

**Body**: None

**Response**:

```json
{
  "orders_count": 20,
  "timeframe": "today"
}
```

**GET** `/api/order/average?timeframe=today`

Fetch the average order for a timeframe.

**Body**: None

**Response**:

```json
{
  "timeframe": "today",
  "average_order_value": 45.75,

  "percentage_change": 10.25,
  "isIncreasing": true
}
```

For percentage calculation:

```plaintext
PC = ((TR - PDR) / PDR) × 100
```

- PC: Percentage Change
- TR: Todays Revenue
- PDR: Previous Day Revenue

Processing Steps:

1. Determine the start and end timestamps for the requested timeframe, specifically for "today."
2. Retrieve all orders created within the specified timeframe.
3. Calculate the average order value for the retrieved orders.
4. Calculate the percentage change in the average order value compared to the previous day.

### Product

**DELETE** `/api/product/:product_id`

Mark a product as deleted.

**Body**: None

**PATCH** `/api/product/:product_id`

Update a specific product.

**Body**:

```json
// Form-data
json='{
  "name": "Sample Product",
  "description": "This is a sample product description.",
  "quantity": 10,
  "price": 49.99,
  "discountPrice": null,
  "tax": null,
  "currency": "USD",
  "shopId": "i2gP2ZzgY5NhunL8zTPPWk",
  "userId": "sdcsvdsvsdvsvs",
  "category": "electronic",
  "affected_fields": ["name", "image"]
}'
image="@/Users/benrobo/Pictures/leaf.png"
```

**Response**:

```json
{
  "message": "Product updated successfully.",
  "affected_fields": ["name", "image"]
}
```

Ensure appropriate error handling in case of failed updates or missing data. The "affected_fields" array should only include the names of the fields that have changed. If the image was updated, call the function for uploading the image to Cloudinary similar to that of creating a product.

**POST** `/api/product/categories`

Create a product category.

**Body**:

```json
{
  "parent_id": "",
  "name": ""
}
```

Check if the "parent_id" field is null. If it is, the user is trying to create a parent category. If not, create a subcategory.

**GET** `/api/product/categories`

Fetch all categories created.

**Body**: None

**Response**:

```json
{
  "categories": [
    {
      "name": "Engineering",
      "sub_catgory": null
    },
    {
      "name": "Software engineering",
      "sub_catgory": [{ "name": "Frontend" }, { "name": "Backend" }]
    }
  ]
}
```

**GET** `/api/products`

Fetch all products.

**Body**: None

### Promotion (Discount)

**POST** `/api/discount`

Create a discount.

**Body**:

```json
{
  "type": "", // fixed or percentage
  "amount": "",
  "limited_quantity": 2,
  "maximum_discount_price": "",
  "products": ["product_id"]
}
```

Validate the "type" field, and check for product existence and existing promotions. Create the discount and associate it with specified products.

**GET** `/api/discount`

Get all discounts created.

**Body**: None

**Response**:

```json
{
  "id": "",
  "status": "expired | active",
  "discount_details": "15% | #5000",
  "quantity": 2,
  "usage": 20
}
```

Delete a specific discount.

**Body**: None

**POST** `/api/discount/track`

Track promotion when an order is marked as completed.

**Body**:

```json
{
  "promo_id": "",
  "product_id": ""
}
```

Validate input, check for entry existence, and add a record to the `track_promotion` table.

### Activity

**POST** `/api/activities`

Record activity.

**Body**:

```json
{
  "action": "",
  "title": "",
  "description": ""
}
```

This endpoint requires user authentication to track activities across all sections of the app.

**GET** `/api/activities`

Retrieve all activities for the current authenticated user.

**Body**: None

**Response**:

```json
{
  "activities": [
    {
      "action": "",
      "title": "",
      "description": "",
      "user": {
        "name": ""
      }
    }
  ]
}
```

Feel free to use this formatted documentation as a reference for your API documentation.
