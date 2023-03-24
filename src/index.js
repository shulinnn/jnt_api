const express = require("express");
const { PrismaClient, Prisma } = require("@prisma/client");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { Decimal } = require("@prisma/client/runtime");

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("assets"));
//tt

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.get("/players", async (req, res) => {
  try {
    const result = await prisma.player.findMany({
      select: {
        id: true,
        username: true,
        user_flag: true,
        user_photo: true,
        betting_points: true,
      },
    });

    res.json(result);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/opening-win", async (req, res) => {
  const { betterId, winAmount } = req.body;

  try {
    const result = await prisma.player.update({
      where: {
        id: parseInt(betterId),
      },
      data: {
        betting_points: {
          increment: parseInt(winAmount),
        },
      },
    });
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/bets/:id", async (req, res) => {
  try {
    const result = await prisma.bet.findMany({
      where: {
        playerId: parseInt(req.params.id),
      },
      include: {
        bettedOn: {
          include: {
            teams: true,
          },
        },
      },
    });

    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/team/:id", async (req, res) => {
  try {
    const result = await prisma.team.findFirst({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        players: true,
        Match: {
          include: {
            teams: {
              include: {
                players: true,
              },
            },
          },
        },
      },
    });
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/profile/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await prisma.player.findFirst({
      where: {
        id: parseInt(id),
      },
      include: {
        Team: {
          include: {
            Match: {
              include: {
                teams: {
                  include: {
                    players: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/match/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await prisma.match.findFirst({
      where: {
        id: parseInt(id),
      },
      include: {
        teams: {
          include: {
            players: true,
          },
        },
      },
    });
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await prisma.player.findFirst({
      select: {
        id: true,
        username: true,
        user_photo: true,
        user_flag: true,
        case_ticket: true,
        betting_points: true,
        teamId: true,
      },
      where: {
        username: username,
        password: password,
      },
    });

    if (result == null) {
      res.status(500).send("Wrong password or username");
    } else {
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/matches", async (req, res) => {
  try {
    const result = await prisma.match.findMany({
      include: {
        teams: {
          include: {
            players: true,
          },
        },
      },
    });
    if (result == null) {
      res.status(500).send("No data to show or data not found");
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/messages", async (req, res) => {
  try {
    const result = await prisma.message.findMany({
      include: {
        sender: {
          include: {
            Team: true,
            badge: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    if (result == null) res.status(500).send("No data to show...");
    else res.status(200).send(result);
  } catch (error) {
    console.log(error);
  }
});

app.post("/message", async (req, res) => {
  try {
    const { message, sender } = req.body;

    const result = await prisma.message.create({
      data: {
        message: message,
        sender: {
          connect: { id: parseInt(sender) },
        },
      },
    });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(err);
  }
});

app.post("/bet", async (req, res) => {
  try {
    const { betAmount, betterId, matchId, betTeamId } = req.body;
    const result = await prisma.bet.create({
      data: {
        betAmount: parseInt(betAmount),
        better: {
          connect: { id: parseInt(betterId) },
        },
        bettedOn: {
          connect: {
            id: parseInt(matchId),
          },
        },
        bettedTeam: {
          connect: {
            id: parseInt(betTeamId),
          },
        },
      },
    });
    const decrementBettingPoints = await prisma.player.update({
      where: {
        id: parseInt(betterId),
      },
      data: {
        betting_points: {
          decrement: parseInt(betAmount),
        },
      },
    });
    res.send(result + decrementBettingPoints);
  } catch (error) {
    console.log(error);
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

app.post("/control-panel/war-token/increment", async (req, res) => {
  const { userId, tokenAmount } = req.body;

  try {
    const result = await prisma.player.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        betting_points: {
          increment: parseInt(tokenAmount),
        },
      },
    });
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

app.post("/controls-panel/match/", async (req, res) => {
  const { matchId, scoreTeamA, scoreTeamB, kurzTeamA, kurzTeamB } = req.body;

  console.log(req.body);

  try {
    console.log(kurzTeamA);
    console.log(kurzTeamB);

    const result = await prisma.match.update({
      where: {
        id: parseInt(matchId),
      },
      data: {
        scores: [parseInt(scoreTeamA), parseInt(scoreTeamB)],
        exchange_rates: [
          new Prisma.Decimal(kurzTeamA),
          new Prisma.Decimal(kurzTeamB),
        ],
      },
    });
    res.json(result);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
});

app.post("/control-panel/war-token/decrement", async (req, res) => {
  const { userId, tokenAmount } = req.body;

  try {
    const result = await prisma.player.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        betting_points: {
          decrement: parseInt(tokenAmount),
        },
      },
    });
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

const server = app.listen(4000, () =>
  console.log(`
🚀 Server ready at: http://localhost:4000`)
);
