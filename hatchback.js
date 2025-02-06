// Angel 2025
// ts is still in beta LMFAO so like don't expect it to be good

// class-ified by A
// still requires some looking over but it works for now

const fs = require("fs");
const prompt = require("prompt-sync")();

class RAM { // static class
    static RAMBlock = new Uint32Array(65535);
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
    static set = {
        address(hex, value) {
            if (hex > 0xFFFF)
                Hatchback.throwError(2);
            if (value > 0xFFFFFF)
                Hatchback.throwError(3, hex.toString(16));
            if (value < 0)
                Hatchback.throwError(4, hex.toString(16));
            if (hex == undefined)
                Hatchback.throwError(5, RAM.get.intMEM(0x01));
            return RAM.RAMBlock[hex] = value;
        },
        intMEM(hex, value) {
            return this.address(hex + 0xFF00, value);
        }
    }
    static get = {
        intMEM(hex) {
            if (RAM.RAMBlock[hex + 0xFF00] == undefined) {
                Hatchback.throwError(5, (RAM.get.intMEM(0x01) + 255).toString(16));
            }
            return RAM.RAMBlock[hex + 0xFF00];
        }
    }
}
class Hatchback {

    constructor() {
        this.loadProgram();
        this.writeToProgRAM();
        this.runProgram();
    };

    loadProgram() {
        this.file = fs.readFileSync(process.argv[2], "utf8").split(/\s/g);
        // Ensure the program is small enough to fit in (it will be lol)
        if (this.file.length + 255 >= 65280) Hatchback.throwError(0);
    };
    writeToProgRAM(){
        // write file to "ProgRAM" (00FF - FF00)
        for (RAM.set.intMEM(0x00, 0); RAM.get.intMEM(0x00) < this.file.length; RAM.set.intMEM(0x00, RAM.get.intMEM(0x00) + 1)) {
            RAM.RAMBlock[RAM.get.intMEM(0x00) + 255] = parseInt(this.file[RAM.get.intMEM(0x00)]);
            if (isNaN(RAM.RAMBlock[RAM.get.intMEM(0x00) + 255]))
                Hatchback.throwError(5, (RAM.get.intMEM(0x00) + 255).toString(16).toUpperCase());
        }
        // you can use "0 65281 N" to move to a location 
        // you have to do ACE to go to other places in memory LMAOOO
    };

