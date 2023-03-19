const version = "NatanelOS [Version 0.0.0.1]";
const directory = "C:\\users\\guest";
const asciiArt = "  _   _       _                   _ \n | \\ | |     | |                 | |\n |  \\| | __ _| |_ __ _ _ __   ___| |\n | . ` |/ _` | __/ _` | '_ \\ / _ \\ |\n | |\\  | (_| | || (_| | | | |  __/ |\n |_| \\_|\\__,_|\\__\\__,_|_| |_|\\___|_| ";
const intro = "Hi, I'm Natanel Roizenman! Welcome to NatanelOS, my portfolio website. I'm a computer engineering student at the University of Waterloo. I'm passionate about embedded systems, low-level programming, and anything tech. If you want to send me an email, type 'contact'.\n\nType 'help' to see what other commands are available. Have fun exploring my site!";
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

const commands = {
    contact: () => {
        window.open("mailto:nroizenm@uwaterloo.ca", "_blank").focus();
    },
    intro: () => {
        print(intro);
    },
    ls: () => {
        for (const project in projects) {
            print(project);
        }
    },
    cd: (project_name) => commands.project(project_name),
    projects: (project_name="") => {
        if (project_name.length == 0) {
            commands.ls();
            return;
        }
        commands.project(project_name);
    },
    project: (project_name) => {
        if (!(project_name in projects)) {
            print("Sorry, that project doesn't exist. If you think it's something I should work on, feel free to leave a suggestion for me using the contact command.\n\nTo get a list of all projects, type 'projects'.");
            return;
        }
        print(projects[project_name].description);
        print("Technologies used:")
        for (const tech of projects[project_name].stack) {
            print(` • ${tech}`);
        }
    },
    resume: () => {
        window.open("Natanel Roizenman resume.pdf", "_blank").focus();
    },
    git: (project_name) => {
        let url = projects[project_name].link || "";
        if (url) {
            print("Opening in a new window...");
            window.open(projects[project_name].link, "_blank").focus();
        } else {
            print("There is no GitHub link available for this project.");
        }
    },
    birds : () => {
        window.open("https://instagram.com/nroize", "_blank").focus();
    },
    linkedin : () => {
        window.open("https://linkedin.com/in/nroize", "_blank").focus();
    },
	help: () => {
		print("Available commands:");
        print(" • resume – Opens my resume.");
        print(" • linkedin - Opens my LinkedIn.");
        print(" • projects project_name - Gives a list of my projects if no name is provided. Otherwise, gives a detailed description of the project, including technologies used.");
        print(" • git project_name - Opens the GitHub page for the project, if it exists.");
		print(" • birds - See my bird photography (Instagram).")
        print(" • contact - Reach me via email.");
        print(" • intro - See the intro message again.");
        print(" • ver - Display the version of NatanelOS.");
		print(" • help - Displays available commands.");
	},
    ilysm: () => {
        print("I love you too :)");
    },
    ver: () => {
		print(version);
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
        print("Hello, Elliot.")
    },
    helloworld: () => {
        print("Hello, World!");
    }
};

function handleCommand(input) {
	const args = input.split(/\s+/);
	const cmd = args.shift().toLowerCase();
	if (commands.hasOwnProperty(cmd)) {
		commands[cmd](args);
	} else if (input.trim() === "") {
		// Do nothing
	} else {
		print(`'${cmd}' is not recognized as an internal or external command, operable program or batch file.`);
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

function resizeTerminal() {
    const windowHeight = window.innerHeight;
    const promptContainerHeight = document.getElementById("prompt-container").offsetHeight;
    const inputContainerHeight = document.getElementById("input-container").offsetHeight;
    const terminal = document.getElementById("terminal");
    const inputContainer = document.getElementById("input-container");

    terminal.style.height = `${windowHeight - promptContainerHeight - inputContainerHeight}px`;
    terminal.style.paddingBottom = `${promptContainerHeight - 10}px`;
    inputContainer.style.top = `${terminal.offsetHeight}px`;
}


resizeTerminal();
window.addEventListener("resize", resizeTerminal);
  

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("input");
    const prompt = document.getElementById("prompt");
    print(version);
    print(asciiArt);
    print(intro);
  
    input.focus();
    prompt.innerText = `${directory}>`;
  
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
        prompt.innerText = `${directory}>`;
        input.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
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
  