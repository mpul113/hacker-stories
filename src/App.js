import * as React from 'react';

const initialStories = [
  {
    title: 'React, ',
    url: 'https://reactjs.org/, ',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux, ',
    url: 'https://redux.js.org/, ',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  }
];

const getAsyncStories = () => 
   new Promise((resolve) =>
     setTimeout(
       () => resolve({ data: { stories: initialStories } }),
       2000
     )
  );
  //new Promise((resolve, reject) => setTimeout(reject, 2000));

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

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    'search',
    'React'
  );

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );
  // const [isLoading, setIsLoading] = React.useState(false);
  // const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    dispatchStories({ type: ACTION_TYPES.STORIES_FETCH_INIT});

    getAsyncStories().then(result => {
      dispatchStories({
        type: ACTION_TYPES.STORIES_FETCH_SUCCESS,
        payload: result.data.stories,
      });
    })
    .catch(() => 
      dispatchStories({ type: ACTION_TYPES.STORIES_FETCH_FAILURE })
      );
  }, []);

  //const [stories, setStories] = React.useState(initialStories);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: ACTION_TYPES.REMOVE_STORY,
      payload: item,
    });
  };

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.data.filter((story) => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            list={searchedStories} 
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
