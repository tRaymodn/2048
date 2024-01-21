class TileRows {
    constructor() {
        this.configurations = [];
        this.configDecomps = [];
        this.nonReversibleConfigs = [];
    }
    // ChatGPT
    arraysAreEqual(array1, array2) {
        if (array1.length !== array2.length) {
            return false;
        }

        for (let i = 0; i < array1.length; i++) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }

        return true;
    }
    evaluateState(arr, prevList) {
        let noRight = false;
        let noLeft = false;
        for (let i = 0; i < 2; i++) { // direction (0: right, 1: left)
            for (let j = 0; j < 2; j++) { // tile placement position (0: right, 1: left)
                for (let k = 0; k < 2; k++) { // tile placement value (0: 2, 1: 4)
                    //console.log("Original Array:" + arr);
                    let newArray = Array(arr.length).fill(0);
                    //console.log("new" + newArray);
                    let ind;
                    if ((i == 0 && !noRight) || (noLeft && !noRight)) { // direction right
                        //console.log("Move Right");
                        let merged = false;
                        ind = arr.length - 1;
                        for (let l = arr.length - 1; l >= 0; l--) { // go thru backwards
                            if (arr[l] != 0) { // if there is a value at this position in the array, assign it to newArray and decrement ind
                                if (l != arr.length - 1 && ind != arr.length - 1) { // if we are not on the first item in the array, and there is at least one thing in newArray
                                    if (arr[l] == newArray[ind + 1] && !merged) { // if the value in arr is the same as the previous value in newArray, then merge
                                        newArray[ind + 1] = arr[l] * 2;
                                        merged = true;
                                    }
                                    else {
                                        newArray[ind] = arr[l];
                                        ind--;
                                        merged = false;
                                    }
                                }
                                else {
                                    newArray[ind] = arr[l];
                                    ind--;
                                    merged = false;
                                }
                            }
                        }
                    }
                    else if (!noLeft) { // direction left
                        //console.log("Move Left");
                        let merged = false;
                        ind = 0;
                        for (let l = 0; l < arr.length; l++) { // go thru forwards
                            if (arr[l] != 0) { // if there is a value at this position in the array, assign it to newArray and decrement ind
                                if (l != 0 && ind != 0) { // if we are not on the first item in the array, and there is at least one thing in newArray
                                    if (arr[l] == newArray[ind - 1] && !merged) { // if the value in arr is the same as the previous value in newArray, then merge
                                        newArray[ind - 1] = arr[l] * 2;
                                        merged = true;
                                    }
                                    else {
                                        newArray[ind] = arr[l];
                                        ind++;
                                        merged = false;
                                    }
                                }
                                else {
                                    newArray[ind] = arr[l];
                                    ind++;
                                    merged = false;
                                }
                            }
                        }
                    }
                    else { // if neither of the previous two cases run, set newArray equal to arr so that no extra stuff happens
                        newArray = arr;
                        //console.log("No left or right moves" + newArray); // this is a problem
                    }
                    //console.log("newArray after shifting" + newArray);
                    let emptyArray = [arr.length];
                    for (let p = 0; p < arr.length; p++) { // populate array of length arr.length with zeroes
                        emptyArray[p] = 0;
                    }
                    if (!this.arraysAreEqual(newArray, arr) || this.arraysAreEqual(newArray, emptyArray)) { // if the array changed after the shift, or it is the first (empty) array, insert a tile and continue
                        //console.log("Arrays Changed!");
                        // Set tile value
                        let value = (k == 0) ? 2 : 4;
                        // now we should have the array situated mostly correctly depending on the move (barring merges)
                        if (j == 0) { // tile placed on the right
                            //console.log("Place " + value + " Right");
                            for (let l = newArray.length - 1; l >= 0; l--) {
                                if (newArray[l] == 0) {
                                    newArray[l] = value;
                                    break;
                                }
                            }
                        } else { // tile placed on left
                            //console.log("Place " + value + " Left");
                            for (let l = 0; l < newArray.length; l++) {
                                if (newArray[l] == 0) {
                                    newArray[l] = value;
                                    break;
                                }
                            }
                        }
                        //console.log("Array after tile placement: " + newArray);
                        let end = true;
                        for (let u = 0; u < newArray.length - 1; u++) {
                            if ((newArray[u] == 0 || newArray[u + 1] == 0) || newArray[u] == newArray[u + 1]) { // if there are any empty spaces or like tiles adjacent, it is not the end
                                end = false;
                                break;
                            }
                        }
                        // TODO can definetly clean this up and get rid of some of the redundancy \/ \/ \/ \/ \/ \/
                        if (!end) { // the resulting move is not the end and needs to be investigated further
                            if (this.inConfiguration(newArray) == -1) { // if current state is not in configs already
                                this.configurations.push(newArray);
                                //console.log("Added " + newArray);
                                let nonReversible = true;
                                for (let g = 0; g < Math.floor(newArray.length / 2); g++) {
                                    if (newArray[g] != newArray[newArray.length - 1 - g]) {
                                        nonReversible = false;
                                        break;
                                    }
                                }
                                if (nonReversible) {
                                    this.nonReversibleConfigs.push(newArray);
                                }

                                let moves = [...prevList]; // copy prevList
                                let m = i;
                                if (noRight) {
                                    m = "1";
                                }
                                else if (noLeft) {
                                    m = "0";
                                }
                                let move = `${m}${k}${j}`; //construct string
                                moves.push(move); //add new move string to prevList
                                let currentMoves = Array(moves.length);
                                for (let r = 0; r < moves.length; r++) currentMoves[r] = moves[r]; // fill currentMoves
                                this.configDecomps.push(currentMoves);
                                //console.log("Decomp move: " + move);

                                this.evaluateState(newArray, moves); // this is the only thing that is different I think
                            }
                            else {
                                //console.log(" Already in configs");
                            }
                        } else { // the resulting move is a final state, need to check if it's already in the list
                            //console.log("No more moves");
                            if (this.inConfiguration(newArray) == -1) {
                                this.configurations.push(newArray);
                                //console.log(" Added " + newArray + " no more");
                                let nonReversible = true;
                                for (let g = 0; g < Math.floor(newArray.length / 2); g++) {
                                    if (newArray[g] != newArray[newArray.length - 1 - g]) {
                                        nonReversible = false;
                                        break;
                                    }
                                }
                                if (nonReversible) {
                                    this.nonReversibleConfigs.push(newArray);
                                }

                                let moves = [...prevList]; // copy prevList
                                let m = i;
                                if (noRight) {
                                    m = "1";
                                }
                                else if (noLeft) {
                                    m = "0";
                                }
                                let move = `${m}${k}${j}`; //construct string
                                moves.push(move); //add new move string to prevList
                                let currentMoves = Array(moves.length);
                                for (let r = 0; r < moves.length; r++) currentMoves[r] = moves[r]; // fill currentMoves
                                this.configDecomps.push(currentMoves);
                                //console.log("Decomp move: " + move + " no more");
                            }
                        }

                    }
                    else {
                        //console.log("I Crapped");
                        if (i == 0) {
                            noRight = true;
                        }
                        else {
                            noLeft = true;
                        }
                    }
                }
            }
        }
        //console.log(arr + " is finished, config size: " + this.configurations.length);
    }
    inConfiguration(arr) {
        for (let i = 0; i < this.configurations.length; i++) {
            let matches = 0;
            for (let j = 0; j < arr.length; j++) {
                if (arr[j] == this.configurations[i][j]) {
                    matches++;
                }
            }
            if (matches == arr.length) {
                return i;
            }
        }
        return -1;
    }
    getFilledConfigs() {
        let filled = [];
        for (const configuration of this.configurations) {
            let flag = false;
            for (let j = 0; j < configuration.length - 1; j++) {
                if (configuration[j] == 0 || configuration[j + 1] == 0 || configuration[j] == configuration[j + 1]) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                filled.push(configuration);
            }
        }
        return filled;
    }
    findMerge(arr, numbers) {
        if (numbers.length > 4 || numbers.length == 0) { // catch incorrect number of args
            return -1;
        }
        let match = [arr.length];
        for (let p = 0; p < match.length; p++) {
            match[p] = 0;

        }
        for (const pos of numbers) { // set the match array to be equal to the values we want to merge (same as the ones in the original array)
            match[pos] = arr[pos];
        }
        return this.inConfiguration(match);
    }
    findHalves(row, halvesSoFar, times) {
        let r = [...row];
        let flag = false;
        for (let i = 0; i < r.length; i++) {
            if (row[i] / 2 != 0) {
                r[i] = row[i] / 2;
            }
            if (r[i] < 2 && r[i] != 0) {
                flag = true;
                break;
            }
        }
        let ind = this.inConfiguration(r);
        if (ind != -1 && !flag) {
            halvesSoFar.push({ config: this.configurations[ind], times: times });
        }
        if (!flag) {
            return this.findHalves(r, halvesSoFar, times * 2);
        }
        else {
            return halvesSoFar;
        }
    }
    makeRow(row) {
        let ind = this.inConfiguration(row);
        let list = []; // dont know what this is
        let size = 0;
        if (ind != -1) { // if the given row is one that can be made in a single row, then just return that
            list.push(this.configDecomps[ind]);
            //console.log(`${row} is in configs`);
            return { list: [{ config: row, times: 1 }], len: 0 };
        }
        else { // needed row is not one that can be created using a single row,
            // I think it would be beneficial to build from the middle out, because it is much easier to make the tiles that we want on the edges of the board
            let closest = Array(this.configurations[0].length).fill(0);
            for (const config of this.configurations) {
                let matches = 0;
                for (let i = 0; i < config.length; i++) {
                    if (config[i] <= row[i] && config[i] >= closest[i] && config[i] != 0) {
                        matches++;
                    }
                }
                let oop = false; // this for loop makes it so that all positions of the chosen array will not be greater than any more positions than that position is greater than in row.
                for (let j = 0; j < config.length; j++) {
                    for (let k = 0; k < config.length; k++) {
                        if (row[j] > row[k] && config[j] <= config[k] && j != k) {
                            oop = true;
                        }
                    }
                }
                if (matches == closest.length && !oop) {
                    closest = config;
                }
            }
            //console.log("Goal is: " + row);
            //console.log(closest);
            // Start from both sides out and find sets of tiles and see if each side can get made
            // ORRR if half of it can be made, because then we can just do the same thing twice!!
            // ORRRR if a quarter of it can be made or similar
            let validLeft = [];
            for (let i = 0; i < row.length; i++) {
                let left = Array(row.length).fill(0);
                for (let j = 0; j <= i; j++) {
                    left[j] = row[j];
                }
                if (this.inConfiguration(left) != -1) { // we can make this one, should make a checkHalf or checkQyarter function to see if it can be made with the given board size
                    validLeft.push({ config: left, times: 1 });
                }
                let halves = this.findHalves(left, [], 2);
                for (let h = 0; h < halves.length; h++) {
                    validLeft.push({ config: halves[h].config, times: halves[h].times });
                }
            }
            let validRight = [];
            for (let i = row.length - 1; i >= 0; i--) {
                let right = Array(row.length).fill(0);
                for (let j = row.length - 1; j >= i; j--) {
                    right[j] = row[j];
                }
                let index = this.inConfiguration(right);
                if (index != -1) {
                    validRight.push({ config: right, times: 1 });
                }
                let halves = this.findHalves(right, [], 2);
                for (let h = 0; h < halves.length; h++) {
                    validRight.push({ config: halves[h].config, times: halves[h].times });
                }
            }
            let allValid = [...validRight];
            for (const h of validLeft) {
                allValid.push(h);
            }
            //console.log("All Valid: ");
            let bestLen = row.length; // want it to be small, its really the number of zeros in the given row
            let bestOnes = [];
            let oneList = [];
            for (const r of allValid) {
                //console.log(r);
                let zeros = 0;
                let onRight = false;
                let onLeft = false;
                for (let v = 0; v < r.config.length; v++) {
                    if (r.config[v] === 0) {
                        zeros = zeros + 1;
                        if (v === 0) onLeft = true;
                        if (v === r.config.length) onRight = true;
                    }
                }
                if (zeros === bestLen) {
                    bestOnes.push(r);
                }
                else if (zeros < bestLen) {
                    bestLen = zeros;
                    bestOnes = [r];
                }
                if(zeros === row.length - 1){
                    oneList.push(r);
                }
            }
            //console.log(bestOnes);
            list = bestOnes;
            switch (bestLen) {
                case 0:
                    //console.log("Totally Filled, Yippeee!");
                    break;
                case 1:
                    bestOnes.forEach((row) => { // 3-1s have a config and a times, but they also have a decomp property
                        for(let i = 0; i < oneList.length; i++){
                            if(row.config[0] === 0 && oneList[i].config[0] !== 0){
                                let t = row.times >= oneList[i].times ? row.times : oneList[i].times;
                                let newRow = {config: row.config, times: t, decomp: [row, oneList[i]]}
                                newRow.config[0] = oneList[i].config[0];
                                list.push(newRow)
                            }
                            else if(row.config[row.config.length -1] === 0 && oneList[i].config[row.config.length - 1] !== 0){
                                let t = row.times >= oneList[i].times ? row.times : oneList[i].times;
                                let newRow = {config: row.config, times: t, decomp: [row, oneList[i]]}
                                newRow.config[newRow.config.length -1] = oneList[i].config[oneList[i].config.length-1];
                                list.push(newRow);
                            }
                        }
                    })
                    //console.log("Good, most likely");
                    break;
                default:
                    //console.log("Don't know about that chief");
                    break;
            }

            // if any config in allValid is of length board.length, and there are enough tiles to do the number of times, then the row can be made
            // ones with length board.length - 1 should be easy enough to make as well, as long as there is enough space for the number of times
            return { list: list, len: bestLen };
        }

    }
    /**
     * This function takes in a 2D array of integers representing the positions of different tiles on a final color board, and returns a list of
     * lists containing the makeable composite rows that will make up the rows of the final board and how many of that row would be needed, as well
     * as a list of the translation between the index of colors on the board and value of each tile on the final board
     *
     * @param {Number[][]} colors - 2D array of integers representing the positions of different tiles on a final color board
     * @returns [
     * [{"list":[{"config":[16,8,2,4],"times":1}],"row":[2,2,0,1]}}, {"list":...}]...
     * ]
     *
     * config: configuration that can be made in a single row
     * times: number of merges of this row it would take to reach the desired row
     * row: the color mapping for the row that config*times is supposed to represent
     * list: the listing of "config" and "times"
     *
     * returns an array containing an array of n {"list":x, "row":y} objects depending on how many rows are in the final board (only checks row combinations right now)
     * Already probably runs for too long, but rn, I check all valid combinations of picking the needed colors out of the total color pool for the board size
     * If any of the possible permutations of that combination (necessary because of the multi-tile color distribution) make n valid rows, add if to a list
     *
     * So I really only return all of the valid ways from a single configuration of needed colors from the total colors (all permutations of that set included)
     *
     * TODO:: Still need to make sure that the rows will not merge with the ones above/below them
     *
     *
     */
    tileAssignments(colors) {
        console.log(colors);
        let singleColor = Array(2 * colors.length).fill(true); // 2n possible colors on an nxn board
        let highest = 0;
        for (let i = 0; i < colors.length; i++) {
            for (let j = 0; j < colors[0].length; j++) {
                let thisColor = colors[i][j];
                if (i != 0 && i != colors.length - 1 && j != 0 && j != colors.length - 1) {
                    if (colors[i + 1][j] == thisColor || colors[i - 1][j] == thisColor || colors[i][j + 1] == thisColor || colors[i][j - 1] == thisColor) {
                        singleColor[thisColor] = false;
                    }
                }
                else if (i == 0) {
                    if (j == 0) {
                        if (colors[i + 1][j] == thisColor || colors[i][j + 1] == thisColor) {
                            singleColor[thisColor] = false;
                        }
                    }
                    else if (j == colors.length - 1) {
                        if (colors[i + 1][j] == thisColor || colors[i][j - 1] == thisColor) {
                            singleColor[thisColor] = false;

                        }
                    }
                    else {
                        if (colors[i + 1][j] == thisColor || colors[i][j - 1] == thisColor || colors[i][j + 1] == thisColor) {
                            singleColor[thisColor] = false;
                        }
                    }
                }
                else if (j == 0) {
                    if (i == colors.length - 1) {
                        if (colors[i][j + 1] == thisColor || colors[i - 1][j] == thisColor) {
                            singleColor[thisColor] = false;
                        }
                    }
                    else {
                        if (colors[i + 1][j] == thisColor || colors[i - 1][j] == thisColor || colors[i][j + 1] == thisColor) {
                            singleColor[thisColor] = false;
                        }
                    }
                }
                if (colors[i][j] > highest) {
                    highest = colors[i][j];
                }
            }
        }
        //console.log(singleColor);
        // singleColor and highest should be filled correctly now
        // so we choose highest from color.length*2 highest number of times to get all possible sets
        // then for each singleColor, we choose that many values from highest in the same order because order matters!
        // so as long as we have all possible combinations of highest, we can get all combinations using singleColor the same way each time going through
        let allColors = Array(colors.length * 2); // array of all possible tile values -> 2^n
        for (let i = 0; i < allColors.length; i++) {
            allColors[i] = Math.pow(2, i + 1);
        }
        let colorNum = 0;
        for (let i = 0; i <= highest; i++) {
            if (singleColor[i]) {
                colorNum = colorNum + 1;
            }
            else {
                colorNum = colorNum + 2;
            }
        }
        let combinations = this.getCombinations(allColors, colorNum);
        //console.log(`All colors: ${allColors} \n Combinations: ${combinations} Needed colors: ${colorNum}`);

        // for each combination of colorNum values, we need to find all of the ways to split the values into sets of 1 and 2, then find all combinations of those sets that do 
        // not include duplicate values, and adhere to the number of single and double colors 
        // now go through each combination
        // and check each combination's permutations for valid color tile assignments
        let setCombinations = [];
        for (let i = 0; i < combinations.length; i++) {
            let permutations = this.allPermutations(combinations[i]);
            let makeablePerms = [];
            let makeableMapping = [];
            for (const perm of permutations) {
                // for each permutation, assign those values to the board, and see if either the rows or columns all have 4s if you makeRow() them
                // first make a mapping from colors input numbers to values in permutations
                let permMap = [];
                let plus = 0;
                for (let j = 0; j <= highest; j++) { // push values of perm to permMap
                    let currentVals = [];
                    currentVals.push(perm[j + plus]);
                    if (!singleColor[j]) {
                        plus = plus + 1;
                        currentVals.push(perm[j + plus]);
                    }
                    permMap.push(currentVals);
                    //console.log(currentVals);
                    //currentVals is the current PermMap, so we need to make four rows and cols using the mapping from colors to see if those are valid
                    // will need to be able to create multiple maps to handle different tiles being in different spots on the board for the same color
                }
                let newMap = [];
                for (let p = 0; p < colors.length; p++) { // set newMap to proper values using permMap and colors
                    newMap[p] = [];
                    for (let q = 0; q < colors[0].length; q++) {
                        newMap[p][q] = permMap[colors[p][q]];
                    }
                }
                //console.log("newmap:" + JSON.stringify(newMap));
                // now newMap has the tile assignments for the possible tiles for each color
                // now we need to test makeRow() on the rows and columns of the translated color array to see if all of them return 4
                let eachRowPossibilities = []; // going to end up being the length of the number of rows that can be made on the board
                let times = 0;
                for (let row of newMap) {
                    let r = []; // r holds all rows made from this row
                    r.push([]); // push the first array
                    for (let p = 0; p < row.length; p++) {
                        if (row[p].length < 2) { // if theres only one value in row, then just put it there
                            r.forEach((pos) => { pos.push(row[p][0]); });
                        }
                        else {
                            // if there are two values, for every current row that is able to be made so far, we need to double the number of rows
                            // in r, because the new rows would be everything that the old rows had, with either one of the available values from this pos
                            r.forEach((rSoFar) => {
                                let secondChoice = rSoFar.slice();
                                rSoFar.push(row[p][0]); // pushh first value to one already in list
                                secondChoice.push(row[p][1]);
                                r.push(secondChoice); // make copy of original list without first value inserted, add the second value, then add it to list
                            });
                        }
                    }
                    //console.log(`Row possibilities for ${row}: ${r}`);
                    // I think this is correct and works now! (r is filled with row possibilites using different tiles in different placements for the current row in newMap)
                    // maybe
                    let bestPossibilities = [];
                    for (const possib of r) {
                        //console.log(JSON.stringify(possib) + "possib");
                        if (!this.adjacentVals(possib)) {
                            //TODO here somewhere I need to check if this permutation can be made considering the rows above and below it - sliding
                            let res = this.makeRow(possib);
                            if(res.len === 1){
                                //console.log(res)
                            }
                            if (res.len === 0 || res.len === 1) { // only pushing if makeRow() returns a full row
                                bestPossibilities.push({ list: res.list, row: colors[times] });
                            }
                        }
                    }
                    //console.log("best possibilities: ");
                    //console.log(JSON.stringify(bestPossibilities));
                    eachRowPossibilities.push(bestPossibilities);
                    times = times + 1;
                }


                let oofFlag = false;
                for (const poss of eachRowPossibilities) {
                    if (poss.length < 1 || poss === -1) {
                        oofFlag = true;
                    }
                }

                if (oofFlag) {
                    //console.log("Not all rows could be made with this permutation");
                }
                else {
                    //console.log("makeRow() returned 4 for all rows with this permutation");
                    makeablePerms.push(eachRowPossibilities);
                    makeableMapping.push(permMap);
                    //console.log(perm);
                }
            }

            if (makeablePerms.length > 0) {
                console.log("Checking Vertical Viability ");
                let noVerts = this.noVertSimilar(makeablePerms, colors.length, makeableMapping);
                if (noVerts.length > 0) {
                    console.log("Checking Row Makeability ");
                    let rowMakeable = this.rowsMakeable(noVerts);
                    if (rowMakeable.length > 0) {
                        let finalMoves = this.rowsToMoves(rowMakeable);
                        let mmm = this.movesToObjects(finalMoves);
                        return mmm;
                    }
                    else {
                        console.log("Rows not Makeable");
                    }
                }
                else {
                    console.log("Rows not slidable");
                }
            }
        }
        return [];
    }
    // make a function to go through makeablePerms - the rows that can be made, and find a combination of rows that do not have any similarities vertically
    noVertSimilar(hugeList, arraySize, mappings) {
        console.log(hugeList)
        let totalPossibilities = [];
        for (let i = 0; i < hugeList.length; i++) {
            let allPossibilities = [];
            for (let j = 0; j < hugeList[i].length; j++) {
                for (let k = 0; k < hugeList[i][j].length; k++) {
                    for (let p = 0; p < hugeList[i][j][k].list.length; p++) {
                        if (j === 0) { // if this is representing the first row in the newColorMapping
                            allPossibilities.push([hugeList[i][j][k].list[p]]); // push each config that can make the first row
                        }

                        // hugeList[i] has all the complete row sets for each permutation
                        // hugeList[i][j] has all of the ways to make the jth row 
                        // hugeList[i][j][k] has the kth way of composing the jth row
                        // hugeList[i][j][k].list[p]

                        else { // if we are not at the first row in newColorMapping
                            allPossibilities.forEach((possibility) => { // for each possibility list in allPossibilities
                                if(possibility.length === j){
                                    let flag = false;
                                    if(!hugeList[i][j][k].list[p].decomps){
                                        for (let q = 0; q < hugeList[i][j][k].list[p].config.length; q++) { 
                                            // if the config at list[p] at index q*times >= index q of the last possibility in the list's config*times, it will merge
                                            if (hugeList[i][j][k].list[p].config[q] === possibility[possibility.length -1].config[q] || hugeList[i][j][k].list[p].config[q]*hugeList[i][j][k].list[p].times === possibility[possibility.length - 1].config[q]*possibility[possibility.length - 1].times) {
                                                flag = true;
                                                break;
                                            }
                                        }
                                         
                                    }
                                    else{ // this is a 3-1 possibility: [[4,2,8,0], [0,0,0,2]]
                                        for(let q = 0; q < hugeList[i][j][k].list[p].decomps[0].length; q++){
                                            if(hugeList[i][j][k].list[p].decomps[0].config[q] === possibility[possibility.length -1].config[q] ||
                                                hugeList[i][j][k].list[p].decomps[0].config[q]*hugeList[i][j][k].list[p].decomps[0].times === possibility[possibility.length-1].config[q]*possibility[possibility.length-1].times ||
                                                hugeList[i][j][k].list[p].decomps[1].config[q] === possibility[possibility.length -1].config[q] ||
                                                hugeList[i][j][k].list[p].decomps[1].config[q]*hugeList[i][j][k].list[p].decomps[1].times === possibility[possibility.length-1].config[q]*possibility[possibility.length-1].times){
                                                    flag = true;
                                                    break;
                                                }
                                        }
                                    }
                                    if(!flag){
                                        possibility.push(hugeList[i][j][k].list[p]);
                                    } 
                                }
                               
                            });
                        }
                    }
                }
            }
            for (const poss of allPossibilities) {
                if (poss.length === arraySize) {
                    totalPossibilities.push({ rows: poss, mapping: mappings[i] });
                }
            }
        }
        console.log("These ones should have no vertical similar ones: " + JSON.stringify(totalPossibilities));
        return totalPossibilities;
    }
    /** 
     * - One of the end rows has to be made with 1 times
    * - The one before it has to be made with at most 2 times
    * - One before that n - m times where m is the row distance from the end row with 1 times
    * - if both of the ends are 1 times, check each consecutive one with the strictest
    **/
    rowsMakeable(noVertRows) {
        let notUp = false; // impossible to make the map and be sliding up 
        let notDown = false; // impossible to make the map and be sliding down
        let makeableRows = [];
        for (let i = 0; i < noVertRows.length; i++) {
            if (noVertRows[i].rows[0].times !== 1) {
                notDown = true;
            }
            if (noVertRows[i].rows[noVertRows[i].rows.length - 1].times !== 1) {
                notUp = true;
            }
            let flag = false;
            if (notUp && notDown) {
                flag = true;
            }

            if (!flag) {
                for (let j = 0; j < noVertRows[i].rows.length; j++) {
                    if (Math.log2(noVertRows[i].rows[j].times) + 1 > noVertRows[i].rows.length - j) {
                        notUp = true;
                    }
                    if (Math.log2(noVertRows[i].rows[j].times) + 1 > j + 1) {
                        notDown = true;
                    }
                    if(j < noVertRows[i].rows.length - 1){
                        if(!this.checkRowsMakeable(noVertRows[i].rows[j], noVertRows[i].rows[j+1])){
                            notDown = true;
                        }
                    }
                    if(j > 0){
                        if(!this.checkRowsMakeable(noVertRows[i].rows[j], noVertRows[i].rows[j-1])){
                            notUp = true;
                        }
                    }
                }

                let slideValue = -1;
                if (notUp && !notDown) {
                    slideValue = 2;
                }
                else if (!notUp && notDown) {
                    slideValue = 0;
                }
                else if (!notUp && !notDown) {
                    slideValue = 0; // default to sliding up
                }

                if (slideValue !== -1) {
                    makeableRows.push({ tileRows: noVertRows[i].rows, slide: slideValue, mapping: noVertRows[i].mapping });
                }
            }

        }
        console.log("makeable rows " + JSON.stringify(makeableRows));
        return makeableRows;
    }

    /**
     * Takes in two config/config+decomp objects and returns whether any current vals * times > next[i]*times
     * 
     * 
     * @param {{config: [], times: Number} || {config: [], times: Number, decomps: []}} current 
     * @param {{config: [], times: Number} || {config: [], times: Number, decomps: []}} next 
     * @returns True if none of the columns of the current * times is greater than that column position in next * times
     */
    checkRowsMakeable(current, next){
        // either could be a 3-1 or a regular one
        // only need to know to get the correct times for each number to be multiplied by
        // for that index, go to both lists and see which one has a value at that index and use that times
        let flag = false;
        for(let i = 0; i < current.config.length; i++){
            let currTimes = current.times;
            let nextTimes = next.times;
            if(current.decomp){
                if(current.decomp[0].config[i] !== 0){
                    currTimes = current.decomp[0].times;
                }
                else{
                    currTimes = current.decomp[1].times;
                }
            }
            if(next.decomp){
                if(next.decomp[0].config[i] !== 0){
                    nextTimes = next.decomp[0].times;
                }
                else{
                    nextTimes = next.decomp[1].times;
                }
            }

            // when times is greater than one, and times*config[i] >= next.config[i]*times
            if(current.config[i]*currTimes == next.config[i]*nextTimes){
                flag = true;
            }
        }
        return !flag;
    }
    // need to make a function that takes in the valid configurations that can be created on a board and translate them into sets of moves - 
    // Consisting of a move direction, and the value and spawn position of the next tile spawning in.
    // side note, I am making the move at the beginning of each row be a slide move, because that move doesn't really matter otherwise
    // 2 is going to be slide 2 and 3 is going to be slide 0
    //TODO lots of redundancy here
    rowsToMoves(makeableRowSets) {
        let finalMoveSets = [];
        for (const rowSet of makeableRowSets) {
            let moveSet = [];
            if (rowSet.slide == 0) {
                for (let i = 0; i < rowSet.tileRows.length; i++) {
                    if(rowSet.tileRows[i].decomps){
                        let d1 = this.configDecomps[this.inConfiguration(rowSet.tileRows[i].decomps[0].config)];
                        let d2 = this.configDecomps[this.inConfiguration(rowSet.tileRows[i].decomps[1].config)];
                        let nd1 = `3${d1[0][1]}${d2[0][2]}`
                        let nd2 = `3${d2[0][1]}${d2[0][2]}`
                        d1[0] = nd1;
                        d2[0] = nd2;
                        if(moveSet.length < 1){
                            moveSet = [d1];
                            for(let j = 0; j < rowSet.tileRows[i].decomps[1].times; j++){
                                moveSet = moveSet.concat(d2);
                            }
                            for(let j = 1; j < rowSet.tileRows[i].decomps[0].times; j++){
                                moveSet = moveSet.concat(d1);
                            }
                        }
                        else{
                            moveSet = moveSet.concat(d1);
                            for(let j = 0; j < rowSet.tileRows[i].decomps[1].times; j++){
                                moveSet = moveSet.concat(d2);
                            }
                            for(let j = 1; j < rowSet.tileRows[i].decomps[0].times; j++){
                                moveSet = moveSet.concat(d1);
                            }
                            console.log(moveSet);
                        }
                    }
                    else{
                        for (let j = 0; j < rowSet.tileRows[i].times; j++) {
                            //console.log(rowSet.tileRows[i]);
                            let decomp = this.configDecomps[this.inConfiguration(rowSet.tileRows[i].config)]
                            let newFirstDecomp = `3${decomp[0][1]}${decomp[0][2]}`
                            decomp[0] = newFirstDecomp;
                            if(moveSet.length < 1){
                                moveSet = decomp;
                            }
                            else{
                                moveSet = moveSet.concat(decomp)
                            } 
                        } 
                    }
                }
            }
            else if (rowSet.slide == 2) {
                for (let i = rowSet.tileRows.length - 1; i >= 0; i--) {
                    if(rowSet.tileRows[i].decomps){
                        let d1 = this.configDecomps[this.inConfiguration(rowSet.tileRows[i].decomps[0].config)];
                        let d2 = this.configDecomps[this.inConfiguration(rowSet.tileRows[i].decomps[1].config)];
                        let nd1 = `2${d1[0][1]}${d2[0][2]}`
                        let nd2 = `2${d2[0][1]}${d2[0][2]}`
                        d1[0] = nd1;
                        d2[0] = nd2;
                        if(moveSet.length < 1){
                            moveSet = [d1];
                            for(let j = 0; j < rowSet.tileRows[i].decomps[1].times; j++){
                                moveSet = moveSet.concat(d2);
                            }
                            for(let j = 1; j < rowSet.tileRows[i].decomps[0].times; j++){
                                moveSet = moveSet.concat(d1);
                            }
                        }
                        else{
                            moveSet = moveSet.concat(d1);
                            for(let j = 0; j < rowSet.tileRows[i].decomps[1].times; j++){
                                moveSet = moveSet.concat(d2);
                            }
                            for(let j = 1; j < rowSet.tileRows[i].decomps[0].times; j++){
                                moveSet = moveSet.concat(d1);
                            }
                            console.log(moveSet);
                        }
                    }
                    for (let j = 0; j < rowSet.tileRows[i].times; j++) {
                        //console.log(rowSet.tileRows[i]);
                        let decomp = this.configDecomps[this.inConfiguration(rowSet.tileRows[i].config)];
                        let newFirstDecomp = `2${decomp[0][1]}${decomp[0][2]}`
                        decomp[0] = newFirstDecomp;
                        if(moveSet.length < 1){
                            moveSet = decomp;
                        }
                        else{
                            moveSet = moveSet.concat(decomp)
                        } 
                    }
                }
            }
            finalMoveSets.push({ moves: moveSet, slide: rowSet.slide, mapping: rowSet.mapping });
        }
        console.log(JSON.stringify(finalMoveSets));
        return finalMoveSets;
    }

    // Translates [{moves: moveSet, slide: slide: mapping: mapping}] into
    // [[{move: #, value: #, position: String}, {move: #, value: #, position: String} ... ] ... ]
    movesToObjects(moveSets) {
        let totalList = [];
        for(const set of moveSets){
            let objectList = [];
            let height = set.slide === 0 ? "b" : "t";
            console.log()
            for(let i = 0; i < set.moves.length; i++){
                let move = 3;
                if(set.moves[i][0] === '0') move = 1;
                else if(set.moves[i][0] === '2') move = 2;
                else if(set.moves[i][0] === '3') move = 0;
                let val = 2;
                if(set.moves[i][1] === '1') val = 4; 
                let pos = height + "LR"
                if(set.moves[i][2] === '0') pos = height + "RR";
                objectList.push({move: move, value: val, position: pos})
            }
            totalList.push({moves: objectList, mapping: set.mapping});
        }
        console.log(JSON.stringify(totalList));
        return totalList;
    }
    /**
     * This function takes in a mapping of tile values in an nxn board, and checks
     *
     * @param {Number[][]} valueMap
     */
    checkValidMapping(valueMap) {
        let flag = false;
        for (let i = 0; i < valueMap.length - 1; i++) {
            for (let j = 0; j < valueMap[i].length; j++) {
                if (valueMap[i][j] === valueMap[i + 1][j]) {
                    flag = true;
                    break;
                }
            }
            if (flag) break;
        }
        return !flag;
    }
    mapValues(values, map) {
        let nMap = [];
        for (let i = 0; i < map.length; i++) {
            nMap.push(map[i].slice());
        }
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[i].length; j++) {
                nMap[i][j] = values[map[i][j]];
            }
        }
        console.log(JSON.stringify(nMap));
        return nMap;
    }
    /**
     * This function takes in a row and returns true if there are adjacent values that are the same in the given array and false otherwise
     *
     * @param {[Number]} row row of number values
     *
     * @returns truth value of whether there are adjacent values that are the same in the given array
     */
    adjacentVals(row) {
        let flag = false;
        for (let i = 1; i < row.length - 1; i++) {
            if (row[i - 1] === row[i] || row[i + 1] === row[i]) {
                flag = true;
            }
        }
        return flag;
    }
    allPermutations(items) {
        // allPermutations () : return a list of all possible permutations
        // credits: https://stackoverflow.com/questions/9960908/permutations-in-javascript
        let results = [];
        function permute(arr, memo) {
            var cur, memo = memo || [];
            for (let i = 0; i < arr.length; i++) {
                cur = arr.splice(i, 1);
                if (arr.length === 0) {
                    results.push(memo.concat(cur));
                }
                permute(arr.slice(), memo.concat(cur));
                arr.splice(i, 0, cur[0]);
            }
            return results;
        }
        permute(items);
        return results;
    }
    // OpenAI. (2024, January 10). How to Create a Program for Combinations and Set Splitting. Conversation with ChatGPT on OpenAI platform. Retrieved from [https://chat.openai.com/c/2cb119e1-3706-4c8d-8e17-fcd9c1fe103c]
    getCombinations(arr, m) {
        const result = [];

        function combine(startIndex, currentCombo) {
            if (currentCombo.length === m) {
                result.push([...currentCombo]);
                return;
            }

            for (let i = startIndex; i < arr.length; i++) {
                currentCombo.push(arr[i]);
                combine(i + 1, currentCombo);
                currentCombo.pop();
            }
        }

        combine(0, []);

        return result;
    }

    printConfigsAndDecomps(){
        for(let i = 0; i < this.configurations.length; i++){
            console.log(`config ${this.configurations[i]}`)
            console.log(`decomp: ${this.configDecomps[i]}\n`);
        }
    }
}
 
