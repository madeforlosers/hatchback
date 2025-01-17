// Angel 2024
// ts is still in beta LMFAO so like don't expect it to be good

const fs = require("fs");
const prompt = require("prompt-sync")();

// create memory bank
var RAM = new Uint32Array(65535);
// this is NOT efficient at all LMFAOOO

// each address in RAM is 24 bits, max is 0xFFFFFF (16777215)

// 0000 - 00FE is for program storage ("ByRAM")
// 00FF - FEFF is for the program  ("ProgRAM")
// FF00 - FFFF is for the interpreter ("IntMEM")

// most integers in the interpreter will be using IntMEM for variable storage (yay)
// this can be used for ACE (something intentional)

// IntMEM values:

// 00: basic incrementer
// 01: file incrementer
// 02: current instruction
const file = fs.readFileSync(process.argv[2], "utf8").split(/\s/g);


// Ensure the program is small enough to fit in (it will be lol)
if (file.length + 255 >= 65280) throwError(0);

// write file to "ProgRAM" (00FF - FF00)
for (simv(0x00, 0); gimv(0x00) < file.length; simv(0x00, gimv(0x00) + 1)) {
    RAM[gimv(0x00) + 255] = parseInt(file[gimv(0x00)]);
    if (isNaN(RAM[gimv(0x00) + 255]))
        throwError(5, (gimv(0x00) + 255).toString(16).toUpperCase());
}

//console.log(RAM)

// you can use "0 65281 N" to move to a location 
// you have to do ACE to go to other places in memory LMAOOO

/* Operations */
// (thanks mykal for cleaning this up)

// todo: comment these better
function setPlaceInRamCommand() {
    setRAMaddr(gimv(0x03), gimv(0x04));// set value in memory
    simv(0x03, 0); // clear arguments (gotta make a function to do this, or just not clear them at all
    simv(0x04, 0); //                  because they get overwritten anyways LMAO)
    simv(0x01, gimv(0x01) + 2); // skip arguments at the end
}

function outputNewlineCommand() {
    console.log(RAM[RAM[gimv(0x01) + 256]]);
    simv(0x01, gimv(0x01) + 1);
}

function additionCommand() {
    setRAMaddr(gimv(0x03), RAM[gimv(0x03)] + RAM[gimv(0x04)]);
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // skip arguments at the end
}

function subtractionCommand() {
    setRAMaddr(gimv(0x03), RAM[gimv(0x03)] - RAM[gimv(0x04)]);
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // skip arguments at the end
}

function multiplicationCommand() {
    setRAMaddr(gimv(0x03), RAM[gimv(0x03)] * RAM[gimv(0x04)]);
    simv(0x03, 0); // Clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // Skip arguments at the end
}

function divisionCommand() {
    if (RAM[gimv(0x04)] == 0) throwError(1);
    setRAMaddr(gimv(0x03), RAM[gimv(0x03)] / RAM[gimv(0x04)]);
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // Skip arguments at the end
}

function modulusCommand() {
    setRAMaddr(gimv(0x03), RAM[gimv(0x03)] % RAM[gimv(0x04)]);
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // skip arguments at the end
}

function booleanCommand() {
    if (RAM[gimv(0x03)] != 0) setRAMaddr(gimv(0x04), gimv(0x05));
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x05, 0);
    simv(0x01, gimv(0x01) + 3); // skip arguments at the end
}

function greaterThanCommand() {
    if (RAM[gimv(0x04)] == 0) throwError(1);
    setRAMaddr(gimv(0x03), RAM[gimv(0x03)] > RAM[gimv(0x04)] ? 1 : 0);
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // skip arguments at the end
}

function equalToCommand() {
    if (RAM[gimv(0x04)] == 0) throwError(1);
    setRAMaddr(gimv(0x03), RAM[gimv(0x03)] == RAM[gimv(0x04)] ? 1 : 0);
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // skip arguments at the end
}

function lessThanCommand() {
    if (RAM[gimv(0x04)] == 0) throwError(1);
    setRAMaddr(gimv(0x03), RAM[gimv(0x03)] < RAM[gimv(0x04)] ? 1 : 0);
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // Skip arguments at the end
}

function copyCommand() {
    setRAMaddr(gimv(0x03), RAM[gimv(0x04)]);
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // Skip arguments at the end
}

function variableDrivenCopyCommand() {
    setRAMaddr(gimv(0x03), RAM[RAM[gimv(0x04)]]);
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // Skip arguments at the end
}

function inlineOutputCommand() {
    process.stdout.write(RAM[RAM[gimv(0x01) + 256]].toString());
    simv(0x01, gimv(0x01) + 1);
}

function inlineOutputFromCharCommand() {
    process.stdout.write(String.fromCharCode(RAM[RAM[gimv(0x01) + 256]]));
    simv(0x01, gimv(0x01) + 1);
}

function notEqualToCommand() {
    if (RAM[gimv(0x04)] == 0) throwError(1);
    setRAMaddr(gimv(0x03), RAM[gimv(0x03)] != RAM[gimv(0x04)] ? 1 : 0);
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // skip arguments at the end
}

