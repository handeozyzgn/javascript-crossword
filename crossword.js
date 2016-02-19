'use strict';
/*
 * GLOBAL VARS
 */
var host = 'http://localhost:3000/';

/*
 * Functions
 */

function populatePuzzleSelection() {
  var puzzles = [];
  // TODO: we need to fetch all the .json files and put them in the puzzles array.
  $.getJSON(host + 'puzzles/IFT3225.json', function(data) {
    puzzles.push(data);
    $('select').append('<option value="0">' + data.author + '</option>');
    buildCrosswordTable(puzzles[0]);
  });

  return puzzles;
}

function buildCrosswordTable(puzzle) {
  var diagram = puzzle.diagram;
  var rows = puzzle.nRows;
  var cols = puzzle.nCols;
  var $crosswordTable = $('#crossword');
  var i = 0;
  var j = 0;
  var $newRow;

  /* Add 1 to rows and cols because we need an extra row and column for the
  numbering */
  for (i = 0; i < rows + 1; i++) {
    $newRow = $('<tr></tr>');
    if (i > 0) {
      $newRow.append('<th>' + i.toString() + '</th>');
    }
    for (j = 0; j < cols + 1; j++) {
      if (i === 0 && j > 0) {
        $newRow.append('<th>' + j.toString() + '</th>');
      } else {
        $newRow.append('<td></td>');
      }
    }
    $newRow.appendTo($crosswordTable);
  }
}

function keyPressed() {
  // TODO: Handle the interactions. Helper functions will probably be needed
}

/*
 * MAIN
 */

$(document).ready(function() {
  populatePuzzleSelection();
});
