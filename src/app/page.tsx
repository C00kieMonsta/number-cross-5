"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function NumberCrossGame() {
  // Define the grid size
  const GRID_SIZE = 11

  // Define the regions (cells that belong to the same region)
  const regions = [
    // Region 1
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [0, 7],
      [0, 8],
      [0, 9],
      [0, 10],
    ],
    // Region 2
    [
      [1, 0],
      [1, 1],
      [2, 0],
      [2, 1],
      [3, 0],
    ],
    // Region 3
    [
      [1, 2],
      [1, 3],
      [2, 2],
      [2, 3],
      [3, 1],
      [3, 2],
      [4, 0],
      [4, 1],
      [4, 2],
    ],
    // Region 4
    [
      [1, 4],
      [1, 5],
      [2, 4],
      [2, 5],
    ],
    // Region 5
    [
      [1, 6],
      [1, 7],
      [1, 8],
      [1, 9],
      [1, 10],
    ],
    // Region 6
    [
      [2, 6],
      [2, 7],
      [2, 8],
      [3, 5],
      [3, 6],
      [3, 7],
    ],
    // Region 7
    [
      [2, 9],
      [2, 10],
      [3, 8],
      [3, 9],
      [3, 10],
    ],
    // Region 8
    [
      [3, 3],
      [3, 4],
      [4, 3],
      [4, 4],
      [4, 5],
      [5, 3],
      [5, 4],
    ],
    // Region 9
    [
      [4, 6],
      [4, 7],
      [4, 8],
      [4, 9],
      [4, 10],
      [5, 8],
      [5, 9],
      [5, 10],
    ],
    // Region 10
    [
      [5, 0],
      [5, 1],
      [5, 2],
      [6, 0],
      [6, 1],
      [6, 2],
      [7, 0],
    ],
    // Region 11
    [
      [5, 5],
      [5, 6],
      [5, 7],
      [6, 5],
      [6, 6],
    ],
    // Region 12
    [
      [6, 3],
      [6, 4],
      [7, 1],
      [7, 2],
      [7, 3],
      [7, 4],
      [8, 2],
      [8, 3],
    ],
    // Region 13
    [
      [6, 7],
      [6, 8],
      [6, 9],
      [6, 10],
      [7, 7],
      [7, 8],
      [7, 9],
      [7, 10],
    ],
    // Region 14
    [
      [7, 5],
      [7, 6],
      [8, 4],
      [8, 5],
      [8, 6],
      [9, 5],
    ],
    // Region 15
    [
      [8, 0],
      [8, 1],
      [9, 0],
      [9, 1],
      [9, 2],
      [9, 3],
      [9, 4],
    ],
    // Region 16
    [
      [8, 7],
      [8, 8],
      [8, 9],
      [8, 10],
      [9, 6],
      [9, 7],
      [9, 8],
      [9, 9],
      [9, 10],
    ],
    // Region 17
    [
      [10, 0],
      [10, 1],
      [10, 2],
      [10, 3],
      [10, 4],
      [10, 5],
      [10, 6],
      [10, 7],
      [10, 8],
      [10, 9],
      [10, 10],
    ],
  ]

  // Define the highlighted cells (that cannot be tiled)
  const highlightedCells = [
    [1, 4],
    [1, 5],
    [2, 4],
    [2, 9],
    [3, 5],
    [5, 6],
    [5, 7],
    [6, 1],
    [6, 2],
    [6, 7],
    [6, 8],
    [7, 5],
    [7, 6],
    [9, 5],
  ]

  // Define the row clues
  const rowClues = [
    "square",
    "product of digits is 20",
    "multiple of 13",
    "multiple of 32",
    "divisible by each of its digits",
    "product of digits is 25",
    "divisible by each of its digits",
    "odd palindrome",
    "fibonacci",
    "product of digits is 2025",
    "prime",
  ]

  // Initialize the grid with empty cells
  const initialGrid = Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() => ({
          value: 0,
          tiled: false,
          highlighted: false,
          region: 0,
          originalValue: 0, // To track the original value before increments
          increments: [], // To track which tiles caused increments to this cell
        })),
    )

  // State for the grid
  const [grid, setGrid] = useState(initialGrid)
  // State for the selected digit (1-9)
  const [selectedDigit, setSelectedDigit] = useState(1)
  // State for the current mode (place digit or place tile)
  const [mode, setMode] = useState("digit") // 'digit' or 'tile'
  // State to track if the game is initialized
  const [initialized, setInitialized] = useState(false)
  // Define tile history type
  type TileRecord = {
    id: string;
    row: number;
    col: number;
    displacedValue: number;
  }

  // State to track tile placements and their effects
  const [tileHistory, setTileHistory] = useState<TileRecord[]>([])
  
  // State to track validation status
  type ValidationState = {
    regionConsistency: {
      isValid: boolean;
      inconsistentRegions: number[];
    };
    adjacentRegions: {
      isValid: boolean;
      violations: Array<{
        position1: [number, number];
        position2: [number, number];
        region1: number;
        region2: number;
        value: number;
      }>;
    };
    rowClues: {
      isValid: boolean;
      violations: Array<{
        row: number;
        number?: number;
        error: string;
        clue: string;
      }>;
    };
  }
  
  const [validationStatus, setValidationStatus] = useState<ValidationState>({
    regionConsistency: { isValid: true, inconsistentRegions: [] },
    adjacentRegions: { isValid: true, violations: [] },
    rowClues: { isValid: true, violations: [] }
  })
  
  // State to control whether to show validation results
  const [showValidationResults, setShowValidationResults] = useState(false)

  // Initialize the grid with regions and highlighted cells
  useEffect(() => {
    if (!initialized) {
      const newGrid = [...grid]

      // Assign regions
      regions.forEach((region, regionIndex) => {
        region.forEach(([row, col]) => {
          newGrid[row][col].region = regionIndex + 1
        })
      })

      // Mark highlighted cells
      highlightedCells.forEach(([row, col]) => {
        newGrid[row][col].highlighted = true
      })

      setGrid(newGrid)
      setInitialized(true)
    }
  }, [initialized])

  // Function to get adjacent cells
  const getAdjacentCells = (row, col) => {
    return [
      [row - 1, col], // up
      [row + 1, col], // down
      [row, col - 1], // left
      [row, col + 1], // right
    ].filter(
      ([r, c]) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE, // Ensure cells are within grid
    )
  }

  // Function to validate region consistency (all cells in a region have the same digit)
  const validateRegionConsistency = (currentGrid = grid) => {
    const regionValues = new Map();
    const inconsistentRegions = new Set();

    // First pass: collect values for each region
    regions.forEach((region, regionIndex) => {
      const regionNumber = regionIndex + 1;
      
      region.forEach(([row, col]) => {
        const cell = currentGrid[row][col];
        if (!cell.tiled && cell.originalValue > 0) {
          if (!regionValues.has(regionNumber)) {
            regionValues.set(regionNumber, cell.originalValue);
          } else if (regionValues.get(regionNumber) !== cell.originalValue) {
            // Found inconsistency
            inconsistentRegions.add(regionNumber);
          }
        }
      });
    });

    return {
      isValid: inconsistentRegions.size === 0,
      inconsistentRegions: Array.from(inconsistentRegions)
    };
  }

  // Function to validate adjacent cells in different regions have different digits
  const validateAdjacentRegions = (currentGrid = grid) => {
    const violations = [];

    // Check each cell and its adjacent cells
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = currentGrid[row][col];
        
        // Skip empty or tiled cells
        if (cell.tiled || cell.originalValue === 0) continue;
        
        const adjacentCells = getAdjacentCells(row, col);
        
        adjacentCells.forEach(([adjRow, adjCol]) => {
          const adjCell = currentGrid[adjRow][adjCol];
          
          // Check if adjacent cell is in a different region
          if (!adjCell.tiled && 
              adjCell.region !== cell.region && 
              adjCell.originalValue > 0 && 
              adjCell.originalValue === cell.originalValue) {
            
            violations.push({
              position1: [row, col],
              position2: [adjRow, adjCol],
              region1: cell.region,
              region2: adjCell.region,
              value: cell.originalValue
            });
          }
        });
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }
  
  // Helper functions for validating the row clues
  const isSquare = (num) => {
    const root = Math.sqrt(num);
    return Math.floor(root) === root;
  }
  
  const productOfDigits = (num) => {
    return num.toString().split('').reduce((product, digit) => product * parseInt(digit, 10), 1);
  }
  
  const isMultipleOf = (num, divisor) => {
    return num % divisor === 0;
  }
  
  const isDivisibleByEachDigit = (num) => {
    const digits = num.toString().split('').map(d => parseInt(d, 10));
    return digits.every(digit => digit !== 0 && num % digit === 0);
  }
  
  const isOddPalindrome = (num) => {
    const numStr = num.toString();
    const isPalindrome = numStr === numStr.split('').reverse().join('');
    return isPalindrome && num % 2 === 1;
  }
  
  const isFibonacci = (num) => {
    // Function to check if a number is a perfect square
    const isPerfectSquare = n => {
      const sqrt = Math.sqrt(n);
      return sqrt === Math.floor(sqrt);
    };
    
    // A number is Fibonacci if and only if (5*n^2 + 4) or (5*n^2 - 4) is a perfect square
    return isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4);
  }
  
  const isPrime = (num) => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    
    return true;
  }
  
  // Function to validate row clues
  const validateRowClues = (currentGrid = grid) => {
    const rowViolations = [];
    const allFormattedNumbers = new Set();
    
    // For each row
    for (let row = 0; row < GRID_SIZE; row++) {
      const clue = rowClues[row];
      const consecutiveGroups = [];
      let currentGroup = [];
      
      // Find consecutive groups in the row
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = currentGrid[row][col];
        
        if (!cell.tiled && cell.value > 0) {
          currentGroup.push(cell.value);
        } else if (currentGroup.length > 0) {
          consecutiveGroups.push(currentGroup);
          currentGroup = [];
        }
      }
      
      // Add the last group if it exists
      if (currentGroup.length > 0) {
        consecutiveGroups.push(currentGroup);
      }
      
      // Convert groups to numbers (concatenation)
      const numbers = consecutiveGroups
        .filter(group => group.length >= 2) // Numbers must be at least 2 digits
        .map(group => parseInt(group.join(''), 10));
      
      // Check for uniqueness across all rows
      for (const num of numbers) {
        if (allFormattedNumbers.has(num)) {
          rowViolations.push({
            row,
            error: `Duplicate number ${num} found`,
            clue
          });
        } else {
          allFormattedNumbers.add(num);
        }
      }
      
      // Validate each number against the row clue
      let rowValid = true;
      for (const num of numbers) {
        let numValid = false;
        
        switch (clue) {
          case "square":
            numValid = isSquare(num);
            break;
          case "product of digits is 20":
            numValid = productOfDigits(num) === 20;
            break;
          case "product of digits is 25":
            numValid = productOfDigits(num) === 25;
            break;
          case "product of digits is 2025":
            numValid = productOfDigits(num) === 2025;
            break;
          case "multiple of 13":
            numValid = isMultipleOf(num, 13);
            break;
          case "multiple of 32":
            numValid = isMultipleOf(num, 32);
            break;
          case "divisible by each of its digits":
            numValid = isDivisibleByEachDigit(num);
            break;
          case "odd palindrome":
            numValid = isOddPalindrome(num);
            break;
          case "fibonacci":
            numValid = isFibonacci(num);
            break;
          case "prime":
            numValid = isPrime(num);
            break;
          default:
            numValid = true; // Unknown clue
        }
        
        if (!numValid) {
          rowValid = false;
          rowViolations.push({
            row,
            number: num,
            error: `Number ${num} does not satisfy the clue "${clue}"`,
            clue
          });
        }
      }
    }
    
    return {
      isValid: rowViolations.length === 0,
      violations: rowViolations
    };
  }

  // Function to check if a tile can be placed (no adjacent tiles)
  const canPlaceTile = (row, col, currentGrid) => {
    const adjacentCells = getAdjacentCells(row, col)
    return !adjacentCells.some(([r, c]) => currentGrid[r][c].tiled)
  }

  // Function to distribute increments to adjacent cells
  const distributeIncrements = (row, col, value, newGrid, tileId) => {
    const adjacentCells = getAdjacentCells(row, col)

    // Filter out highlighted cells
    const validAdjacentCells = adjacentCells.filter(([r, c]) => !newGrid[r][c].highlighted)

    if (validAdjacentCells.length === 0) return

    // Calculate how much each cell should be incremented
    // This is a simplified distribution - in a real game, this might be more complex
    const totalCells = validAdjacentCells.length
    const baseIncrement = Math.floor(value / totalCells)
    const remainder = value % totalCells

    validAdjacentCells.forEach(([r, c], index) => {
      const increment = baseIncrement + (index < remainder ? 1 : 0)

      // Record the increment for this cell
      newGrid[r][c].increments.push({
        tileId,
        amount: increment,
      })

      // Apply the increment, but don't exceed 9
      newGrid[r][c].value = Math.min(9, newGrid[r][c].value + increment)
    })
  }

  // Function to validate all rules
  const validateRules = (currentGrid = grid) => {
    const regionConsistency = validateRegionConsistency(currentGrid);
    const adjacentRegions = validateAdjacentRegions(currentGrid);
    const rowClues = validateRowClues(currentGrid);
    
    setValidationStatus({
      regionConsistency,
      adjacentRegions,
      rowClues
    });
    
    return {
      isValid: regionConsistency.isValid && adjacentRegions.isValid && rowClues.isValid,
      regionConsistency,
      adjacentRegions,
      rowClues
    };
  }

  // Function to handle cell click
  const handleCellClick = (row, col) => {
    const newGrid = JSON.parse(JSON.stringify(grid)) // Deep copy
    const cell = newGrid[row][col]

    // Place a digit in a single cell
    if (mode === "digit") {
      // Place a digit in a single cell
      if (!cell.tiled) {
        // If the cell already has this digit, clear it (undo)
        if (cell.value === selectedDigit) {
          cell.originalValue = 0
          cell.value = 0
        } else {
          // Otherwise, set the digit
          cell.originalValue = selectedDigit
          cell.value = selectedDigit
        }
      }
    } else if (mode === "tile") {
      // Don't allow placing tiles on highlighted cells
      if (cell.highlighted) return

      if (!cell.tiled) {
        // Check if a tile can be placed here (no adjacent tiles)
        if (!canPlaceTile(row, col, newGrid)) {
          alert("Tiles cannot share a common edge!")
          return
        }

        // Get the displaced value
        const displacedValue = cell.value

        // Create a unique ID for this tile
        const tileId = Date.now().toString()

        // Add to tile history
        setTileHistory([
          ...tileHistory,
          {
            id: tileId,
            row,
            col,
            displacedValue,
          },
        ])

        // Mark as tiled
        cell.tiled = true

        // Distribute increments to adjacent cells
        distributeIncrements(row, col, displacedValue, newGrid, tileId)
      } else {
        // Remove the tile
        cell.tiled = false

        // Find the tile in history
        const tileIndex = tileHistory.findIndex((tile) => tile.row === row && tile.col === col)
        if (tileIndex === -1) return

        const removedTile = tileHistory[tileIndex]
        const newTileHistory = [...tileHistory]
        newTileHistory.splice(tileIndex, 1)
        setTileHistory(newTileHistory)

        // Restore the original value to the cell
        cell.value = cell.originalValue

        // Remove increments caused by this tile from all cells
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            const cellIncrements = newGrid[r][c].increments
            const tileIncrementIndex = cellIncrements.findIndex((inc) => inc.tileId === removedTile.id)

            if (tileIncrementIndex !== -1) {
              // Remove the increment amount
              const incrementAmount = cellIncrements[tileIncrementIndex].amount
              newGrid[r][c].value = Math.max(0, newGrid[r][c].value - incrementAmount)

              // Remove the increment record
              cellIncrements.splice(tileIncrementIndex, 1)
            }
          }
        }
      }
    }

    setGrid(newGrid)
    
    // Automatically validate when in digit mode
    if (mode === "digit") {
      validateRules(newGrid);
      setShowValidationResults(true);
    }
  }

  // Function to reset the grid
  const resetGrid = () => {
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({
            value: 0,
            tiled: false,
            highlighted: false,
            region: 0,
            originalValue: 0,
            increments: [],
          })),
      )

    // Reassign regions
    regions.forEach((region, regionIndex) => {
      region.forEach(([row, col]) => {
        newGrid[row][col].region = regionIndex + 1
      })
    })

    // Mark highlighted cells
    highlightedCells.forEach(([row, col]) => {
      newGrid[row][col].highlighted = true
    })

    setGrid(newGrid)
    setTileHistory([])
  }

  // Function to check if a cell has a border on a specific side
  const hasBorder = (row, col, side) => {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return true

    const currentRegion = grid[row][col].region

    if (side === "top") {
      if (row === 0) return true
      return grid[row - 1][col].region !== currentRegion
    }
    if (side === "right") {
      if (col === GRID_SIZE - 1) return true
      return grid[row][col + 1].region !== currentRegion
    }
    if (side === "bottom") {
      if (row === GRID_SIZE - 1) return true
      return grid[row + 1][col].region !== currentRegion
    }
    if (side === "left") {
      if (col === 0) return true
      return grid[row][col - 1].region !== currentRegion
    }

    return false
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Number Cross Game</h1>

      <div className="mb-4 space-x-2">
        <Button variant={mode === "digit" ? "default" : "outline"} onClick={() => setMode("digit")}>
          Place Digits
        </Button>
        <Button variant={mode === "tile" ? "default" : "outline"} onClick={() => setMode("tile")}>
          Place Tiles
        </Button>
        <Button onClick={resetGrid}>Reset</Button>
        <Button 
          variant="outline" 
          onClick={() => {
            validateRules();
            setShowValidationResults(true);
          }}
        >
          Validate Rules
        </Button>
      </div>

      {mode === "digit" && (
        <div className="mb-4 flex space-x-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <Button
              key={digit}
              variant={selectedDigit === digit ? "default" : "outline"}
              onClick={() => setSelectedDigit(digit)}
              className="w-10 h-10"
            >
              {digit}
            </Button>
          ))}
        </div>
      )}

      <div className="flex">
        <div className="mr-4">
          {rowClues.map((clue, index) => (
            <div key={index} className="h-10 flex items-center text-right text-sm pr-2" style={{ width: "180px" }}>
              {clue}
            </div>
          ))}
        </div>

        <div className="border-2 border-black">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center relative cursor-pointer",
                    cell.highlighted ? "bg-yellow-300" : "bg-white",
                    cell.tiled ? "bg-black" : "",
                  )}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {!cell.tiled && cell.value > 0 && <span className="text-lg font-semibold">{cell.value}</span>}

                  {/* Borders */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-[2px]",
                      hasBorder(rowIndex, colIndex, "top") ? "bg-black" : "bg-gray-200",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute top-0 right-0 bottom-0 w-[2px]",
                      hasBorder(rowIndex, colIndex, "right") ? "bg-black" : "bg-gray-200",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-[2px]",
                      hasBorder(rowIndex, colIndex, "bottom") ? "bg-black" : "bg-gray-200",
                    )}
                  />
                  <div
                    className={cn(
                      "absolute top-0 left-0 bottom-0 w-[2px]",
                      hasBorder(rowIndex, colIndex, "left") ? "bg-black" : "bg-gray-200",
                    )}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Validation Results */}
      {showValidationResults && (
        <div className="mt-6 max-w-2xl w-full text-sm border p-4 rounded-md bg-white mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-base">Validation Results:</h3>
            <Button 
              variant="ghost" 
              onClick={() => setShowValidationResults(false)}
              className="text-xs h-7 p-2"
            >
              Hide
            </Button>
          </div>
          
          <div className="space-y-3">
            {/* Region Consistency */}
            <div>
              <div className={`flex items-center ${validationStatus.regionConsistency.isValid ? 'text-green-600' : 'text-red-600'}`}>
                <span className="font-medium">Region Consistency:</span>
                <span className="ml-2">
                  {validationStatus.regionConsistency.isValid ? 'Valid ✓' : 'Invalid ✗'}
                </span>
              </div>
              
              {!validationStatus.regionConsistency.isValid && (
                <div className="ml-4 mt-1 text-xs text-red-600">
                  <p>Inconsistent regions: {validationStatus.regionConsistency.inconsistentRegions.join(', ')}</p>
                  <p>All cells within the same region must have the same digit.</p>
                </div>
              )}
            </div>
            
            {/* Adjacent Regions */}
            <div>
              <div className={`flex items-center ${validationStatus.adjacentRegions.isValid ? 'text-green-600' : 'text-red-600'}`}>
                <span className="font-medium">Adjacent Region Digits:</span>
                <span className="ml-2">
                  {validationStatus.adjacentRegions.isValid ? 'Valid ✓' : 'Invalid ✗'}
                </span>
              </div>
              
              {!validationStatus.adjacentRegions.isValid && (
                <div className="ml-4 mt-1 text-xs text-red-600">
                  <p>
                    Found {validationStatus.adjacentRegions.violations.length} violation(s) where adjacent cells in different regions have the same digit.
                  </p>
                </div>
              )}
            </div>
            
            {/* Row Clues */}
            <div>
              <div className={`flex items-center ${validationStatus.rowClues.isValid ? 'text-green-600' : 'text-red-600'}`}>
                <span className="font-medium">Row Clues:</span>
                <span className="ml-2">
                  {validationStatus.rowClues.isValid ? 'Valid ✓' : 'Invalid ✗'}
                </span>
              </div>
              
              {!validationStatus.rowClues.isValid && (
                <div className="ml-4 mt-1 text-xs text-red-600">
                  {validationStatus.rowClues.violations.map((violation, idx) => (
                    <p key={idx}>
                      Row {violation.row + 1}: {violation.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
            
            {/* Overall Result */}
            <div className={`flex font-bold mt-3 ${
              validationStatus.regionConsistency.isValid && 
              validationStatus.adjacentRegions.isValid && 
              validationStatus.rowClues.isValid ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>Overall:</span>
              <span className="ml-2">
                {validationStatus.regionConsistency.isValid && 
                 validationStatus.adjacentRegions.isValid && 
                 validationStatus.rowClues.isValid ? 'All rules satisfied! ✓' : 'Some rules are not satisfied. ✗'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Rules */}
      <div className="mt-6 max-w-2xl text-sm border p-4 rounded-md bg-white">
        <h3 className="font-bold mb-2 text-base">Rules:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            The 11-by-11 grid is divided into several regions. Place positive digits (1-9) into the cells. Every
            cell within a region must contain the same digit, and orthogonally adjacent cells in different regions
            must have different digits.
          </li>
          <li>
            After doing this, place some tiles into the grid. Tiles are represented by blacking out a cell, and no
            two tiles are allowed to share a common edge. When a tile is placed on a cell, it displaces the value
            (digit) in that cell. That means the orthogonally adjacent cells, collectively, must be incremented by
            that displaced value.
          </li>
          <li>
            Digits may not be incremented any higher than 9. Incrementing digits may cause neighboring cells from
            different regions to contain the same value – this is fine. Some cells have been highlighted (in yellow): these
            cells may not contain tiles and may not be altered by any of the increments.
          </li>
          <li>
            Each row has been supplied with a clue. Every number formed by concatenating consecutive groups of
            un-tiled cells within a row must satisfy the clue given for the row. Numbers must be at least two digits long and may not repeat in the grid.
          </li>
        </ul>
      </div>
    </div>
  )
}
