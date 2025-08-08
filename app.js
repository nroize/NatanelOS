const { useState, useEffect } = React;

function App() {
  const [isCli, setIsCli] = useState(false);

  useEffect(() => {
    const cli = document.getElementById('cli-container');
    if (cli) {
      cli.style.display = isCli ? 'block' : 'none';
      if (isCli && typeof resizeTerminal === 'function') {
        resizeTerminal();
      }
    }
    document.body.className = isCli ? 'cli-mode' : 'gui-mode';
  }, [isCli]);

  return (
    <>
      <button id="mode-toggle" onClick={() => setIsCli(!isCli)}>
        {isCli ? 'GUI Mode' : 'CLI Mode'}
      </button>
      {!isCli && (
        <div className="gui-window">
          <div className="title-bar">
            <div className="traffic-lights">
              <span className="close"></span>
              <span className="minimize"></span>
              <span className="fullscreen"></span>
            </div>
          </div>
          <div className="window-content">
            <h1>NatanelOS</h1>
            <p>Hi, I'm Natanel Roizenman! Welcome to the graphical interface of my portfolio site.</p>
            <h2>Projects</h2>
            <ul>
              <li><a href="https://github.com/nroize/Erdur">Erdur</a></li>
              <li><a href="https://github.com/chtzvt/PyEdsby">PyEdsby</a></li>
              <li><a href="https://github.com/nroize/Birdfeeder-Code">Birdfeeder</a></li>
              <li><a href="https://github.com/nroize/AimTrainer">AimTrainer</a></li>
            </ul>
            <p>For a more retro experience, switch to the CLI.</p>
          </div>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
