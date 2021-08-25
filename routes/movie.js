const express = require("express");
const router = express.Router();

// Middleware
const { authenticateToken } = require("../middleware/authMiddleware");
// Models
const { UserMovie } = require("../models/userMovie");
// Constant Message Responses
const RESPONSE_CODE = require("../constants/responseCode");

router.post("/add", authenticateToken, async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const movie_id = req.body.movie_id;
    const movie_name = req.body.movie_name;
    const genres = req.body.genres;
    const poster_path = req.body.poster_path;

    const userMovie = await UserMovie.findOne({
      where: {
        user_id: user_id,
        movie_id: movie_id,
      },
    });

    if (userMovie) {
      return res
        .status(RESPONSE_CODE.BAD_REQUEST)
        .send({ message: "Movie already exists", success: false });
    }

    await UserMovie.create({
      user_id: user_id,
      movie_id: movie_id,
      movie_name: movie_name,
      movie_genre_id: genres,
      poster_path: poster_path,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return res
      .status(RESPONSE_CODE.OK)
      .send({ message: "Movie Added", success: true });
  } catch (error) {
    console.error("Add Movie Error:", error);
  }
});

// User's added movies
router.get("/liked", authenticateToken, async (req, res, next) => {
  try {
    const userMovies = await UserMovie.findAll({
      where: { user_id: req.user.user_id },
    });
    let movies = [];
    if (userMovies.length > 0) {
      for (i = 0; i < userMovies.length; i++) {
        movies.push({
          id: userMovies[i].movie_id,
          title: userMovies[i].movie_name,
          poster_path: userMovies[i].poster_path,
        });
      }
    }
    return res.status(RESPONSE_CODE.OK).send({ movies: movies, success: true });
  } catch (error) {
    console.error("Get User Movies Error:", error);
  }
});

router.post("/remove", authenticateToken, async (req, res, next) => {
  const movie_id = req.body.movie_id;
  try {
    const userMovie = await UserMovie.findOne({
      where: { user_id: req.user.user_id, movie_id: movie_id },
    });
    await userMovie.destroy();

    //Sending Updated List from Response
    // const userMovies = await UserMovie.findAll({
    //   where: { user_id: req.user.user_id },
    // });
    // let movies = [];
    // if (userMovies.length > 0) {
    //   for (i = 0; i < userMovies.length; i++) {
    //     movies.push({
    //       id: userMovies[i].movie_id,
    //       title: userMovies[i].movie_name,
    //       poster_path: userMovies[i].poster_path,
    //     });
    //   }
    // }
    return res
      .status(RESPONSE_CODE.OK)
      .send({ message: "Movie deleted", success: true });
    // .send({ message: "Movie deleted", movies: movies, success: true });
  } catch (error) {
    console.error("User Movie Delete:", error);
  }
});

module.exports = router;
