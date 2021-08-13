import * as React from 'react';
import axios from 'axios';



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
    'React'
  );

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
  );

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: ACTION_TYPES.STORIES_FETCH_INIT});

    const result = await axios.get(url);

    try {
      dispatchStories({
        type: ACTION_TYPES.STORIES_FETCH_SUCCESS,
        payload: result.data.hits,
      });
    } catch { 
      dispatchStories({type: 'STORIES_FETCH_FAILURE'});
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: ACTION_TYPES.REMOVE_STORY,
      payload: item,
    });
  };

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  };

  return (
      <div>
        <h1>My Hacker Stories</h1>

        <InputWithLabel 
          id="search" 
          value={searchTerm}
          isFocused
          onInputChange={handleSearchInput}
        >
          <strong>Search:</strong>
        </InputWithLabel>

        <button 
          type="button"
          disabled={!searchTerm}
          onClick={handleSearchSubmit}
        >
            Submit
          </button>

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
