const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");

const databasePath = path.join(__dirname, "register.db");

const app = express();

app.use(express.json());
app.use(cors());
let database = null;

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

const Authenticate = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
};

app.post("/register/", async (request, response) => {
  const { username, password, name, email, gender, location } = request.body;
  const getUserQuery = `
      SELECT * FROM user WHERE username = '${username}';
    `;
  const dbUser = await db.get(getUserQuery);
  if (dbUser === undefined) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const addUserQuery = `
      INSERT INTO user( username, password,name,email,gender,location)
      VALUES(
          '${username}',
          '${hashedPassword}',  
           '${name}',
              '${email}',
                 '${gender}',
                    '${location}',
      );
    `;
    const dbResponse = await db.run(addUserQuery);
    response.send("New User Created");
  } else {
    response.status(400);
    response.send("username already exist");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const databaseUser = await database.get(selectUserQuery);

  if (databaseUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      databaseUser.password
    );
    if (isPasswordMatched === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

module.exports = app;
