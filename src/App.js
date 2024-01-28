import './App.css';
import { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';

function App() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  const handleMessageChange = (event) => {
    const newMessage = event.target.value;
    if (newMessage.length <= 300) {
      setMessage(newMessage);
    }
  };

  const createPost = () => {
    if (message) {
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
            fetchData();
          } else {
            console.error('Error: Couldn\'t create post');
          }
        })
        .catch(error => {
          console.error('Error: ', error);
        });
    }
  };

  const fetchData = async () => {
    fetch('https://f59jwytlp0.execute-api.eu-west-2.amazonaws.com/prod/posts')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((error) => {
        console.error('Error: ', error);
      });
  };

  const handleCallbackResponse = (response) => {
    const userObject = jwt_decode(response.credential);
    setUser(userObject);
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
                className="minimal-input"
                type="text"
                name="message"
                value={message}
                onChange={handleMessageChange}
              />
              <button className="minimal-button" disabled={message.trim() === ''} onClick={createPost}>Send</button>
              <button className="minimal-button" onClick={handleSignOut}>Quit</button>
            </div>
          }
        </div>
        <div className="history-parent">
          {data &&
            <div className="post-list">
              {data.map((post, index) => (
                <div className="post-item" key={index}>
                  <div className="post-author">
                    <img className="post-picture"
                         src={post.picture}
                         alt={post.name}
                    />
                    <div className="post-name">{post.name}</div>
                  </div>
                  <div className="post-message">
                    <div className="post-content">{post.content}</div>
                    <div className="post-date">{post.formattedDate}</div>
                  </div>
                </div>
              ))}
            </div>
          }
          {!data &&
            <div className="history-child">No messages yet :(</div>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
