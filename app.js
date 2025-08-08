const { useState, useEffect } = React;

function App() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isCli, setIsCli] = useState(false);
  const [isDark, setIsDark] = useState(prefersDark);

  useEffect(() => {
    const cli = document.getElementById('cli-container');
    if (cli) {
      cli.classList.toggle('hidden', !isCli);
    }
    document.body.className = isCli
      ? 'min-h-screen bg-black text-green-400 font-mono'
      : 'min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100';
    }, [isCli]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <>
        <button
          id="theme-toggle"
          className="fixed top-4 left-4 z-50 rounded-md bg-gray-200 px-4 py-2 text-gray-800 shadow hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          id="mode-toggle"
          className="fixed top-4 right-4 z-50 rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={() => setIsCli(!isCli)}
        >
          {isCli ? 'Switch to GUI' : 'Switch to CLI'}
        </button>
      {!isCli && (
        <div className="mx-auto mt-16 max-w-3xl rounded-xl bg-white shadow-lg dark:bg-gray-800">
          <div className="flex items-center h-8 rounded-t-xl bg-gray-200 px-3 dark:bg-gray-700">
            <div className="flex space-x-2">
              <span className="h-3 w-3 rounded-full bg-red-500"></span>
              <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
            </div>
            <div className="flex-1 text-center text-sm text-gray-600 dark:text-gray-300">NatanelOS</div>
          </div>
          <div className="p-6">
            <h1 className="mb-4 text-2xl font-semibold">NatanelOS</h1>
            <p className="mb-4">Hi, I'm Natanel Roizenman! Welcome to the graphical interface of my portfolio site.</p>
            <h2 className="mb-2 text-xl font-medium">Projects</h2>
            <ul className="mb-4 list-disc space-y-1 pl-5">
              <li><a className="text-blue-600 hover:underline dark:text-blue-400" href="https://github.com/nroize/Erdur">Erdur</a></li>
              <li><a className="text-blue-600 hover:underline dark:text-blue-400" href="https://github.com/chtzvt/PyEdsby">PyEdsby</a></li>
              <li><a className="text-blue-600 hover:underline dark:text-blue-400" href="https://github.com/nroize/Birdfeeder-Code">Birdfeeder</a></li>
              <li><a className="text-blue-600 hover:underline dark:text-blue-400" href="https://github.com/nroize/AimTrainer">AimTrainer</a></li>
            </ul>
            <p>For a more retro experience, switch to the CLI.</p>
          </div>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
