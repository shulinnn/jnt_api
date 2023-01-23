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

app.post(`/register`, async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded !",
      });
    } else {
      console.log(req.files);

      const avatar = req.files.file;

      avatar.mv("./assets/" + avatar.name);

      const { name, password, flag } = req.body;
      const result = await prisma.player.create({
        data: {
          username: name,
          password: password,
          user_photo: avatar.name,
          user_flag: flag,
          is_player: false,
        },
      });
      res.json(result);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

const server = app.listen(4000, () =>
  console.log(`
🚀 Server ready at: http://localhost:4000`)
);
