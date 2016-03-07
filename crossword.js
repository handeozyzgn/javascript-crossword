'use strict';
/*
 * GLOBAL VARS
 */
var host = 'http://localhost:3000/';
var board = [];
var puzzles = [];
var selectedPuzzle;

/*
 * Functions
 */
function initCrossword() {
  getPuzzleFileList();
}

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
      } else { // Then we just add the crossword puzzle boxes
        var $td = $('<td id="' + id + '" class="' + 'row-' + (i - 1) + ' col-' + (j - 1) + '" contentEditable="true"></td>').appendTo($newRow);
        if (board[i-1][j-1] === ".") {
          $td.addClass('blacked-out');
          $td.attr('contentEditable', 'false')
        }
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
  initCrossword();

/*
* Setting up event handlers
*/

  $('select').change(function(event) {
    selectedPuzzle = puzzles[event.target.value];
    buildCrosswordTable(selectedPuzzle);
  });
});
