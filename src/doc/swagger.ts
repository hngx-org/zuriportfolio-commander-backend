const swaggerDoc = `
openapi: 3.0.0
info:
  title: Zuriportfolio Shop API
  description: Zuriportfolio shop internal / external api.
  version: 0.1.9
servers:
  - url: http://localhost:8080/api
    description: Zuriportfolio shop internal / external api.
  - url: https://zuriportfolio-shop-internal-api.onrender.com/api
    description: Production server
paths:
  /products:
    get:
      summary: Retrieve all products
      description: Returns the list of created products by a user
      security:
        - BearerAuth: []
      responses:
        '200':    # status code
          description: A JSON array of user names
          content:
            application/json:
              schema: 
                type: array
                items: 
                  type: string


components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer                  
`;

export default swaggerDoc;
