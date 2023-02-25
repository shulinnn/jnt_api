const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());
//tt

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.get("api/players", async (req, res) => {
  try {
    const result = await prisma.player.findMany({
      select: {
        username: true,
        user_flag: true,
        user_photo: true,
      },
    });

    res.json(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/register", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded !",
      });
    } else {
      const avatar = req.files.avatar;
      avatar.mv("./assets/" + avatar.name);

      const { username, password, country } = req.body;
      const result = await prisma.player.create({
        data: {
          username: username,
          password: password,
          user_photo: avatar.name,
          user_flag: country,
          case_ticket: 0,
        },
      });
      /// Send json response to frontend
      res.json(result);
    }
  } catch (err) {
    console.log(err);
    /// Send status with number 500 to frontend
    res.status(500).send(err);
  }
});

const server = app.listen(4000, () =>
  console.log(`
🚀 Server ready at: http://localhost:4000`)
);