    runProgram() {
        for (RAM.set.intMEM(0x01, 0); RAM.RAMBlock[RAM.get.intMEM(0x01) + 255] != 0xFFFF; RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 1)) {
            if (RAM.RAMBlock.length > 65535) Hatchback.throwError(2); // RAM can not exceed 0xFFFF
            // this doesn't HAVE to exist but its an esoteric language, i can do whatever the hell I want!!


            // finally used a switch case lol

            RAM.set.intMEM(0x02, RAM.RAMBlock[RAM.get.intMEM(0x01) + 255]); //current instruction
            // RAM.set.intMEM(0x03,RAM.RAMBlock[RAM.get.intMEM(0x01)+255+N]) is to get the next N instructions

            switch (RAM.get.intMEM(0x02)) {
                case 0: // a: SET PLACE IN RAM
                    this.initializeArguments(2);
                    this.commands.setPlaceInRamCommand();
                    break;
                case 1: // b: OUTPUT
                    this.initializeArguments(1);
                    this.commands.outputNewlineCommand();
                    break;
                case 2:// c: ADDITION ASSIGNMENT
                    this.initializeArguments(2);
                    this.commands.additionCommand();
                    break;
                case 3: // d: SUBTRACTION ASSIGNMENT
                    this.initializeArguments(2);
                    this.commands.subtractionCommand();
                    break;
                case 4: // e: MULTIPLICATION ASSIGNMENT
                    this.initializeArguments(2);
                    this.commands.multiplicationCommand();
                    break;
                case 5: // f: DIVISION ASSIGNMENT
                    this.initializeArguments(2);
                    this.commands.divisionCommand();
                    break;
                case 6: // BOOLEAN ASSIGNMENT
                    this.initializeArguments(3);
                    this.commands.booleanCommand();
                    break;
                case 7: // GREATER-THAN ASSIGNMENT OPERATION 
                    this.initializeArguments(2);
                    this.commands.greaterThanCommand();
                    break;
                case 8: // EQUAL-TO ASSIGNMENT OPERATION 
                    this.initializeArguments(2);
                    this.commands.equalToCommand();
                    break;
                case 9: // LESSER-THAN ASSIGNMENT OPERATION 
                    this.initializeArguments(2);
                    this.commands.lessThanCommand();
                    break;
                case 10: // COPY
                    this.initializeArguments(2);
                    this.commands.copyCommand();
                    break;
                case 11: // VARIABLE-DRIVEN COPY
                    this.initializeArguments(2);
                    this.commands.variableDrivenCopyCommand();
                    break;
                case 12: // INLINE OUTPUT
                    // 12 and 13 don't need the arguments lol
                    this.commands.inlineOutputCommand();
                    break;
                case 13: // INLINE OUTPUT FROM CHAR
                    this.commands.inlineOutputFromCharCommand();
                    break;
                case 14: // NOT-EQUAL-TO ASSIGNMENT OPERATION 
                    this.initializeArguments(2);
                    this.commands.notEqualToCommand();
                    break;
                case 15: // MODULO
                    this.initializeArguments(2);
                    this.commands.modulusCommand();
                    break;
                case 16: // PROMPT INPUT
                    this.initializeArguments(1);
                    this.commands.inputCommand();
                    break;
                case 17: // REVERSE SUBTRACTION
                    this.initializeArguments(2);
                    this.commands.reverseSubtractionCommand(); // hopefully this works
                    break;
                case 18: // REVERSE DIVISION
                    this.initializeArguments(2);
                    this.commands.reverseDivisionCommand();
                    break;
            }
        }
    }

    /* Operations */
    commands = {
        setPlaceInRamCommand() {
            RAM.set.address(RAM.get.intMEM(0x03), RAM.get.intMEM(0x04));// set value in memory
            RAM.set.intMEM(0x03, 0); // clear arguments (gotta make a function to do this, or just not clear them at all
            RAM.set.intMEM(0x04, 0); //                  because they get overwritten anyways LMAO)
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // skip arguments at the end
        },
        outputNewlineCommand() {
            console.log(RAM.RAMBlock[RAM.RAMBlock[RAM.get.intMEM(0x01) + 256]]);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 1);
        },
        additionCommand() {
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x03)] + RAM.RAMBlock[RAM.get.intMEM(0x04)]);
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // skip arguments at the end
        },
        subtractionCommand() {
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x03)] - RAM.RAMBlock[RAM.get.intMEM(0x04)]);
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // skip arguments at the end
        },
        multiplicationCommand() {
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x03)] * RAM.RAMBlock[RAM.get.intMEM(0x04)]);
            RAM.set.intMEM(0x03, 0); // Clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // Skip arguments at the end
        },
        divisionCommand() {
            if (RAM.RAMBlock[RAM.get.intMEM(0x04)] == 0) Hatchback.throwError(1);
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x03)] / RAM.RAMBlock[RAM.get.intMEM(0x04)]);
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // Skip arguments at the end
        },
        modulusCommand() {
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x03)] % RAM.RAMBlock[RAM.get.intMEM(0x04)]);
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // skip arguments at the end
        },
        booleanCommand() {
            if (RAM.RAMBlock[RAM.get.intMEM(0x03)] != 0) RAM.set.address(RAM.get.intMEM(0x04), RAM.get.intMEM(0x05));
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x05, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 3); // skip arguments at the end
        },
        greaterThanCommand() {
           // if (RAM.RAMBlock[RAM.get.intMEM(0x04)] == 0) Hatchback.throwError(1);
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x03)] > RAM.RAMBlock[RAM.get.intMEM(0x04)] ? 1 : 0);
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // skip arguments at the end
        },
        equalToCommand() {
           // if (RAM.RAMBlock[RAM.get.intMEM(0x04)] == 0) Hatchback.throwError(1);
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x03)] == RAM.RAMBlock[RAM.get.intMEM(0x04)] ? 1 : 0);
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // skip arguments at the end
        },
        lessThanCommand() {
           // if (RAM.RAMBlock[RAM.get.intMEM(0x04)] == 0) Hatchback.throwError(1);
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x03)] < RAM.RAMBlock[RAM.get.intMEM(0x04)] ? 1 : 0);
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // Skip arguments at the end
        },
        copyCommand() {
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x04)]);
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // Skip arguments at the end
        },
        variableDrivenCopyCommand() {
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.RAMBlock[RAM.get.intMEM(0x04)]]);
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // Skip arguments at the end
        },
        inlineOutputCommand() {
            process.stdout.write(RAM.RAMBlock[RAM.RAMBlock[RAM.get.intMEM(0x01) + 256]].toString());
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 1);
        },
        inlineOutputFromCharCommand() {
            process.stdout.write(String.fromCharCode(RAM.RAMBlock[RAM.RAMBlock[RAM.get.intMEM(0x01) + 256]]));
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 1);
        },
        notEqualToCommand() {
           // if (RAM.RAMBlock[RAM.get.intMEM(0x04)] == 0) Hatchback.throwError(1);
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x03)] != RAM.RAMBlock[RAM.get.intMEM(0x04)] ? 1 : 0);
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // skip arguments at the end
        },
        inputCommand() {
            RAM.set.address(RAM.get.intMEM(0x03), parseInt(prompt(">")));// set value in memory
            if (isNaN(RAM.RAMBlock[RAM.get.intMEM(0x03)])){ // if it's NaN, error
                Hatchback.throwError(5, (RAM.get.intMEM(0x03)).toString(16).toUpperCase());
            }
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 1); // skip arguments at the end
        },
        reverseSubtractionCommand() {
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x04)] - RAM.RAMBlock[RAM.get.intMEM(0x03)]);
            // what's really annoying is that I can't just swap the arguments and run subtractionCommand();
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // skip arguments at the end
        },
        reverseDivisionCommand() {
            RAM.set.address(RAM.get.intMEM(0x03), RAM.RAMBlock[RAM.get.intMEM(0x04)] / RAM.RAMBlock[RAM.get.intMEM(0x03)]);
            RAM.set.intMEM(0x03, 0); // clear 
            RAM.set.intMEM(0x04, 0);
            RAM.set.intMEM(0x01, RAM.get.intMEM(0x01) + 2); // skip arguments at the end
        },
    }

    static throwError(errorCode, addrTemp = "[Not Specified.]") {
        let ByRAMaddr = addrTemp;
        if (addrTemp != "[Not Specified.]") {
            ByRAMaddr = "0".repeat(4 - addrTemp.length) + addrTemp;
        }
        try {
            console.log("An error occured.\n\nReason: " + [
                `Program is too large.`,
                `Divide by 0.`,
                `Tried to access RAM out of range`,
                `Value overflow at $${ByRAMaddr}.`,
                `Value underflow at $${ByRAMaddr}.`,
                `Invalid value at $${ByRAMaddr}.`,
            ][errorCode] + `\n\nError originated at the instruction at address $${"0".repeat(4 - (RAM.get.intMEM(0x01) + 255).toString(16).length) + (RAM.get.intMEM(0x01) + 255).toString(16)}.`);
        }
        catch (e) {
            console.log("There was an error outputting the error message (lolz). The code is " + errorCode + " and the address in offense is " + (RAM.get.intMEM(0x02)))
        }
        process.exit();
    };
    initializeArguments(amount) {
        for (RAM.set.intMEM(0x00, 0); RAM.get.intMEM(0x00) < amount; RAM.set.intMEM(0x00, RAM.get.intMEM(0x00) + 1)) { // loop to get certain amount of arguments for command
            RAM.set.intMEM(RAM.get.intMEM(0x00) + 3, RAM.RAMBlock[RAM.get.intMEM(0x01) + 256 + RAM.get.intMEM(0x00)]); // set $FF03+[$FF00] to argument for command
            // console.log( RAM.RAMBlock[RAM.get.intMEM(0x01) + 256+RAM.get.intMEM(0x00)]) debug lol
        }

        // this looks really complicated but it works i guess
    }
}
new Hatchback(); // run everything
