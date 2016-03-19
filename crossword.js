'use strict';
/*
 * GLOBAL VARS
 */
var state = {
  host: 'http://localhost:3000/',
  board: [], // Keeps track of the puzzle in memory.
  puzzles: [], // Holds all the puzzles that are loaded from the server
  selectedPuzzle: null, // Holds le JSON file of the current puzzle being solved.
  orientation: 'h', // 'h' if we are solving an accross clue and 'v' if it's a down clue
  selectedCell: null, // The row or column currently selected
  selectedClue: null,
  solution: null
};

function getPosition($elem) {
  return {
    row: $elem.attr('id').split('-')[0],
    col: $elem.attr('id').split('-')[1]
  };
}

/*
 * Helper Functions
 */
/*
 * Looks up the clue number and returns an object containing the clue number and it's i-j index.
 * The reason if for reusability of the function (see: semiSelectWord())
 */
function lookUpClueNumber($elem) {
  var elemPos = getPosition($elem);
  var i = elemPos.row;
  var j = elemPos.col;
  var result = {
    hclueNumber: null,
    vclueNumber: null
  };

  // look up the vertical word number
  while ((i > 0) && (state.selectedPuzzle.diagram[i - 1][elemPos.col] !== '.')) {
    i--; // Move up util we reach a blacked out box or the border
  }
  // look up horizontal word number
  while ((j > 0) && (state.selectedPuzzle.diagram[elemPos.row][j - 1] !== '.')) {
    j--; // Move left util we reach a blacked out box or the border
  }

  result.hclueNumber = state.selectedPuzzle.numbers[elemPos.row][j] ? state.selectedPuzzle.numbers[elemPos.row][j] : null;
  result.vclueNumber = state.selectedPuzzle.numbers[i][elemPos.col] ? state.selectedPuzzle.numbers[i][elemPos.col] : null;

  return result;
}

function semiSelectWord($elem) {
  var clue_data = $elem.data('clue_data');

  $('.semi-selected').removeClass('semi-selected');
  if (state.orientation === 'h' && clue_data.hclueNumber) {
    $('.hclue-' + clue_data.hclueNumber).addClass('semi-selected');
  } else if (state.orientation === 'v' && clue_data.vclueNumber) {
    $('.vclue-' + clue_data.vclueNumber).addClass('semi-selected');
  }
}

function highlightClue($elem) {
  var hclue = $elem.data('clue_data').hclueNumber ? $elem.data('clue_data').hclueNumber : null;
  var vclue = $elem.data('clue_data').vclueNumber ? $elem.data('clue_data').vclueNumber : null;

  $('.highlighted').removeClass('highlighted');
  if (state.orientation === 'h' && hclue) {
    $('#hclue-' + hclue).addClass('highlighted');
  } else if (state.orientation === 'v' && vclue) {
    $('#vclue-' + vclue).addClass('highlighted');
  }
}

function setStyles($elem) {
  $elem.addClass('selected-box');
  semiSelectWord($elem);
  highlightClue($elem);
}

/*
 * Handles puzzle navigation using arrow keys and refocuses on new table cell
 * Returns: false if move was unsuccessful, true otherwise.
 */
function move(direction, i, j) {
  var newId;

  if (direction === 'up' && i > 0) {
    i--;
    newId = '#' + i + '-' + j;
    if (!$(newId).hasClass('blacked-out')) {
      $(newId).focus();
    }
  } else if (direction === 'down' && i < state.selectedPuzzle.nRows - 1) {
    i++;
    newId = '#' + i + '-' + j;
    if (!$(newId).hasClass('blacked-out')) {
      $(newId).focus();
    }
  } else if (direction === 'left' && j > 0) {
    j--;
    newId = '#' + i + '-' + j;
    if (!$(newId).hasClass('blacked-out')) {
      $(newId).focus();
    }
  } else if (direction === 'right' && j < state.selectedPuzzle.nCols - 1) {
    j++;
    newId = '#' + i + '-' + j;
    if (!$(newId).hasClass('blacked-out')) {
      $(newId).focus();
    }
  }
}

function toggleOrientation($elem) {
  switch (state.orientation) {
    case 'h':
      state.orientation = 'v';
      break;
    case 'v':
      state.orientation = 'h';
      break;
    default:
  }
  setStyles($elem);
}

function processKey(event) {
  var $elem = $(this);
  var keyCode = event.which;
  var pos = getPosition($elem);

  event.preventDefault();
  console.log('KEYPRESS');
  if (keyCode >= 97 && keyCode <= 122 && !$elem.hasClass('cheated')) {
    // It's a letter
    $elem.text(String.fromCharCode(keyCode).toUpperCase());
    // Update in memeory game state
    state.board[pos.row][pos.col] = String.fromCharCode(keyCode).toUpperCase();
    if ($elem.text() !== state.solution[pos.row][pos.col]) {
      $elem.addClass('wrong-letter');
    } else {
      $elem.removeClass('wrong-letter');
    }
  } else if (String.fromCharCode(keyCode) === '?') { // question mark
    $elem.text(state.solution[pos.row][pos.col]);
    state.board[pos.row][pos.col] = state.solution[pos.row][pos.col];
    $elem.removeClass('wrong-letter');
    $elem.addClass('cheated');
  }
  state.orientation === 'h' ? move('right', pos.row, pos.col) : move('down', pos.row, pos.col);

}

