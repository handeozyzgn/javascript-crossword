'use strict';
/*
 * GLOBAL VARS
 */
var host = 'http://localhost:3000/';
var board = []; // Keeps track of the puzzle in memory.
var puzzles = []; // Holds all the puzzles that are loaded from the server
var selectedPuzzle; // Holds le JSON file of the current puzzle being solved.
var clueOrientation = 'h'; // 'h' if we are solving an accross clue and 'v' if it's a down clue
var currentSelection = '.row-0';

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
  clueOrientation = 'h';
  // Set the in memroy board every time we build a new puzzle
  board = puzzle.diagram.map(function(row) {
    return row.split('');
  });
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
  $(currentSelection).addClass('selected');
  // Put cursor on first puzzle cell for the user;
  $('#0-0').focus();
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

/*
 * Handles puzzle navigation using arrow keys and refocuses on new table cell
 */
function move(direction, currentPos) {
  var newId;

  if (direction === 'up' && currentPos[0] > 0) {
    currentPos[0]--;
  } else if (direction === 'down' && currentPos[0] < selectedPuzzle.nRows - 1) {
    currentPos[0]++;
  } else if (direction === 'left' && currentPos[1] > 0) {
    currentPos[1]--;
  } else if (direction === 'right' && currentPos[1] < selectedPuzzle.nCols - 1) {
    currentPos[1]++;
  }
  newId = '#' + currentPos.join('-');
  $(newId).focus();
}

function toggleOrientation() {
  switch (clueOrientation) {
    case 'h':
      clueOrientation = 'v';
      break;
    case 'v':
      clueOrientation = 'h';
      break;
    default:
  }
}

function keyPressed(event) {
  var $elem = $(this);
  var position = $elem.attr('id').split('-').map(Number); // Position is an array [i index, j index]
  var key = event.which.toString();

  $(currentSelection).removeClass('selected');
  event.preventDefault();
  switch (key) {
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
    case '32': // space bar
      toggleOrientation();
      break;
    default:
      $elem.text(String.fromCharCode(event.which));
      board[position[0]][position[1]] = String.fromCharCode(event.which);
  }

  switch (clueOrientation) {
    case 'h':
      currentSelection = '.row-' + position[0];
      $(currentSelection).addClass('selected');
      break;
    case 'v':
      currentSelection = '.col-' + position[1];
      $(currentSelection).addClass('selected');
      break;
    default:

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
