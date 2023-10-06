# Prospark - Backend

This is a `Node.js / Express` project bootstrapped with [`create-prospark-app`](https://github.com/benrobo/prospark).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The following log message should be displayed in console output:

```bash
2023-04-17 23:14:38 PM [info] : Server started at http://localhost:8080
```

Visit `http://localhost:8080/api/user/data` in your browser just to confirm routes are configured and working properly. If all is working properly, you should get the below response on browser.

```js
{
  "errorStatus": false,
  "code": "--user/fake-data",
  "message": "user data fetched successfully",
  "statusCode": 200,
  "data": [
    {
      "name": "john doe",
      "email": "john@mail.com"
    },
    {
      "name": "brain tracy",
      "email": "brian@mail.com"
    }
  ]
}
```
