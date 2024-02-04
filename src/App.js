import './App.css';
import { useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';

function App() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setLoading] = useState(true);

  const handleMessageChange = (event) => {
    const newMessage = event.target.value;
    if (newMessage.length <= 1500) {
      setMessage(newMessage);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      createPost();
    }
  };

  const createPost = () => {
    if (message) {
      setLoading(true);
      const post = {
        content: message,
        name: user.name,
        picture: user.picture
      };
      setMessage('');
      fetch(
        'https://f59jwytlp0.execute-api.eu-west-2.amazonaws.com/prod/posts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(post)
        }
      )
        .then((response) => {
          if (response.status === 200) {
            fetchData();
          } else {
            console.error("Error: Couldn't create post");
          }
        })
        .catch((error) => {
          console.error('Error: ', error);
        });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    fetch('https://f59jwytlp0.execute-api.eu-west-2.amazonaws.com/prod/posts')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        data.forEach((post) => {
          post.abridgement =
            post.content.length > 250 ? post.content.substring(0, 200) : '';
          post.expanded = false;
        });
        setData(data);
      })
      .catch((error) => {
        console.error('Error: ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCallbackResponse = (response) => {
    const user = jwt_decode(response.credential);
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    document.getElementById('google-sign-in').hidden = true;
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    document.getElementById('google-sign-in').hidden = false;
  };

  const expandPost = (id) => {
    const newData = [...data];
    const index = newData.findIndex((post) => post.id === id);
    if (index !== -1) {
      newData[index].expanded = !newData[index].expanded;
      setData(newData);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user));
    }

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
      google.accounts.id.renderButton(
        document.getElementById('google-sign-in'),
        {
          theme: 'outline',
          size: 'large'
        }
      );
      if (user) {
        document.getElementById('google-sign-in').hidden = true;
      }
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
          {!user && (
            <span className="welcome-text">
              Welcome to the club, buddy! Sign in to send messages.
            </span>
          )}
          {user && (
            <span className="welcome-text">
              Hello, {user.given_name}! Nice to see you.
            </span>
          )}
          <div className="sign-in-parent">
            <div id="google-sign-in" className="sign-in-child"></div>
          </div>
          {user && (
            <div className="input-child">
              <input
                className="minimal-input"
                type="text"
                name="message"
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyPress}
              />
              <button
                className="minimal-button"
                disabled={message.trim() === '' || isLoading}
                onClick={createPost}>
                Send
              </button>
              <button className="minimal-button" onClick={handleSignOut}>
                Quit
              </button>
            </div>
          )}
        </div>
        <div className="history-parent">
          {isLoading && (
            <div className="minimal-spinner-parent">
              <div className="minimal-spinner"></div>
            </div>
          )}
          {data && (
            <div className="post-list">
              {data.map((post, index) => (
                <div className="post-item" key={index}>
                  <div className="post-author">
                    <img
                      className="post-picture"
                      src={post.picture}
                      alt={post.name}
                    />
                    <div className="post-name">{post.name}</div>
                  </div>
                  <div className="post-message">
                    <div className="post-content">
                      {post.abridgement && !post.expanded
                        ? post.abridgement + '...'
                        : post.content}
                    </div>
                    <div className="post-footer">
                      <div className="post-duration">{post.duration}</div>
                      {post.abridgement && (
                        <button
                          className="post-control"
                          onClick={() => expandPost(post.id)}>
                          {post.expanded ? 'show less' : 'show more'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
