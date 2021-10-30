var express = require("express");
// const { engine } = require('../app');
const app = require("../app");

var router = express.Router();

router.get("/", function (req, res, next) {
  var move = req.query.move;

  var chess = req.app.locals.chess;

  //read the cookie set by index.js
  var fen = req.cookies["fen"];
  var new_game = req.cookies["new_game"];

  // make sure that fen is read from cookie before maaking move
  var read_cookie = Promise.resolve([fen, new_game]);
  // var read_cookie = Promise.resolve(fen);

  // if the cookie was successfully read then -
  read_cookie.then(function (arr) {
    // read_cookie.then(function(fen) {

    // if new game cookie is set then reset chess
    if (arr[1] == "True") req.app.locals.chess.reset();

    chess.load(arr[0]); //fen was sent at 0th position of array using resolve
    // chess.load(fen)

    var validate = chess.move(move, { sloppy: true });

    if (validate == null) res.send("Illegal Move");
    else {
      fen = chess.fen(); //send the fen to main.js after valid move so it can update board
      // var parameters = {'validity':'Valid Move','FEN':fen} //send

      // check for checkmate
      checkmate = chess.in_checkmate();
      if (checkmate)
        var parameters = { validity: "Valid Move", FEN: fen, checkmate: true };
      //send
      else
        var parameters = { validity: "Valid Move", FEN: fen, checkmate: false }; //send

      // update cookie
      // console.log('setting cookie - ', fen)
      res.cookie("fen", fen, { overwrite: true });
      res.cookie("new_game", "False", { overwrite: true });

      // res.send('Valid Move')
      res.send(parameters);
    }
  });
});

module.exports = router;
