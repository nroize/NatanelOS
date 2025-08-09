/*
 * script.js
 *
 * Provides interactivity for the simplified NatanelOS site. Handles window
 * management (open, close, drag, z‑ordering), and implements a basic
 * command‑line interface inside the terminal window.
 */

// Keep track of the highest z‑index to bring windows to the front. Starting at
// 100 ensures windows appear above the dock (which has z-index 50) but below
// the top bar (z-index 1000).
let highestZ = 100;

/**
 * Initialize all interactive elements once the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', () => {

  // Query all elements that have a data-window attribute (icons and dock icons)
  const launcherElements = document.querySelectorAll('[data-window]');
  const windows = document.querySelectorAll('.window');

  // Map launcher elements to their corresponding windows
  launcherElements.forEach(el => {
    el.addEventListener('click', () => {
      const targetId = el.getAttribute('data-window');
      const win = document.getElementById(targetId);
      if (!win) return;
      // On small screens, hide all other windows before opening a new one
      if (window.innerWidth <= 600) {
        hideAllWindows();
      }
      // Show the window and bring it to front
      win.style.display = 'flex';
      // Center the window if it's hidden; randomize slight offset to avoid stacking
      if (!win.dataset.positioned) {
        // On small screens, align windows consistently rather than randomising their position.
        if (window.innerWidth <= 600) {
          // Use CSS percentages that mirror the mobile styles in the stylesheet.
          // This avoids awkward offsets when switching between windows on mobile.
          win.style.left = '5vw';
          win.style.top = '10vh';
        } else {
          // On larger screens, centre the window and apply a small random offset to
          // avoid stacking windows directly on top of each other.
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const width = win.offsetWidth;
          const height = win.offsetHeight;
          win.style.left = `${(viewportWidth - width) / 2 + Math.random() * 40 - 20}px`;
          win.style.top = `${(viewportHeight - height) / 2 + Math.random() * 40 - 20}px`;
        }
        win.dataset.positioned = 'true';
      }
      bringToFront(win);
    });
  });

  // Setup each window for dragging and closing
  windows.forEach(win => {
    const header = win.querySelector('.window-header');
    const closeBtn = win.querySelector('.window-close');
    if (header) {
      header.addEventListener('mousedown', (e) => startDrag(e, win));
    }
    if (closeBtn) {
      // Use both click and mousedown events to reliably close the window.
      // Some browsers may not dispatch click events on tiny elements inside
      // draggable headers, so handle mousedown as well. Stop propagation to
      // prevent triggering drag logic.
      const closeHandler = (e) => {
        e.stopPropagation();
        win.style.display = 'none';
        // Reset maximized state when closed so the window reopens at its original size
        win.dataset.maximized = 'false';
        delete win.dataset.prevLeft;
        delete win.dataset.prevTop;
        delete win.dataset.prevWidth;
        delete win.dataset.prevHeight;
      };
      closeBtn.addEventListener('click', closeHandler);
      closeBtn.addEventListener('mousedown', closeHandler);
    }

    // Attach individual handlers to the traffic lights. The red dot (button.window-close)
    // closes the window, the yellow dot minimizes (hides) the window, and the green dot
    // toggles maximized state.
    const yellow = win.querySelector('.traffic-dot.yellow');
    const green = win.querySelector('.traffic-dot.green');
    if (yellow) {
      yellow.addEventListener('click', (e) => {
        e.stopPropagation();
        win.style.display = 'none';
        // Reset maximized state when minimized so reopening restores the previous size
        win.dataset.maximized = 'false';
        delete win.dataset.prevLeft;
        delete win.dataset.prevTop;
        delete win.dataset.prevWidth;
        delete win.dataset.prevHeight;
      });
    }
    if (green) {
      green.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMaximize(win);
      });
    }
    // Bring to front when clicking anywhere inside the window
    win.addEventListener('mousedown', () => bringToFront(win));

    // Allow resizing when clicking near the bottom‑right corner even if the
    // dedicated resize handle is obscured (e.g. by scrollbars). If the
    // pointer is within a small threshold of the window's bottom‑right
    // edge, initiate resizing instead of other actions. This does not run
    // on small screens since resizing is disabled there.
    win.addEventListener('mousedown', (ev) => {
      // Ignore if we are on a small screen
      if (window.innerWidth <= 600) return;
      // If clicking on the header or the dedicated handle, let their own
      // listeners manage the event.
      const target = ev.target;
      // If the clicked element or one of its ancestors is the window header, skip resizing
      if (target && (target.closest && target.closest('.window-header'))) {
        return;
      }
      // Skip if clicking the dedicated resize handle; its own mousedown will trigger startResize
      if (target && target.classList && target.classList.contains('resize-handle')) {
        return;
      }
      const rect = win.getBoundingClientRect();
      // Increase the threshold to 60px to make it easier to grab the resize area
      // When the mouse down occurs within this many pixels of the
      // bottom‑right corner, resizing will start.
      const threshold = 60;
      if (ev.clientX >= rect.right - threshold && ev.clientY >= rect.bottom - threshold) {
        startResize(ev, win);
      }
    });

    // Handle resizing via the bottom‑right corner handle
    const handle = win.querySelector('.resize-handle');
    if (handle) {
      handle.addEventListener('mousedown', (e) => startResize(e, win));
    }
  });

  // Initialize terminal functionality
  setupTerminal();

  // Start the clock in the top bar
  startClock();

  // Setup dark/light theme toggle
  setupThemeToggle();

  // Setup resume open button to open the PDF in a new tab
  const resumeBtn = document.getElementById('resume-open-btn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      // Open the resume PDF in a new browser tab. The file should be located
      // relative to the site root (e.g. resume.pdf). If the file does not
      // exist, the browser will show a 404 page.
      window.open('Natanel_Roizenman_Resume.pdf', '_blank');
    });
  }

  // Automatically open the About window on page load so visitors are greeted
  // with an introduction. This mirrors the original NatanelOS behaviour where
  // an intro message is shown by default. We position the window using the
  // same logic as when a user manually opens it.
  const aboutWin = document.getElementById('about-window');
  if (aboutWin) {
    // Show and position if not already positioned
    aboutWin.style.display = 'flex';
    if (!aboutWin.dataset.positioned) {
      if (window.innerWidth <= 600) {
        aboutWin.style.left = '5vw';
        aboutWin.style.top = '10vh';
      } else {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const width = aboutWin.offsetWidth;
        const height = aboutWin.offsetHeight;
        aboutWin.style.left = `${(viewportWidth - width) / 2 + Math.random() * 40 - 20}px`;
        aboutWin.style.top = `${(viewportHeight - height) / 2 + Math.random() * 40 - 20}px`;
      }
      aboutWin.dataset.positioned = 'true';
    }
    bringToFront(aboutWin);
  }
});

/**
 * Initialize the theme toggle button. Applies saved preference from localStorage
 * and switches icons accordingly.
 */
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!toggleBtn || !icon) return;

  let isDark = false;
  // Load saved preference
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    isDark = true;
  }
  applyTheme();

  toggleBtn.addEventListener('click', () => {
    isDark = !isDark;
    applyTheme();
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  /**
   * Apply the current theme and update the toggle icon.
   */
  function applyTheme() {
    document.body.classList.toggle('dark', isDark);
    // Update the icon. When in dark mode show a sun to indicate switching back to light; otherwise show a moon.
    if (isDark) {
      icon.innerHTML = `<path d="M12 3a9 9 0 0 0 0 18 9 9 0 0 0 8.94-7.5A7 7 0 0 1 12 3z" />`;
      icon.setAttribute('stroke', '#eee');
    } else {
      // Sun icon
      icon.innerHTML = `
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2" />
        <path d="M12 21v2" />
        <path d="M4.22 4.22l1.42 1.42" />
        <path d="M18.36 18.36l1.42 1.42" />
        <path d="M1 12h2" />
        <path d="M21 12h2" />
        <path d="M4.22 19.78l1.42-1.42" />
        <path d="M18.36 5.64l1.42-1.42" />
      `;
      icon.setAttribute('stroke', '#333');
    }
  }
}

/**
 * Bring the given window element to the top of the stacking order.
 * @param {HTMLElement} win
 */
function bringToFront(win) {
  highestZ++;
  win.style.zIndex = highestZ;
}

/**
 * Hide all open windows. Used on small screens to show only one at a time.
 */
function hideAllWindows() {
  const windows = document.querySelectorAll('.window');
  windows.forEach(w => {
    w.style.display = 'none';
  });
}

/**
 * Start dragging a window when the header is pressed.
 * @param {MouseEvent} e
 * @param {HTMLElement} win
 */
function startDrag(e, win) {
  // Prevent dragging on small screens
  if (window.innerWidth <= 600) {
    return;
  }
  // Do not start dragging if the user clicked on the traffic lights or
  // the close button. This allows the red light to close without
  // inadvertently moving the window.
  const target = e.target;
  if (target.closest && target.closest('.traffic-lights')) {
    return;
  }
  if (target.classList && (target.classList.contains('window-close') || target.classList.contains('traffic-dot'))) {
    return;
  }
  e.preventDefault();
  bringToFront(win);
  const rect = win.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  function onMouseMove(ev) {
    win.style.left = `${ev.clientX - offsetX}px`;
    win.style.top = `${ev.clientY - offsetY}px`;
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

/**
 * Start resizing a window from its bottom‑right corner. This allows the user to
 * click and drag the resize handle to change the window's dimensions. Resizing
 * is disabled on small screens (≤600px) where windows are fixed size. The
 * function respects the window's CSS min-width and min-height values.
 * @param {MouseEvent} e
 * @param {HTMLElement} win
 */
function startResize(e, win) {
  // Do not allow resizing on small screens
  if (window.innerWidth <= 600) {
    return;
  }
  e.preventDefault();
  // Bring the window to the front while resizing
  bringToFront(win);
  const rect = win.getBoundingClientRect();
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = rect.width;
  const startHeight = rect.height;
  // Determine minimum allowed sizes from computed styles or fallback
  const style = getComputedStyle(win);
  const minWidth = parseInt(style.minWidth) || 200;
  const minHeight = parseInt(style.minHeight) || 150;

  function onMouseMove(ev) {
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    let newWidth = startWidth + dx;
    let newHeight = startHeight + dy;
    // Enforce minimum dimensions
    if (newWidth < minWidth) newWidth = minWidth;
    if (newHeight < minHeight) newHeight = minHeight;
    // Optionally clamp to viewport to prevent the window from getting too
    // large; subtract current left/top to avoid overshooting
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const left = rect.left;
    const top = rect.top;
    // Prevent window from overflowing the viewport (minus some margin)
    const maxWidth = viewportWidth - left - 20;
    const maxHeight = viewportHeight - top - 20;
    if (newWidth > maxWidth) newWidth = maxWidth;
    if (newHeight > maxHeight) newHeight = maxHeight;
    win.style.width = `${newWidth}px`;
    win.style.height = `${newHeight}px`;
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

/**
 * Toggle maximized state of a window. When maximized, the window expands to
 * fill most of the viewport. Clicking the green dot again restores its
 * previous size and position. Original values are stored in data attributes
 * on the window element.
 * @param {HTMLElement} win
 */
function toggleMaximize(win) {
  // Do not allow maximizing on small screens; windows already fill most of the viewport
  if (window.innerWidth <= 600) {
    return;
  }
  const isMax = win.dataset.maximized === 'true';
  if (!isMax) {
    // Save current position and size
    win.dataset.prevLeft = win.style.left;
    win.dataset.prevTop = win.style.top;
    win.dataset.prevWidth = win.style.width;
    win.dataset.prevHeight = win.style.height;
    // Expand to fill the viewport, leaving a small margin so it doesn't overlap
    // the top bar or dock too closely. Use percentages so resizing still works
    // when the viewport size changes.
    win.style.left = '5vw';
    win.style.top = '8vh';
    win.style.width = '90vw';
    win.style.height = '80vh';
    win.dataset.maximized = 'true';
    bringToFront(win);
  } else {
    // Restore previous dimensions and position
    if (win.dataset.prevLeft) win.style.left = win.dataset.prevLeft;
    if (win.dataset.prevTop) win.style.top = win.dataset.prevTop;
    if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
    if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
    win.dataset.maximized = 'false';
  }
}

/**
 * Setup the command‑line interface within the terminal window.
 */
function setupTerminal() {
  const inputField = document.getElementById('terminal-input-field');
  const outputArea = document.getElementById('terminal-output');
  const promptElem = document.getElementById('terminal-prompt');
  if (!inputField || !outputArea || !promptElem) return;

  // Terminal user and host names
  const username = 'guest';
  const hostname = 'NatOS';

  // Define a simple in-memory file system. Directories are represented by
  // objects; files are strings. The root (~) contains a few files and a
  // projects directory.
  const fileSystem = {
    // Top‑level files in the virtual home directory. Users can open these
    // with `cat about.txt` or `cat contact.txt` from the terminal.
    'about.txt':
      `Hi, I'm Natanel Roizenman! I'm a computer engineering student at the University of Waterloo passionate about embedded systems, low‑level programming and anything tech.`,
    'contact.txt':
      `GitHub: https://github.com/nroize\nLinkedIn: https://www.linkedin.com/in/natanel-roizenman/\nEmail: nroizenm@uwaterloo.ca`,
    // A directory called "projects" containing a file for each public project on my GitHub.
    // Each file holds a short blurb describing the project. These names match the
    // repository names found via the GitHub API. See the API citations for
    // descriptions: mosylite description lines【919531967399397†L31-L33】 and PyEdsby description lines【260151560758746†L31-L33】.
    projects: {
      'NatanelOS.txt':
        'NatanelOS – an interactive portfolio modelled to look like a browser‑based operating system. It features a command‑line terminal, windowed UI and even a file system for a playful introduction to my work.',
      'mosylite.txt':
        'Mosylite – a lightweight Python wrapper for the Mosyle Manager API used to integrate device management into custom scripts and automation pipelines.',
      'AimTrainer.txt':
        'AimTrainer – a simple aim training game written in Java to help improve mouse accuracy and reaction time. It was one of my early explorations into game development.',
      'PyEdsby.txt':
        'PyEdsby – a Python library for building integrations with the Edsby Student Information System, useful for automating interactions with school data.',
      'Birdfeeder-Code.txt':
        'Birdfeeder Code – embedded firmware and associated code for an automated bird feeder project built using microcontrollers and sensors.',
      'CFX800.txt':
        'CFX‑800 – a replacement PCB for the Casio DBC‑611 watch that adds CFX‑400‑like capabilities (e.g. scientific calculations, logarithms, etc.).'
    }
  };

  // Stack of directory names representing the current path relative to ~
  let pathStack = [];
  let currentDir = fileSystem;

  /**
   * Compute the present working directory in POSIX style (using ~ for root).
   * @returns {string}
   */
  function pwd() {
    return pathStack.length === 0 ? '~' : '~/' + pathStack.join('/');
  }

  /**
   * Update the terminal prompt based on the current working directory.
   */
  function updatePrompt() {
    promptElem.textContent = `${username}@${hostname} ${pwd()} %`;
  }

  updatePrompt();

  /**
   * Write a line of text to the terminal output.
   * @param {string} text
   */
  function writeToTerminal(text) {
    outputArea.textContent += text + '\n';
    // Scroll to bottom
    outputArea.parentNode.scrollTop = outputArea.parentNode.scrollHeight;
  }

  /**
   * Change directory to the given target. Supports '..' to go up one level.
   * Updates currentDir and pathStack accordingly.
   * @param {string} dir
   */
  function changeDirectory(dir) {
    if (dir === '..') {
      if (pathStack.length > 0) {
        pathStack.pop();
        // Recompute currentDir by traversing from root
        currentDir = fileSystem;
        for (const segment of pathStack) {
          currentDir = currentDir[segment];
        }
      }
      updatePrompt();
      return;
    }
    if (currentDir.hasOwnProperty(dir)) {
      const target = currentDir[dir];
      if (typeof target === 'object') {
        // Enter the directory
        pathStack.push(dir);
        currentDir = target;
        updatePrompt();
      } else {
        writeToTerminal(`cd: ${dir}: Not a directory`);
      }
    } else {
      writeToTerminal(`cd: ${dir}: No such directory`);
    }
  }

  /**
   * List the contents of the current directory.
   * @returns {string}
   */
  function listDirectory() {
    const entries = Object.keys(currentDir);
    return entries.join('  ');
  }

  /**
   * Print the contents of a file to the terminal.
   * @param {string} file
   */
  function catFile(file) {
    if (currentDir.hasOwnProperty(file)) {
      const target = currentDir[file];
      if (typeof target === 'string') {
        writeToTerminal(target);
      } else {
        writeToTerminal(`cat: ${file}: Is a directory`);
      }
    } else {
      writeToTerminal(`cat: ${file}: No such file`);
    }
  }

  /**
   * Helper to open a desktop window by id. Used by about/projects/contact commands.
   * @param {string} id
   */
  function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.style.display = 'flex';
    // If the window has not been positioned yet, center it
    if (!win.dataset.positioned) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = win.offsetWidth;
      const height = win.offsetHeight;
      win.style.left = `${(viewportWidth - width) / 2 + Math.random() * 40 - 20}px`;
      win.style.top = `${(viewportHeight - height) / 2 + Math.random() * 40 - 20}px`;
      win.dataset.positioned = 'true';
    }
    bringToFront(win);
  }

  // Define available commands and handlers. Each handler returns a string
  // or uses writeToTerminal directly. If undefined is returned, nothing
  // additional is printed.
  const commands = {
    help: () => [
      'Available commands:',
      '  help              Show this help message',
      '  ls                List directory contents',
      '  cd <dir>          Change directory',
      '  pwd               Print working directory',
      '  cat <file>        Display file contents',
      '  about             Open the About window',
      '  projects          Open the Projects window',
      '  contact           Open the Contact window',
      '  resume            Open the Resume window',
      '  clear             Clear the terminal'
    ].join('\n'),
    // Alias for help
    h: () => commands.help(),
    ls: () => listDirectory(),
    pwd: () => pwd(),
    cd: (args) => {
      if (!args[0]) {
        // cd with no args goes to home (~)
        pathStack = [];
        currentDir = fileSystem;
        updatePrompt();
        return;
      }
      changeDirectory(args[0]);
      return;
    },
    cat: (args) => {
      if (!args[0]) {
        writeToTerminal('cat: missing file operand');
        return;
      }
      catFile(args[0]);
      return;
    },
    about: () => {
      openWindow('about-window');
      return 'Opened About window.';
    },
    projects: () => {
      openWindow('projects-window');
      return 'Opened Projects window.';
    },
    contact: () => {
      // Open the Contact window on the desktop
      openWindow('contact-window');
      // Also print the contact information directly in the terminal so users
      // can copy it without needing to open the GUI. This includes GitHub,
      // LinkedIn and an email address.
      const contactInfo =
        'GitHub: https://github.com/nroize\n' +
        'LinkedIn: https://www.linkedin.com/in/natanel-roizenman/\n' +
        'Email: nroizenm@uwaterloo.ca';
      writeToTerminal(contactInfo);
      return 'Opened Contact window.';
    },
    resume: () => {
      openWindow('resume-window');
      return 'Opened Resume window.';
    },
    clear: () => {
      outputArea.textContent = '';
      return;
    }
  };

  // Focus the input field whenever the terminal window is clicked
  const terminalWindow = document.getElementById('terminal-window');
  if (terminalWindow) {
    terminalWindow.addEventListener('click', () => {
      inputField.focus();
    });
  }

  // Handle the Enter key for command execution
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = inputField.value.trim();
      if (input !== '') {
        writeToTerminal(`${promptElem.textContent} ${input}`);
        executeCommand(input);
      }
      inputField.value = '';
    } else if (e.key === 'Tab') {
      // Tab completion: attempt to auto-complete commands or filenames. Prevent
      // the default tab behaviour (moving focus) and generate suggestions.
      e.preventDefault();
      const inputStr = inputField.value;
      // Determine the position within the string (cursor index) to support
      // completing the last token the user is typing.
      const cursorPos = inputField.selectionStart;
      const beforeCursor = inputStr.slice(0, cursorPos);
      const afterCursor = inputStr.slice(cursorPos);
      // Split by whitespace to get tokens. We'll complete the last token before
      // the cursor. Use regex to collapse multiple spaces.
      const parts = beforeCursor.split(/\s+/);
      const lastToken = parts[parts.length - 1];
      const prefix = lastToken || '';
      // Determine context: if this is the first token, search commands and
      // directory names at root; otherwise if preceded by a command like cd or
      // cat, suggest files/directories in the current directory.
      let candidates = [];
      if (parts.length <= 1) {
        // At beginning of line: combine command names and top-level entries
        candidates = Object.keys(commands).concat(Object.keys(currentDir));
      } else {
        // Use the command (first token) to decide suggestions
        const cmdToken = parts[0];
        if (cmdToken === 'cd' || cmdToken === 'cat') {
          // Suggest directories/files from currentDir
          candidates = Object.keys(currentDir);
        } else {
          // Default: all commands
          candidates = Object.keys(commands);
        }
      }
      // Remove duplicate candidates
      candidates = Array.from(new Set(candidates));
      // Filter candidates by prefix
      const matches = candidates.filter(c => c.toLowerCase().startsWith(prefix.toLowerCase()));
      if (matches.length === 1) {
        // Single match: replace the last token with the match
        const completion = matches[0];
        // Rebuild the input string: everything before last token plus completion
        parts[parts.length - 1] = completion;
        const newBefore = parts.join(' ');
        inputField.value = newBefore + afterCursor;
        // Move cursor to end of completed token
        const newPos = newBefore.length;
        inputField.setSelectionRange(newPos, newPos);
      } else if (matches.length > 1) {
        // Multiple matches: list them in the terminal and leave input unchanged
        writeToTerminal(matches.join('    '));
      }
    }
  });

  /**
   * Execute a command string and display the result.
   * @param {string} inputStr
   */
  function executeCommand(inputStr) {
    const tokens = inputStr.split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1);
    if (commands.hasOwnProperty(cmd)) {
      const result = commands[cmd](args);
      if (typeof result === 'string' && result.length > 0) {
        writeToTerminal(result);
      }
    } else {
      writeToTerminal(`${cmd}: command not found`);
    }
  }

  // Initial greeting message
  writeToTerminal('Welcome to NatOS Terminal');
  writeToTerminal('Type "help" to see available commands.');
}

/**
 * Start the live clock shown in the top bar. Updates every minute.
 */
function startClock() {
  const clockElem = document.getElementById('topbar-time');
  if (!clockElem) return;
  function update() {
    const now = new Date();
    // Format the time as HH:MM in the user's locale
    clockElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  update();
  // Update every minute
  setInterval(update, 60000);
}
