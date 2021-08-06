import * as React from 'react';



const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};


const ACTION_TYPES = Object.freeze({
  SET_STORIES: 'SET_STORIES',
  REMOVE_STORY: 'REMOVE_STORY',
  STORIES_FETCH_INIT: 'STORIES_FETCH_INIT',
  STORIES_FETCH_SUCCESS: 'STORIES_FETCH_SUCCESS',
  STORIES_FETCH_FAILURE: 'STORIES_FETCH_FAILURE',
});

const storiesReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.STORIES_FETCH_INIT: 
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case ACTION_TYPES.STORIES_FETCH_SUCCESS: 
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case ACTION_TYPES.STORIES_FETCH_FAILURE: 
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case ACTION_TYPES.REMOVE_STORY: 
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

const API_ENDPOINT = 'http://hn.algolia.com/api/v1/search?query=';

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    ''
  );

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  React.useEffect(() => {
    if (!searchTerm) return;

    dispatchStories({ type: ACTION_TYPES.STORIES_FETCH_INIT});

    fetch(`${API_ENDPOINT}${searchTerm}`)
    .then((response) => response.json())
    .then((result) => {
      dispatchStories({
        type: ACTION_TYPES.STORIES_FETCH_SUCCESS,
        payload: result.hits,
      });
    })
    .catch(() => 
    dispatchStories({ type: ACTION_TYPES.STORIES_FETCH_FAILURE })
    );
  }, [searchTerm]);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: ACTION_TYPES.REMOVE_STORY,
      payload: item,
    });
  };

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  };

  return (
      <div>
        <h1>My Hacker Stories</h1>

        <InputWithLabel 
          id="search" 
          value={searchTerm}
          isFocused
          onInputChange={handleSearch}
        >
          <strong>Search:</strong>
        </InputWithLabel>

        <hr />

        {stories.isError && <p>Something went wrong...</p>}

        {stories.isLoading ? (
          <p>Loading...</p>
        ) : (
          <List 
            list={stories.data} 
            onRemoveItem={handleRemoveStory} 
          />
        )}
      </div>
  );
};

const InputWithLabel = ({ id, value, onInputChange, type = 'text', children, isFocused }) => {
  // A
  const inputRef = React.useRef();
  
  // C
  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      // D
      inputRef.current.focus();
    }
  }, [isFocused])
  
  return (  
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      {/* B */}
      <input
        ref={inputRef} 
        id={id} 
        type={type}
        value={value} 
        autofocus={isFocused}
        onChange={onInputChange} 
      />
    </>
  );
};

const List = ({ list, onRemoveItem }) => (
    <ul>
        {list.map((item) => (
          <Item 
            key={item.objectID} 
            item={item}
            onRemoveItem={onRemoveItem} 
          />
        ))}
      </ul>
);

const Item = ({ item, onRemoveItem }) => {
  return (
    <li>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </li>
  );
};

export default App;
