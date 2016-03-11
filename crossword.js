'use strict';
/*
 * GLOBAL VARS
 */
var host = 'http://localhost:3000/';
var board = []; // Keeps track of the puzzle in memory.
var puzzles = []; // Holds all the puzzles that are loaded from the server
var selectedPuzzle; // Holds le JSON file of the current puzzle being solved.

/*
 * Functions
 */

/* Called every time a new puzzle is selected */
function buildCrosswordTable(puzzle) {
  var rows = puzzle.nRows;
  var cols = puzzle.nCols;
  var $crosswordTable = $('#crossword');
  var i = 0;
  var j = 0;
  var $newRow, $td, elem, id;

  $crosswordTable.empty();
  board = puzzle.diagram; // Set the in memroy board every time we build a new puzzle
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
        elem = '<td id="' + id + '" class=" row-' + (i - 1) + ' col-' + (j - 1) + '" contentEditable="true"></td>';
        $td = $(elem).appendTo($newRow);
        if (board[i - 1][j - 1] === '.') {
          $td.addClass('blacked-out');
          $td.attr('contentEditable', 'false');
        }
      }
    }
    $newRow.appendTo($crosswordTable);
  }
}

/*
 * Fills the across and down clues
 */
function populateClues() {
  var tableHeight = $('#crossword').height();
  var $horClueList = $('#horizontal-clues ul');
  var $vertClueList = $('#vertical-clues ul');
  var clue, i, j;

  $('#horizontal').css('height', tableHeight);
  $('#vertical').css('height', tableHeight);

  for (i = 0; i < selectedPuzzle.nRows; i++) {
    for (j = 0; j < selectedPuzzle.nCols; j++) {
      clue = selectedPuzzle.numbers[i][j];

      if (selectedPuzzle.acrossClues[clue]) {
        $horClueList.append('<li>' + clue + ': ' + selectedPuzzle.acrossClues[clue] + '</li>');
      }
      if (selectedPuzzle.downClues[clue]) {
        $vertClueList.append('<li>' + clue + ': ' + selectedPuzzle.downClues[clue] + '</li>');
      }
    }
  }
}

/*
 * Fills the list of puzzles the user can select
 */
function populatePuzzleSelection(files) {
  var url, $select;

  $.each(files, function(i, file) {
    url = host + 'puzzles/' + file;
    $.getJSON(url, function(data) {
      puzzles.push(data);
      $select = $('select').append('<option value="' + i + '">' + file.split('.')[0] + '</option>');
      if (i === 0) {
        selectedPuzzle = puzzles[$select.val()];
        buildCrosswordTable(selectedPuzzle);
        populateClues();
      }
    });
  });
}

function validate() {
  // TODO
}

function move(direction, currentPos) {
  // TODO
}

function keyPressed(event) {
  var $elem = $(this);
  var position = $elem.attr('id').split("-"); // Position is an array [i index, j index]

  event.preventDefault();
  switch (event.which) {
    case '38':
      move('up', position);
      break;
    case '40':
      move('down', position);
      break;
    case '37':
      move('left', position);
      break;
    case '39':
      move('right', position);
      break;
    default:
      $elem.text(String.fromCharCode(event.which));
  }
}

function initCrossword() {
  var files = [];

  $('select').change(function(event) {
    selectedPuzzle = puzzles[event.target.value];
    buildCrosswordTable(selectedPuzzle);
  });
  // Fetch all the json files from our server
  $.getJSON(host + 'puzzles/puzzle-list.json', function(data) {
    files = data.files;
    populatePuzzleSelection(files);
  });
  $(document).on('focusin', 'td', function() {
    $(this).addClass('selected-box');
  });
  $(document).on('focusout', 'td', function() {
    $(this).removeClass('selected-box');
  });
  /* We use keydown instead of keypress here because we also need to capture the
  arrow keys which aren't captured with all browsers by using keypress */
  $(document).on('keydown', 'td', keyPressed);
}

/*
 * MAIN
 */

$(document).ready(function() {
  initCrossword();
});
