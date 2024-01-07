import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    fetch('https://g3y4lpfosi.execute-api.eu-west-2.amazonaws.com/prod/posts')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Extract JSON from the response
      })
      .then(data => {
        console.log(data);
        setData(data);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  };

  return (
    <div className="App">
      <h1>API Response:</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
