const version = "NatanelOS 0.0.0.3";
const user = "guest";
const machine = "NatanelOS";
const directory = "~";
const asciiArt = "  _   _       _                   _ \n | \\ | |     | |                 | |\n |  \\| | __ _| |_ __ _ _ __   ___| |\n | . ` |/ _` | __/ _` | '_ \\ / _ \\ |\n | |\\  | (_| | || (_| | | | |  __/ |\n |_| \\_|\\__,_|\\__\\__,_|_| |_|\\___|_| ";
const intro = "Hi, I'm Natanel Roizenman! Welcome to NatanelOS, my portfolio website. I'm a computer engineering student at the University of Waterloo. I'm passionate about embedded systems, low-level programming, and anything tech. If you want to send me an email, type 'contact'.\n\nType 'help' or 'h' to see what other commands are available. Have fun exploring my site!";
var prevCommands = [];
var commandPlace = -1;

const projects = {
    ereader: {
        description: "In my high school engineering course, my partner and I were tasked with designing a product for our summative project. We chose to create an ereader, affectionately named the 'Erdur', utilizing a Raspberry Pi Pico microcontroller and a 1.54\" WaveShare e-ink display - the most affordable option we could find. The device is capable of reading txt files stored on an SD card and displaying them on the screen with pagination. During the project, I took on most of the programming and soldering tasks, while my partner focused on designing and 3D printing a case. We used C++ as the primary programming language, git for version management, and utilized a Makefile to structure the project. Despite the stress, we were able to complete the project in under two weeks, and it remains the most fulfilling project I worked on in high school. It continues to function to this day!",
        stack: [
            "C++",
            "Makefile",
            "Raspberry Pi Pico",
            "git"
        ]
    },
    pyedsby: {
        description: "I played a crucial role in reviving and maintaining PyEdsby, a Python-based API wrapper for the Edsby learning management service. Along with maintaining the tool, I introduced new and improved functionality by developing new features, improving the user interface, and implementing performance optimizations, which helped to enhance the user experience and increase the overall effectiveness of the tool.",
        stack: [
            "Python",
            "requests",
            "git"
        ],
        link: "https://github.com/chtzvt/PyEdsby"
    },
    birdfeeder: {
        description: "During my first year design project at the University of Waterloo, my partner and I developed an automated bird feeder. The feeder's control system utilized an STM32 microcontroller to regulate a small servo that dispenses seeds. While my partner constructed the body of the feeder, I was responsible for the wiring and coding. The code was entirely written in C++.",
        stack: [
            "C++",
            "STM32",
            "STM32Cube HAL",
            "git"
        ],
        link: "https://github.com/nroize/Birdfeeder-Code"
    },
    aimtrainer: {
        description: "During my high school computer science course, I developed an aim training game using Java. The game was built entirely using object-oriented programming principles, with a user interface created using Swing.",
        stack: [
            "Java",
            "Swing",
            "git"
        ],
        link: "https://github.com/nroize/AimTrainer"
    },
    natanelos: {
        description: "This website!",
        stack: [
            "JavaScript",
            "HTML/CSS",
            "Netlify",
            "git"
        ],
        link: "https://github.com/nroize/NatanelOS"
    }
};
const resources = {
    resume: "NatanelRoizenman.pdf",
    linkedin: "https://linkedin.com/in/nroize",
    birds: "https://instagram.com/nroize",
    contact: "mailto:nroizenm@uwaterloo.ca"
};

const commands = {
    help: () => {
        print("Available commands:");
        print(" • ls – list projects");
        print(" • cat <project> – show project details");
        print(" • open <project|resume|linkedin|birds|contact> – open link in new tab");
        print(" • clear – reset the terminal");
        print(" • contact – reach me via email");
        print(" • intro – show the intro message");
        print(" • ver – display the version of NatanelOS");
    },
    ls: () => {
        Object.keys(projects).forEach(p => print(p));
    },
    cat: ([name]) => {
        if (!name || !projects[name]) {
            print("usage: cat <project>");
            return;
        }
        print(projects[name].description);
        print("Technologies used:");
        for (const tech of projects[name].stack) {
            print(` • ${tech}`);
        }
    },
    open: ([name]) => {
        if (!name) {
            print("usage: open <project|resource>");
            return;
        }
        if (projects[name] && projects[name].link) {
            window.open(projects[name].link, "_blank").focus();
            print("Opening in a new tab...");
        } else if (resources[name]) {
            window.open(resources[name], "_blank").focus();
            print("Opening in a new tab...");
        } else {
            print("No link available for " + name + ".");
        }
    },
    resume: () => commands.open(["resume"]),
    linkedin: () => commands.open(["linkedin"]),
    birds: () => commands.open(["birds"]),
    contact: () => {
        window.open(resources.contact, "_blank").focus();
    },
    clear: () => {
        document.getElementById("terminal").innerText = "";
        print(version);
        print(asciiArt);
        print(intro);
    },
    echo: (args) => {
        print(args.join(" "));
    },
    intro: () => {
        print(intro);
    },
    ver: () => {
        print(version);
    },
    ilysm: () => {
        print("I love you too :)");
    },
    vim: () => {
        print("emacs better.");
    },
    nano: () => {
        print("vim better.");
    },
    emacs: () => {
        print("vim better.");
    },
    whoami: () => {
        print("Hello, Elliot.");
    },
    helloworld: () => {
        print("Hello, World!");
    }
};

