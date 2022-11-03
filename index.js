const express = require('express')
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const poolData = {
  UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
  ClientId: process.env.AWS_COGNITO_CLIENT_ID
};

app.get('/test', (req, res) => {
  res.status(200).json({ "message": "OK!" });
});

app.get('/protected', (req, res) => {
  // TODO: add middleware auth
  res.status(200).json({ "message": "Hello" });
});

app.post('/signup', (req, res) => {
  const body = req.body;

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const attributeList = [];
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "name", Value: body['name'] }));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: body['email'] }));

  userPool.signUp(body['email'], body['password'], attributeList, null, (err, result) => {
    if (err) {
      console.log(err);
      res.status(200).json({ "message": "Failed: " + err });
      return;
    }
    const cognitoUser = result.user;
    console.log('user: ' + cognitoUser.getUsername());
    res.status(200).json({ "message": "created " + cognitoUser.getUsername() });
  });
});

app.post('/signin', (req, res) => {
  const body = req.body;
  const authenticationData = {
    Email: body['email'],
    Password: body['password'],
  };
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {
    Username: body['email'],
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: (result) => {
      res.status(200).json({
        "message": "User signed in successfully",
        "data": {
          "idToken": result.getIdToken().getJwtToken(),
          "accessToken": result.getAccessToken().getJwtToken(),
          "refreshToken": result.getRefreshToken().getToken()
        }
      });
    },
    onFailure: (err) => {
      res.status(200).json({ "message": "Failed: " + err });
    },
  });
});

app.post('/verify_otp', (req, res) => {
  const body = req.body;
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {
    Pool: userPool,
    Username: body['email']
  }
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.confirmRegistration(body['otp'], true, (err, result) => {
    if (err) {
      res.status(200).json({ "message": "Unable to verify OTP" });
    }
    else {
      res.status(200).json({ "message": "User successfully verified" });
    }
  });
});

app.listen(3000, 'localhost', () => {
  console.log('Server listening on http://localhost:3000')
});