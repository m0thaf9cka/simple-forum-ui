import './App.css';
import { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';

function App() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const createPost = () => {
    const post = {
      content: message,
      name: user.name,
      picture: user.picture
    };
    setMessage('');
    fetch('https://f59jwytlp0.execute-api.eu-west-2.amazonaws.com/prod/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    })
      .then(response => {
        if (response.status === 200) {
          console.log('Post request successful');
          fetchData();
        } else {
          console.error('Post request failed with status:', response.status);
        }
      })
      .catch(error => {
        console.error('Error making POST request:', error);
      });
  };

  const fetchData = async () => {
    fetch('https://f59jwytlp0.execute-api.eu-west-2.amazonaws.com/prod/posts')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setData(data);
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
      });
  };

  const handleCallbackResponse = (response) => {
    const userObject = jwt_decode(response.credential);
    setUser(userObject);
    console.log(userObject);
    document.getElementById('google-sign-in').hidden = true;
  };

  const handleSignOut = () => {
    setUser(null);
    document.getElementById('google-sign-in').hidden = false;
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    fetchData();

    script.onload = () => {
      const google = window.google;
      google.accounts.id.initialize({
        client_id:
          '138713330475-vku7k9i9kjder2llolqsrudvl4b0lvau.apps.googleusercontent.com',
        callback: handleCallbackResponse
      });
      google.accounts.id.renderButton(document.getElementById('google-sign-in'), {
        theme: 'outline',
        size: 'large'
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="app-parent">
      <div className="app-child">
        <div className="input-parent">
          {!user &&
            <span className="welcome-text">
              Welcome, stranger! Sign in to send messages.
            </span>
          }
          {user &&
            <span className="welcome-text">
              Hello, {user.given_name}! Nice to see you.
            </span>
          }
          <div className="sign-in-parent">
            <div id="google-sign-in" className="sign-in-child"></div>
          </div>
          {user &&
            <div className="input-child">
              <input
                type="text"
                name="message"
                value={message}
                onChange={handleMessageChange}
              />
              <button onClick={createPost}>Send</button>
              <button onClick={handleSignOut}>Quit</button>
            </div>
          }
        </div>
        <div className="chat-parent">
          {data &&
            <div>
              {data.map((message, index) => (
                <div key={index}>{message.content}</div>
              ))}
            </div>
          }
          {!data &&
            <div>No messages yet :(</div>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