const aliases = {
    r: "resume",
    l: "linkedin",
    b: "birds",
    c: "contact",
    v: "ver",
    h: "help",
    o: "open"
};

const allCommands = [...new Set([...Object.keys(commands), ...Object.keys(aliases)])];

function longestCommonPrefix(arr) {
    if (arr.length === 0) return "";
    let prefix = arr[0];
    for (let i = 1; i < arr.length; i++) {
        while (!arr[i].startsWith(prefix)) {
            prefix = prefix.slice(0, -1);
            if (prefix === "") return "";
        }
    }
    return prefix;
}

function handleCommand(input) {
	const args = input.split(/\s+/);
	let cmd = args.shift().toLowerCase();

    if (aliases.hasOwnProperty(cmd)) {
        cmd = aliases[cmd];
    }

	if (commands.hasOwnProperty(cmd)) {
		commands[cmd](args);
	} else if (input.trim() === "") {
		// Do nothing
          } else {
                  print(`zsh: command not found: ${cmd}`);
          }
}

function print(text, command="") {
    const terminal = document.getElementById("terminal");
    const pre = document.createElement("pre");
    const span = document.createElement("span");
   
    pre.innerText = text;
    pre.style.whiteSpace = "pre-wrap";

    span.style.color = "#0f0";
    span.innerText = command;
    pre.appendChild(span);

    terminal.appendChild(pre);
    terminal.scrollTop = terminal.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("input");
    const prompt = document.getElementById("prompt");
    print(version);
    print(asciiArt);
    print(intro);
  
    input.focus();
      prompt.innerText = `${user}@${machine} ${directory} %`;
  
    document.addEventListener("click", (event) => {
      if (!prompt.contains(event.target)) {
        input.focus();
      }
    });

  
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const command = input.innerText.trim();
        input.innerText = "";
        print(`${prompt.innerText}`, ` ${command}`);
        handleCommand(command);
        prevCommands.push(command);
        commandPlace = -1;
          prompt.innerText = `${user}@${machine} ${directory} %`;
        input.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      }

      if (event.key === "Tab") {
        event.preventDefault();
        const text = input.innerText;
        const parts = text.split(/\s+/);
        const current = parts.pop().toLowerCase();
        let matches = [];
        if (parts.length === 0) {
          matches = allCommands.filter(cmd => cmd.startsWith(current));
        } else {
          const cmd = aliases[parts[0]] ? aliases[parts[0]] : parts[0];
          if (["cat", "open"].includes(cmd)) {
            matches = Object.keys(projects);
            if (cmd === "open") {
              matches = matches.concat(Object.keys(resources));
            }
            matches = matches.filter(p => p.startsWith(current));
          }
        }
        if (matches.length === 1) {
          parts.push(matches[0]);
          input.innerText = parts.join(" ") + (text.endsWith(" ") ? "" : " ");
        } else if (matches.length > 1) {
          const prefix = longestCommonPrefix(matches);
          parts.push(prefix);
          input.innerText = parts.join(" ");
          print(matches.join('    '));
        }
        const range = document.createRange();
        range.selectNodeContents(input);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }

      if (event.key === "ArrowUp") {
        if (commandPlace <= 0) {
            commandPlace = prevCommands.length - 1;
        } else {
            commandPlace -= 1;
        }
        input.innerText = prevCommands[commandPlace];
      }

      if (event.key === "ArrowDown") {
        if (commandPlace >= (prevCommands.length - 1)) {
            commandPlace = 0;
        } else {
            commandPlace += 1;
        }
        input.innerText = prevCommands[commandPlace];
      }
    });
  });
