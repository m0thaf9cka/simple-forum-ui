import './App.css';
import { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';

function App() {

  const [user, setUser] = useState(null);

  const handleCallbackResponse = (response) => {
    const userObject = jwt_decode(response.credential);
    setUser(userObject);
    document.getElementById("signInDiv").hidden = true;
  };

  const handleSignOut = (e) => {
    setUser(null);
    document.getElementById("signInDiv").hidden = false;
  };

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: "138713330475-vku7k9i9kjder2llolqsrudvl4b0lvau.apps.googleusercontent.com",
      callback: handleCallbackResponse
    });
    window.google.accounts.id.renderButton(
      document.getElementById("signInDiv"), {
        theme: "outline", size: "large"
      }
    );
  }, []);

  return (
    <div className="App">
      {!user && <h1>Welcome, stranger! Please, sign in!</h1>}
      <div id="signInDiv"></div>
      {user &&
        <div>
          <h1>Nice to see you, {user.name}!</h1>
          <img src={user.picture} alt={user.name}/>
        </div>
      }
      {user &&
        <button onClick={(e) => handleSignOut(e)}>Sign Out</button>
      }
    </div>
  );
}

export default App;
