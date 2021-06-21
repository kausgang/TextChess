var express = require('express');
const app = require('../app');

const { exec } = require('child_process');



var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  
  var chess = req.app.locals.chess;
  var engine = req.app.locals.engine;

  //read the cookie set by index.js
  // var fen = req.cookies['fen']
  var fen = decodeURIComponent(req.cookies['fen'])
  console.log('coocke read - ',fen)
  var engine_level = req.query.engine_level;
  var new_game = req.cookies['new_game']

  // make sure that fen is read from cookie before maaking move
  var read_cookie = Promise.resolve([fen,new_game]);
  // var read_cookie = Promise.resolve(fen);

  // if the cookie was successfully read then - 
  // read_cookie.then(function(fen) {
    read_cookie.then(function(arr) {

      // if new game cookie is set then reset chess
      if(arr[1]=='True')
        req.app.locals.chess.reset();

  
      // engine.postMessage("setoption name skill level value 19")
      engine.postMessage("position fen "+ fen);
      // engine.postMessage("go depth 15");

      engine.postMessage("go depth "+(engine_level*3));



      // console.log(engine_level*3)


      engine.onmessage = function(line){

        // console.log(line)


        if (line.indexOf("bestmove") > -1) {
          match = line.match(/bestmove\s+(\S+)/);
          if (match) {
              // console.log("Best move: " + match[1]);
              

              // find the engine move in UCI
              var engine_response_UCI = match[1];

              //load the fen from cookie
              // chess.load(fen)
              // chess.load(arr[0]) //fen was sent at 0th position of array using resolve
              chess.load(fen) 

              // move the piece
              var engine_move = chess.move(engine_response_UCI, { sloppy: true });

              // find the SAN move
              var SAN_move = engine_move.san;

              // find FEN
              var FEN = chess.fen();

               // check for checkmate
              checkmate = chess.in_checkmate()
              // console.log(checkmate)
              if(checkmate)
                var parameter = {'engine_move':SAN_move,'FEN':FEN,'checkmate':true} //send
              else
                var parameter = {'engine_move':SAN_move,'FEN':FEN,'checkmate':false} //send  

              // Create response JSON
              // var parameter = {'engine_move':SAN_move,'FEN':FEN}


              // update cookie
              res.cookie('fen',FEN,{overwrite: true})
              res.cookie('new_game','False',{overwrite: true})


             


              // send response 
              res.send(parameter);
          }

        

  }}
  
    


  });




});

module.exports = router;
