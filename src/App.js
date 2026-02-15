import './App.css';

function App() {
  return (
    <div className="App">
      <div className="gif-container">
        <img
          src={process.env.PUBLIC_URL + '/Comp_setup_composition_202602151359.gif'}
          alt="Composition Setup GIF"
          className="gif-item"
        />
        <img
          src={process.env.PUBLIC_URL + '/kling_20260214_VIDEO_Create_a_s_1113_01-ezgif.com-video-to-gif-converter.gif'}
          alt="Kling Video GIF"
          className="gif-item"
        />
      </div>
    </div>
  );
}

export default App;
