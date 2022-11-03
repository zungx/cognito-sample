# cognito-sample

## Setup
- Create User pools
- ...

## API

### Signup
```
curl --location --request POST 'http://localhost:3000/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Name",
    "email": "email@test.com",
    "password": "password"
}'
```

### Verify Otp
```
curl --location --request POST 'http://localhost:3000/verify_otp' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "email@test.com",
    "otp": "otp_code"
}'
```
