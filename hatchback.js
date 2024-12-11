// Angel 2024
// ts is still in beta LMFAO so like don't expect it to be good

const fs = require("fs");

// create memory bank
var RAM = Array(65535).fill(0);
// this is NOT efficient at all LMFAOOO

// 0000 - 00FE is for byte storage ("ByRAM")
// 00FF - FEFF is for the program  ("ProgRAM")
// FF00 - FFFF is for the interpreter ("IntMEM")

// most integers in the interpreter will be using IntMEM for variable storage (yay)
// this can be used for ACE (something intentional)

// IntMEM values:

// 00: basic incrementer
// 01: file incrementer
// 02: current instruction
const file = fs.readFileSync(process.argv[2], "utf8").split(/\s/g);


// make sure the program is small enough to fit in (it will be lol)
if (file.length + 255 >= 65280) {
    throwError(0);
}

// write file to "ProgRAM" (00FF - FF00)
for (simv(0x00, 0); gimv(0x00) < file.length; simv(0x00, gimv(0x00) + 1)) {
    RAM[gimv(0x00) + 255] = parseInt(file[gimv(0x00)]);
}

//console.log(RAM)

// you can use "0 65281 N" to move to a location 
// you have to do ACE to go to other places in memory LMAOOO


for (simv(0x01, 0); RAM[gimv(0x01) + 255] != 0xFFFF; simv(0x01, gimv(0x01) + 1)) {
    if (RAM.length > 65535) {
        throwError(2); // RAM can not exceed 0xFFFF
        // this doesn't HAVE to exist but its an esoteric language, i can do whatever the hell I want!!
    }

    // DO NOT get mad at me for not using a switch case for this.
    // switch cases r really fucking annoying in javascript so leave me alone lol

    simv(0x02, RAM[gimv(0x01) + 255]) //current instruction
    // simv(0x03,RAM[gimv(0x01)+255+N]) is to get the next N instructions
    if (gimv(0x02) == 0) { // a: SET PLACE IN RAM
        // required arguments: 2 (position and value)
        simv(0x03, RAM[gimv(0x01) + 256]) //position
        simv(0x04, RAM[gimv(0x01) + 257]) //value
        RAM[gimv(0x03)] = gimv(0x04) // set value in memory

        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x01, gimv(0x01) + 2) // skip arguments at the end
        continue
    }
    if (gimv(0x02) == 1) { // b: OUTPUT
        // required argument: 1 (position in memory)
        console.log(RAM[RAM[gimv(0x01) + 256]])
        simv(0x01, gimv(0x01) + 1);
        continue
    }
    if (gimv(0x02) == 2) { // c: ADD 2 PLACES TOGETHER
        // required arguments: 2 (assigner and howMuch)
        simv(0x03, RAM[gimv(0x01) + 256]) //assigner
        simv(0x04, RAM[gimv(0x01) + 257]) //howMuch
        RAM[gimv(0x03)] += RAM[gimv(0x04)]

        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x01, gimv(0x01) + 2) // skip arguments at the end
        continue;
    }
    if (gimv(0x02) == 3) { // d: SUBTRACT 2 PLACES
        // required arguments: 2 (assigner and howMuch)
        simv(0x03, RAM[gimv(0x01) + 256]) //assigner
        simv(0x04, RAM[gimv(0x01) + 257]) //howMuch
        RAM[gimv(0x03)] -= RAM[gimv(0x04)]

        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x01, gimv(0x01) + 2) // skip arguments at the end
        continue;
    }
    if (gimv(0x02) == 4) { // e: MULTIPLY 2 PLACES TOGETHER
        // required arguments: 2 (assigner and howMuch)
        simv(0x03, RAM[gimv(0x01) + 256]) //assigner
        simv(0x04, RAM[gimv(0x01) + 257]) //howMuch
        RAM[gimv(0x03)] *= RAM[gimv(0x04)]

        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x01, gimv(0x01) + 2) // skip arguments at the end
        continue;
    }
    if (gimv(0x02) == 5) { // f: DIVIDE 2 PLACES TOGETHER
        // required arguments: 2 (assigner and howMuch)
        simv(0x03, RAM[gimv(0x01) + 256]) //assigner
        simv(0x04, RAM[gimv(0x01) + 257]) //howMuch
        if (RAM[gimv(0x04)] == 0) {
            throwError(1);
        }
        RAM[gimv(0x03)] /= RAM[gimv(0x04)]

        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x01, gimv(0x01) + 2) // skip arguments at the end
        continue;
    }

    if (gimv(0x02) == 6) { // BOOLEAN ASSIGNMENT
        // required arguments: 3 (bool, position and value)
        simv(0x03, RAM[gimv(0x01) + 256]) //bool
        simv(0x04, RAM[gimv(0x01) + 257]) //position
        simv(0x05, RAM[gimv(0x01) + 258]) //value
        if (RAM[gimv(0x03)] != 0) {
            RAM[gimv(0x04)] = gimv(0x05) // set value in memory
        }
        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x05, 0);
        simv(0x01, gimv(0x01) + 3) // skip arguments at the end
        continue
    }
    if (gimv(0x02) == 7) { // f: GREATER-THAN ASSIGNMENT OPERATION 
        // required arguments: 2 (assigner and howMuch)
        simv(0x03, RAM[gimv(0x01) + 256]) //assigner
        simv(0x04, RAM[gimv(0x01) + 257]) //howMuch
        if (RAM[gimv(0x04)] == 0) {
            throwError(1);
        }
        RAM[gimv(0x03)] = (RAM[gimv(0x03)] > RAM[gimv(0x04)]) ? 1 : 0;

        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x01, gimv(0x01) + 2) // skip arguments at the end
        continue;
    }
    if (gimv(0x02) == 8) { // f: EQUAL-TO ASSIGNMENT OPERATION 
        // required arguments: 2 (assigner and howMuch)
        simv(0x03, RAM[gimv(0x01) + 256]) //assigner
        simv(0x04, RAM[gimv(0x01) + 257]) //howMuch
        if (RAM[gimv(0x04)] == 0) {
            throwError(1);
        }
        RAM[gimv(0x03)] = (RAM[gimv(0x03)] == RAM[gimv(0x04)]) ? 1 : 0;

        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x01, gimv(0x01) + 2) // skip arguments at the end
        continue;
    }
    if (gimv(0x02) == 9) { // f: LESSER-THAN ASSIGNMENT OPERATION 
        // required arguments: 2 (assigner and howMuch)
        simv(0x03, RAM[gimv(0x01) + 256]) //assigner
        simv(0x04, RAM[gimv(0x01) + 257]) //howMuch
        if (RAM[gimv(0x04)] == 0) {
            throwError(1);
        }
        RAM[gimv(0x03)] = (RAM[gimv(0x03)] < RAM[gimv(0x04)]) ? 1 : 0;

        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x01, gimv(0x01) + 2) // skip arguments at the end
        continue;
    }
    if (gimv(0x02) == 10) { // a: COPY
        // required arguments: 2 (position and value)
        simv(0x03, RAM[gimv(0x01) + 256]) //position
        simv(0x04, RAM[gimv(0x01) + 257]) //value
        RAM[gimv(0x03)] = RAM[gimv(0x04)] // set value in memory

        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x01, gimv(0x01) + 2) // skip arguments at the end
        continue
    }
    if (gimv(0x02) == 11) { // a: VARIABLE-DRIVEN COPY
        // required arguments: 2 (position and value)
        simv(0x03, RAM[gimv(0x01) + 256]) //position
        simv(0x04, RAM[gimv(0x01) + 257]) //value
        RAM[gimv(0x03)] = RAM[RAM[gimv(0x04)]] // set value in memory

        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x01, gimv(0x01) + 2) // skip arguments at the end
        continue
    }
    if (gimv(0x02) == 12) { // b: INLINE OUTPUT
        // required argument: 1 (position in memory)
        process.stdout.write(RAM[RAM[gimv(0x01) + 256]].toString())
        simv(0x01, gimv(0x01) + 1);
        continue
    }
    if (gimv(0x02) == 13) { // b: INLINE OUTPUT FROM CHAR
        // required argument: 1 (position in memory)
        process.stdout.write(String.fromCharCode(RAM[RAM[gimv(0x01) + 256]]))
        simv(0x01, gimv(0x01) + 1);
        continue
    }
    if (gimv(0x02) == 14) { // f: NOT-EQUAL-TO ASSIGNMENT OPERATION 
        // required arguments: 2 (assigner and howMuch)
        simv(0x03, RAM[gimv(0x01) + 256]) //assigner
        simv(0x04, RAM[gimv(0x01) + 257]) //howMuch
        if (RAM[gimv(0x04)] == 0) {
            throwError(1);
        }
        RAM[gimv(0x03)] = (RAM[gimv(0x03)] != RAM[gimv(0x04)]) ? 1 : 0;

        simv(0x03, 0); // clear 
        simv(0x04, 0);
        simv(0x01, gimv(0x01) + 2) // skip arguments at the end
        continue;
    }


}

//console.log(RAM)


function throwError(errorCode) {
    console.log("An error occured.\n\nReason: " + [
        "Program is too large.",
        "Divide by 0.",
        "Tried to access RAM out of range"
    ][errorCode]);
    process.exit();
}
function gimv(hex) { // retrieve IntMEM value
    return RAM[hex + 0xFF00];
}
function simv(hex, value) { // set IntMEM value
    return RAM[hex + 0xFF00] = value;
}