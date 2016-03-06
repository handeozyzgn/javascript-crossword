'use strict';
/*
 * GLOBAL VARS
 */
var host = 'http://localhost:3000/';
var board = [];
var puzzles = [];

/*
 * Functions
 */

function buildCrosswordTable(puzzle) {
  var rows = puzzle.nRows;
  var cols = puzzle.nCols;
  var $crosswordTable = $('#crossword');
  var i = 0;
  var j = 0;
  var $newRow, id;

  $crosswordTable.empty();
  board = puzzle.diagram;
  /* Add 1 to rows and cols because we need an extra row and column for the
  numbering */
  for (i = 0; i < rows + 1; i++) {
    $newRow = $('<tr></tr>');
    for (j = 0; j < cols + 1; j++) {
      id = (i - 1) + '-' + (j - 1);

      if (i === 0 && j === 0) {
        $newRow.append('<th></th>');
      } else if (i === 0) { // On the first row we number the columns
        $newRow.append('<th>' + j + '</th>');
      } else if (i > 0 && j === 0) { // On the first column we number the rows
        $newRow.append('<th>' + i + '</th>');
      } else { // Then we just add the boxes
        $newRow.append('<td id="' + id + '" contentEditable="true"></td>');
      }
    }
    $newRow.appendTo($crosswordTable);
  }
}

function getPuzzleFileList() {
  var files = [];

  $.getJSON(host + 'puzzles/puzzle-list.json', function(data) {
    files = data.files;
    populatePuzzleSelection(files);
  });
}

function populatePuzzleSelection(files) {
  var url;

  $.each(files, function(i, file) {
    url = host + 'puzzles/' + file;
    $.getJSON(url, function(data) {
      puzzles.push(data);
      var $select = $('select').append('<option value="' + i + '">' + file.split('.')[0] + '</option>');
      if (i === 0) {
        buildCrosswordTable(puzzles[$select.val()]);
      }
    });
  });
}

function keyPressed() {
  // TODO: Handle the interactions. Helper functions will probably be needed
}

/*
 * MAIN
 */

$(document).ready(function() {
  getPuzzleFileList();
  $('select').change(function(event) {
    buildCrosswordTable(puzzles[event.target.value]);
  });
});