function inputCommand() {
    setRAMaddr(gimv(0x03), parseInt(prompt(">")));// set value in memory
    if (isNaN(RAM[gimv(0x03)])); // if it's NaN, error
        throwError(5, (gimv(0x03)).toString(16).toUpperCase());
    simv(0x03, 0); // clear 
    simv(0x01, gimv(0x01) + 1); // skip arguments at the end
}
function reverseSubtractionCommand() {
    setRAMaddr(gimv(0x03), RAM[gimv(0x04)] - RAM[gimv(0x03)]);
    // what's really annoying is that I can't just swap the arguments and run subtractionCommand();
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // skip arguments at the end
}
function reverseDivisionCommand() {
    setRAMaddr(gimv(0x03), RAM[gimv(0x04)] / RAM[gimv(0x03)]);
    simv(0x03, 0); // clear 
    simv(0x04, 0);
    simv(0x01, gimv(0x01) + 2); // skip arguments at the end
}
for (simv(0x01, 0); RAM[gimv(0x01) + 255] != 0xFFFF; simv(0x01, gimv(0x01) + 1)) {
    if (RAM.length > 65535) throwError(2); // RAM can not exceed 0xFFFF
    // this doesn't HAVE to exist but its an esoteric language, i can do whatever the hell I want!!


    // finally used a switch case lol

    simv(0x02, RAM[gimv(0x01) + 255]); //current instruction
    // simv(0x03,RAM[gimv(0x01)+255+N]) is to get the next N instructions

    switch (gimv(0x02)) {
        case 0: // a: SET PLACE IN RAM
            initializeArguments(2);
            setPlaceInRamCommand();
            break;
        case 1: // b: OUTPUT
            initializeArguments(1);
            outputNewlineCommand();
            break;
        case 2:// c: ADDITION ASSIGNMENT
            initializeArguments(2);
            additionCommand();
            break;
        case 3: // d: SUBTRACTION ASSIGNMENT
            initializeArguments(2);
            subtractionCommand();
            break;
        case 4: // e: MULTIPLICATION ASSIGNMENT
            initializeArguments(2);
            multiplicationCommand();
            break;
        case 5: // f: DIVISION ASSIGNMENT
            initializeArguments(2);
            divisionCommand();
            break;
        case 6: // BOOLEAN ASSIGNMENT
            initializeArguments(3);
            booleanCommand();
            break;
        case 7: // GREATER-THAN ASSIGNMENT OPERATION 
            initializeArguments(2);
            greaterThanCommand();
            break;
        case 8: // EQUAL-TO ASSIGNMENT OPERATION 
            initializeArguments(2);
            equalToCommand();
            break;
        case 9: // LESSER-THAN ASSIGNMENT OPERATION 
            initializeArguments(2);
            lessThanCommand();
            break;
        case 10: // COPY
            initializeArguments(2);
            copyCommand();
            break;
        case 11: // VARIABLE-DRIVEN COPY
            initializeArguments(2);
            variableDrivenCopyCommand();
            break;
        case 12: // INLINE OUTPUT
            // 12 and 13 don't need the arguments lol
            inlineOutputCommand();
            break;
        case 13: // INLINE OUTPUT FROM CHAR
            inlineOutputFromCharCommand();
            break;
        case 14: // NOT-EQUAL-TO ASSIGNMENT OPERATION 
            initializeArguments(2);
            notEqualToCommand();
            break;
        case 15: // MODULO
            initializeArguments(1);
            modulusCommand();
            break;
        case 16: // PROMPT INPUT
            initializeArguments(1);
            inputCommand();
            break;
        case 17: // REVERSE SUBTRACTION
            initializeArguments(2);
            reverseSubtractionCommand(); // hopefully this works
            break;
        case 18: // REVERSE DIVISION
            initializeArguments(2);
            reverseDivisionCommand();
            break;
    }
}

//console.log(RAM)


function throwError(errorCode, addrTemp = "[Not Specified.]") {
    ByRAMaddr = addrTemp;
    if (addrTemp != "[Not Specified.]")
        ByRAMaddr = "0".repeat(4 - addrTemp.length) + addrTemp;
    try {
        console.log("An error occured.\n\nReason: " + [
            `Program is too large.`,
            `Divide by 0.`,
            `Tried to access RAM out of range`,
            `Value overflow at $${ByRAMaddr}.`,
            `Value underflow at $${ByRAMaddr}.`,
            `Invalid value at $${ByRAMaddr}.`,
        ][errorCode] + `\n\nError originated at the instruction at address $${"0".repeat(4 - (gimv(0x01) + 255).toString(16).length) + (gimv(0x01) + 255).toString(16)}.`);
    }
    catch (e) {
        console.log("There was an error outputting the error message (lolz). The code is " + errorCode + " and the address in offense is " + (gimv(0x02)))
    }
    process.exit();
}

function initializeArguments(amount) {
    for (simv(0x00, 0); gimv(0x00) < amount; simv(0x00, gimv(0x00) + 1)) { // loop to get certain amount of arguments for command
        simv(gimv(0x00) + 3, RAM[gimv(0x01) + 256 + gimv(0x00)]); // set $FF03+[$FF00] to argument for command
        // console.log( RAM[gimv(0x01) + 256+gimv(0x00)]) debug lol
    }

    // this looks really complicated but it works i guess
}

// i'll make these into a class one day. I gotta get mykal to help me with it though

function setRAMaddr(hex, value) {
    if (hex > 0xFFFF)
        throwError(2, hex.toString(16));
    if (value > 0xFFFFFF)
        throwError(3, hex.toString(16));
    if (value < 0)
        throwError(4, hex.toString(16));
    if (hex == undefined)
        throwError(5, gimv(0x01));
    return RAM[hex] = value;
}

function gimv(hex) { // get IntMEM value
    if (RAM[hex + 0xFF00] == undefined) {
        throwError(5, (gimv(0x01) + 255).toString(16));
    }
    return RAM[hex + 0xFF00];
}

function simv(hex, value) { // set IntMEM value
    return setRAMaddr(hex + 0xFF00, value);
}