function moving(event) {
  var $elem = $(this);
  var position = getPosition($elem); // Position is an array [i index, j index]
  var key = event.which.toString();

  switch (key) {
    case '38':
      move('up', position.row, position.col);
      console.log('UP');
      event.preventDefault();
      break;
    case '40':
      move('down', position.row, position.col);
      event.preventDefault();
      break;
    case '37':
      move('left', position.row, position.col);
      event.preventDefault();
      break;
    case '39':
      move('right', position.row, position.col);
      event.preventDefault();
      break;
    case '32': // space bar
      toggleOrientation($elem);
      event.preventDefault();
      break;
    default:
  }
}

function focused() {
  setStyles($(this));
}

/*
 * INITIALIZATION FUNCITONS
 * Functions used to initialize the game, the crossword puzzle and the clues
 */

/* Called every time a new puzzle is selected */
function buildCrosswordTable(puzzle) {
  var rows = puzzle.nRows;
  var cols = puzzle.nCols;
  var $crosswordTable = $('#crossword');
  var i, j, $newRow, $td, elem, id, clues;

  $crosswordTable.empty();
  state.solution = puzzle.solution;
  // Set the in memroy board every time we build a new puzzle
  state.board = puzzle.diagram.map(function(row) {
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
        if (state.board[i - 1][j - 1] === '.') {
          $td = $td.addClass('blacked-out');
          $td = $td.attr('contentEditable', 'false');
        } else {
          clues = lookUpClueNumber($td);
          $td.data('clue_data', clues);
          if (clues.hclueNumber) {
            $td = $td.addClass('hclue-' + clues.hclueNumber);
          }
          if (clues.vclueNumber) {
            $td = $td.addClass('vclue-' + clues.vclueNumber);
          }
        }
      }
    }
    $newRow.appendTo($crosswordTable);
  }
  // Put cursor on first puzzle cell for the user;
  $('#0-0').focus();
}

/*
 * Fills the across and down clues
 */
function populateClues() {
  var tableHeight = $('#crossword').height();
  var headingHeight = $('#horizontal h2').outerHeight(true);
  var $horClueList = $('#horizontal-clues ul');
  var $vertClueList = $('#vertical-clues ul');
  var clueNumber, i, j;

  $horClueList.empty();
  $vertClueList.empty();
  $('#horizontal-clues').height(tableHeight - headingHeight);
  $('#vertical-clues').height(tableHeight - headingHeight);

  for (i = 0; i < state.selectedPuzzle.nRows; i++) {
    for (j = 0; j < state.selectedPuzzle.nCols; j++) {
      clueNumber = state.selectedPuzzle.numbers[i][j];
      if (state.selectedPuzzle.acrossClues[clueNumber]) {
        $horClueList.append('<li id="hclue-' + clueNumber + '">' + clueNumber + ': ' + state.selectedPuzzle.acrossClues[clueNumber] + '</li>');
      }
      if (state.selectedPuzzle.downClues[clueNumber]) {
        $vertClueList.append('<li id="vclue-' + clueNumber + '">' + clueNumber + ': ' + state.selectedPuzzle.downClues[clueNumber] + '</li>');
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
    url = state.host + 'puzzles/' + file;
    $.getJSON(url, function(data) {
      state.puzzles.push(data);
      $select = $('select').append('<option value="' + i + '">' + file.split('.')[0] + '</option>');
      if (i === 0) {
        state.selectedPuzzle = state.puzzles[$select.val()];
        buildCrosswordTable(state.selectedPuzzle);
        populateClues();
      }
    });
  });
}

function initCrossword() {
  var files = [];

  $('select').change(function(event) {
    state.selectedPuzzle = state.puzzles[event.target.value];
    buildCrosswordTable(state.selectedPuzzle);
  });

  // Fetch all the json files from our server
  $.getJSON(state.host + 'puzzles/puzzle-list.json', function(data) {
    files = data.files;
    populatePuzzleSelection(files);
  });

  $(document).on('focusin', 'td', focused);

  $(document).on('focusout', 'td', function() {
    $(this).removeClass('selected-box');
  });
  /* We use keydown instead of keypress here because we also need to capture the
  arrow keys which aren't captured with all browsers by using keypress */
  $(document).on('keydown', 'td', moving);
  $(document).on('keypress', 'td', processKey);
}

$(document).ready(function() {
  initCrossword();
});
