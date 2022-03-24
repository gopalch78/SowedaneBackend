const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");

const databasePath = path.join(__dirname, "register.db");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(process.env.PORT || 5000, () =>
      console.log("Server Running at http://localhost:5000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const validatePassword = (password) => {
  return password.length > 4;
};

app.post("/register", async (request, response) => {
  const {
    username,
    name,
    email,
    password,
    gender,
    location,
    mobileNumber,
  } = request.body;
  // generate salt to hash password
  const salt = await bcrypt.genSalt(10);

  // now we set user password to hashed password
  const hashedPassword = await bcrypt.hash(password, salt);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  // const dbUser = await db.get(selectUserQuery);
  if (selectUserQuery.length > 0) {
    const createUserQuery = `
      INSERT INTO 
        user (username, name, email,password, gender, location,mobileNumber) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${email}',
          '${hashedPassword}', 
          '${gender}',
          '${location}',
          '${mobileNumber}'
        )`;
    if (validatePassword(password)) {
      // await db.run(createUserQuery);
      console.log(createUserQuery);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  // const databaseUser = await db.get(selectUserQuery);

  if (selectUserQuery === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const salt = await bcrypt.genSalt(10);

    // now we set user password to hashed password
    const hashedPassword = await bcrypt.hash(password, salt);
    const isPasswordMatched = await bcrypt.compare(password, hashedPassword);
    if (isPasswordMatched === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

module.exports = app;
